package com.stresslab.engine;

import com.stresslab.dto.LiveMetricPayload;
import com.stresslab.model.*;
import com.stresslab.repository.TestMetricRepository;
import com.stresslab.repository.TestRunRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

@Component
@RequiredArgsConstructor
@Slf4j
public class LoadTestEngine {

    private final SimpMessagingTemplate messagingTemplate;
    private final TestRunRepository testRunRepository;
    private final TestMetricRepository testMetricRepository;
    
    private final ConcurrentHashMap<Long, RunContext> activeRuns = new ConcurrentHashMap<>();

    public static class RunContext {
        public final AtomicBoolean cancelled = new AtomicBoolean(false);
        public final CountDownLatch latch;
        public final ExecutorService executor;
        public final ScheduledExecutorService scheduler;
        public final ScheduledFuture<?> metricTask;

        public RunContext(CountDownLatch latch, ExecutorService executor, ScheduledExecutorService scheduler, ScheduledFuture<?> metricTask) {
            this.latch = latch;
            this.executor = executor;
            this.scheduler = scheduler;
            this.metricTask = metricTask;
        }
    }

    public boolean abortRun(Long runId) {
        RunContext ctx = activeRuns.remove(runId);
        if (ctx != null) {
            ctx.cancelled.set(true);
            if (ctx.metricTask != null) {
                ctx.metricTask.cancel(true);
            }
            ctx.executor.shutdownNow();
            ctx.scheduler.shutdownNow();
            while (ctx.latch.getCount() > 0) {
                ctx.latch.countDown();
            }
            return true;
        }
        return false;
    }

    public void execute(Long runId, TestConfig config) {
        int concurrentUsers = config.getConcurrentUsers();
        int totalRequests   = config.getTotalRequests();

        // Fetch and mark RUNNING
        TestRun run = testRunRepository.findById(runId)
                .orElseThrow(() -> new RuntimeException("Run not found: " + runId));
        run.setStatus(RunStatus.RUNNING);
        run.setStartedAt(LocalDateTime.now());
        testRunRepository.save(run);

        ExecutorService executor  = Executors.newFixedThreadPool(concurrentUsers);
        ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

        AtomicInteger requestsSent = new AtomicInteger(0);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount    = new AtomicInteger(0);

        ConcurrentLinkedQueue<Long>    windowLatencies = new ConcurrentLinkedQueue<>();
        ConcurrentLinkedQueue<Boolean> windowResults   = new ConcurrentLinkedQueue<>();
        List<Long> allLatencies = Collections.synchronizedList(new ArrayList<>());

        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();

        CountDownLatch latch = new CountDownLatch(totalRequests);
        AtomicInteger requestsRemaining = new AtomicInteger(totalRequests);

        final long[] second = {0};

        ScheduledFuture<?> metricTask = scheduler.scheduleAtFixedRate(() -> {
            second[0]++;

            List<Long> sample = new ArrayList<>();
            Long l; while ((l = windowLatencies.poll()) != null) sample.add(l);

            int winOk = 0, winFail = 0;
            Boolean r; while ((r = windowResults.poll()) != null) { if (r) winOk++; else winFail++; }

            double avgWindow = sample.isEmpty() ? 0 :
                    sample.stream().mapToLong(Long::longValue).average().orElse(0);

            int sent = requestsSent.get();
            int suc  = successCount.get();
            double sr = sent == 0 ? 100.0 : Math.round(suc * 1000.0 / sent) / 10.0;

            LiveMetricPayload payload = LiveMetricPayload.builder()
                    .runId(runId).second(second[0])
                    .requestsSent(sent).successCount(suc).failCount(failCount.get())
                    .successRate(sr)
                    .avgResponseTime(Math.round(avgWindow * 10.0) / 10.0)
                    .requestsInWindow(sample.size())
                    .activeUsers(sent < totalRequests ? concurrentUsers : 0)
                    .status("RUNNING")
                    .build();

            messagingTemplate.convertAndSend("/topic/run/" + runId, payload);

            if (!sample.isEmpty()) {
                try {
                    // getReferenceById creates a proxy with just the FK — no detached-entity issues
                    TestRun ref = testRunRepository.getReferenceById(runId);
                    TestMetric metric = TestMetric.builder()
                            .run(ref).sampledAt(LocalDateTime.now())
                            .activeUsers(concurrentUsers)
                            .requestsInWindow(sample.size())
                            .avgResponseTime(avgWindow)
                            .errorCount(winFail).successCount(winOk)
                            .build();
                    testMetricRepository.save(metric);
                } catch (Exception ex) {
                    log.warn("Metric save failed at second {}: {}", second[0], ex.getMessage());
                }
            }
        }, 1, 1, TimeUnit.SECONDS);

        RunContext ctx = new RunContext(latch, executor, scheduler, metricTask);
        activeRuns.put(runId, ctx);

        try {
            for (int i = 0; i < concurrentUsers; i++) {
                long delayMs = config.getRampUpSeconds() > 0 ? (long) i * config.getRampUpSeconds() * 1000 / concurrentUsers : 0;
                scheduler.schedule(() -> {
                    executor.submit(() -> {
                        while (requestsRemaining.getAndDecrement() > 0) {
                            if (ctx.cancelled.get() || Thread.currentThread().isInterrupted()) {
                                break;
                            }
                            long start = System.currentTimeMillis();
                            try {
                                HttpResponse<Void> response = httpClient.send(
                                        buildRequest(config), HttpResponse.BodyHandlers.discarding());
                                long latency = System.currentTimeMillis() - start;
                                boolean ok   = response.statusCode() < 400;
                                windowLatencies.offer(latency);
                                windowResults.offer(ok);
                                allLatencies.add(latency);
                                if (ok) successCount.incrementAndGet();
                                else    failCount.incrementAndGet();
                            } catch (Exception e) {
                                long latency = System.currentTimeMillis() - start;
                                windowLatencies.offer(latency);
                                windowResults.offer(false);
                                allLatencies.add(latency);
                                failCount.incrementAndGet();
                            } finally {
                                requestsSent.incrementAndGet();
                                latch.countDown();
                            }
                        }
                    });
                }, delayMs, TimeUnit.MILLISECONDS);
            }

            boolean done = latch.await(30, TimeUnit.MINUTES);
            if (!done) run.setErrorMessage("Timed out after 30 minutes");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            run.setErrorMessage("Interrupted");
        } finally {
            activeRuns.remove(runId);
        }

        metricTask.cancel(false);
        executor.shutdown();
        scheduler.shutdown();

        String errorMsg = run.getErrorMessage();
        if (ctx.cancelled.get()) {
            errorMsg = "Stopped by user";
        }
        finalizeRun(runId, allLatencies, requestsSent, successCount, failCount, second[0], errorMsg);
    }

    private HttpRequest buildRequest(TestConfig config) {
        HttpRequest.Builder b = HttpRequest.newBuilder()
                .uri(URI.create(config.getTargetUrl()))
                .timeout(Duration.ofSeconds(30))
                .header("User-Agent", "StressLab/1.0");

        String method = config.getHttpMethod().name();
        String body   = config.getRequestBody();

        if ("GET".equals(method) || "DELETE".equals(method)) {
            b.method(method, HttpRequest.BodyPublishers.noBody());
        } else {
            String reqBody = (body != null && !body.isBlank()) ? body : "{}";
            b.method(method, HttpRequest.BodyPublishers.ofString(reqBody));
            b.header("Content-Type", "application/json");
        }
        return b.build();
    }

    private void finalizeRun(Long runId, List<Long> allLatencies,
                              AtomicInteger requestsSent, AtomicInteger successCount,
                              AtomicInteger failCount, long totalSeconds, String errorMsg) {

        List<Long> sorted = new ArrayList<>(allLatencies);
        Collections.sort(sorted);

        double avg = sorted.isEmpty() ? 0 : sorted.stream().mapToLong(Long::longValue).average().orElse(0);
        double min = sorted.isEmpty() ? 0 : sorted.get(0);
        double max = sorted.isEmpty() ? 0 : sorted.get(sorted.size() - 1);
        double p95 = percentile(sorted, 95);
        double p99 = percentile(sorted, 99);
        double rps = totalSeconds == 0 ? 0 : Math.round(requestsSent.get() * 10.0 / totalSeconds) / 10.0;

        int sent = requestsSent.get();
        int suc  = successCount.get();
        double sr = sent == 0 ? 100.0 : Math.round(suc * 1000.0 / sent) / 10.0;

        // Fresh fetch to avoid stale state
        TestRun run = testRunRepository.findById(runId)
                .orElseThrow(() -> new RuntimeException("Run not found on finalize"));

        run.setStatus(errorMsg != null ? RunStatus.FAILED : RunStatus.COMPLETED);
        run.setCompletedAt(LocalDateTime.now());
        run.setTotalRequests(sent);
        run.setSuccessfulRequests(suc);
        run.setFailedRequests(failCount.get());
        run.setAvgResponseTime(Math.round(avg * 10.0) / 10.0);
        run.setMinResponseTime(Math.round(min * 10.0) / 10.0);
        run.setMaxResponseTime(Math.round(max * 10.0) / 10.0);
        run.setP95ResponseTime(Math.round(p95 * 10.0) / 10.0);
        run.setP99ResponseTime(Math.round(p99 * 10.0) / 10.0);
        run.setRequestsPerSecond(rps);
        if (errorMsg != null) run.setErrorMessage(errorMsg);
        testRunRepository.save(run);

        LiveMetricPayload finalPayload = LiveMetricPayload.builder()
                .runId(runId).second(totalSeconds)
                .requestsSent(sent).successCount(suc).failCount(failCount.get())
                .successRate(sr)
                .avgResponseTime(Math.round(avg * 10.0) / 10.0)
                .requestsInWindow(0).activeUsers(0)
                .status(errorMsg != null ? "FAILED" : "COMPLETED")
                .build();

        messagingTemplate.convertAndSend("/topic/run/" + runId, finalPayload);
    }

    private double percentile(List<Long> sorted, int p) {
        if (sorted.isEmpty()) return 0;
        int idx = (int) Math.ceil(p / 100.0 * sorted.size()) - 1;
        return sorted.get(Math.max(0, Math.min(idx, sorted.size() - 1)));
    }
}
