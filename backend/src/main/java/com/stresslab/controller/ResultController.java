package com.stresslab.controller;

import com.stresslab.dto.TestResultResponse;
import com.stresslab.dto.TestRunResponse;
import com.stresslab.service.LoadTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/runs")
@RequiredArgsConstructor
public class ResultController {

    private final LoadTestService loadTestService;

    @GetMapping
    public ResponseEntity<List<TestRunResponse>> getAllRuns(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(loadTestService.getAllRuns(user.getUsername()));
    }

    @GetMapping("/{runId}")
    public ResponseEntity<TestRunResponse> getStatus(@PathVariable Long runId,
                                                      @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(loadTestService.getRunStatus(runId, user.getUsername()));
    }

    @GetMapping("/{runId}/results")
    public ResponseEntity<TestResultResponse> getResults(@PathVariable Long runId,
                                                          @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(loadTestService.getFullResults(runId, user.getUsername()));
    }

    @PostMapping("/{runId}/stop")
    public ResponseEntity<Void> stopRun(@PathVariable Long runId,
                                         @AuthenticationPrincipal UserDetails user) {
        loadTestService.abortRun(runId, user.getUsername());
        return ResponseEntity.ok().build();
    }
}
