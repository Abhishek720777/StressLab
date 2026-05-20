package com.stresslab.service;

import com.stresslab.dto.TestResultResponse;
import com.stresslab.dto.TestRunResponse;
import com.stresslab.dto.TestMetricResponse;
import com.stresslab.engine.LoadTestEngine;
import com.stresslab.model.*;
import com.stresslab.repository.TestMetricRepository;
import com.stresslab.repository.TestRunRepository;
import com.stresslab.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import java.util.List;
import java.util.concurrent.Executor;
import java.util.stream.Collectors;

@Service
@Slf4j
public class LoadTestService {

    private final TestRunRepository runRepository;
    private final TestMetricRepository metricRepository;
    private final UserRepository userRepository;
    private final TestConfigService configService;
    private final LoadTestEngine engine;
    private final Executor loadTestExecutor;

    public LoadTestService(TestRunRepository runRepository,
                           TestMetricRepository metricRepository,
                           UserRepository userRepository,
                           TestConfigService configService,
                           LoadTestEngine engine,
                           @Qualifier("loadTestExecutor") Executor loadTestExecutor) {
        this.runRepository = runRepository;
        this.metricRepository = metricRepository;
        this.userRepository = userRepository;
        this.configService = configService;
        this.engine = engine;
        this.loadTestExecutor = loadTestExecutor;
    }

    @CacheEvict(value = "runs", key = "#email")
    public TestRunResponse startRun(Long configId, String email) {
        User user = getUser(email);
        TestConfig config = configService.getEntity(configId, email);

        TestRun run = TestRun.builder()
                .config(config)
                .user(user)
                .status(RunStatus.PENDING)
                .build();
        TestRun savedRun = runRepository.save(run);
        final Long runId = savedRun.getId();

        loadTestExecutor.execute(() -> {
            try {
                engine.execute(runId, config);
            } catch (Exception e) {
                log.error("Load test failed for runId={}: {}", runId, e.getMessage());
                runRepository.findById(runId).ifPresent(r -> {
                    r.setStatus(RunStatus.FAILED);
                    r.setErrorMessage(e.getMessage());
                    runRepository.save(r);
                });
            }
        });

        return TestRunResponse.from(savedRun);
    }

    public TestRunResponse getRunStatus(Long runId, String email) {
        User user = getUser(email);
        TestRun run = runRepository.findById(runId)
                .filter(r -> r.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Run not found"));
        return TestRunResponse.from(run);
    }

    @Cacheable(value = "runs", key = "#email")
    public List<TestRunResponse> getAllRuns(String email) {
        User user = getUser(email);
        return runRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(TestRunResponse::from).collect(Collectors.toList());
    }

    @Cacheable(value = "results", key = "#runId")
    public TestResultResponse getFullResults(Long runId, String email) {
        User user = getUser(email);
        TestRun run = runRepository.findById(runId)
                .filter(r -> r.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Run not found"));

        List<TestMetricResponse> metrics = metricRepository
                .findByRunIdOrderBySampledAtAsc(runId)
                .stream().map(TestMetricResponse::from).collect(Collectors.toList());

        return new TestResultResponse(
                TestRunResponse.from(run),
                com.stresslab.dto.TestConfigResponse.from(run.getConfig()),
                metrics
        );
    }

    @CacheEvict(value = "runs", key = "#email")
    public void abortRun(Long runId, String email) {
        User user = getUser(email);
        TestRun run = runRepository.findById(runId)
                .filter(r -> r.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Run not found"));

        if (run.getStatus() != RunStatus.RUNNING && run.getStatus() != RunStatus.PENDING) {
            throw new RuntimeException("Run is not active");
        }

        boolean stopped = engine.abortRun(runId);
        if (!stopped) {
            run.setStatus(RunStatus.FAILED);
            run.setErrorMessage("Stopped by user");
            runRepository.save(run);
        }
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
