package com.stresslab.controller;

import com.stresslab.dto.TestConfigRequest;
import com.stresslab.dto.TestConfigResponse;
import com.stresslab.dto.TestRunResponse;
import com.stresslab.service.LoadTestService;
import com.stresslab.service.TestConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
public class TestController {

    private final TestConfigService configService;
    private final LoadTestService loadTestService;

    @GetMapping
    public ResponseEntity<List<TestConfigResponse>> getAll(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(configService.getAllByUser(user.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestConfigResponse> getOne(@PathVariable Long id,
                                                      @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(configService.getById(id, user.getUsername()));
    }

    @PostMapping
    public ResponseEntity<TestConfigResponse> create(@Valid @RequestBody TestConfigRequest req,
                                                      @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(configService.create(req, user.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestConfigResponse> update(@PathVariable Long id,
                                                      @Valid @RequestBody TestConfigRequest req,
                                                      @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(configService.update(id, req, user.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                        @AuthenticationPrincipal UserDetails user) {
        configService.delete(id, user.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/run")
    public ResponseEntity<TestRunResponse> startRun(@PathVariable Long id,
                                                     @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(loadTestService.startRun(id, user.getUsername()));
    }
}
