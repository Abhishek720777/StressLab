package com.stresslab.dto;

import com.stresslab.model.RunStatus;
import com.stresslab.model.TestRun;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TestRunResponse {
    private Long id;
    private Long configId;
    private String configName;
    private RunStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private Integer totalRequests;
    private Integer successfulRequests;
    private Integer failedRequests;
    private Double avgResponseTime;
    private Double minResponseTime;
    private Double maxResponseTime;
    private Double p95ResponseTime;
    private Double p99ResponseTime;
    private Double requestsPerSecond;
    private String errorMessage;

    public static TestRunResponse from(TestRun r) {
        TestRunResponse dto = new TestRunResponse();
        dto.setId(r.getId());
        dto.setConfigId(r.getConfig().getId());
        dto.setConfigName(r.getConfig().getName());
        dto.setStatus(r.getStatus());
        dto.setStartedAt(r.getStartedAt());
        dto.setCompletedAt(r.getCompletedAt());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setTotalRequests(r.getTotalRequests());
        dto.setSuccessfulRequests(r.getSuccessfulRequests());
        dto.setFailedRequests(r.getFailedRequests());
        dto.setAvgResponseTime(r.getAvgResponseTime());
        dto.setMinResponseTime(r.getMinResponseTime());
        dto.setMaxResponseTime(r.getMaxResponseTime());
        dto.setP95ResponseTime(r.getP95ResponseTime());
        dto.setP99ResponseTime(r.getP99ResponseTime());
        dto.setRequestsPerSecond(r.getRequestsPerSecond());
        dto.setErrorMessage(r.getErrorMessage());
        return dto;
    }
}
