package com.stresslab.dto;

import com.stresslab.model.TestMetric;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TestMetricResponse {
    private Long id;
    private LocalDateTime sampledAt;
    private Integer activeUsers;
    private Integer requestsInWindow;
    private Double avgResponseTime;
    private Integer errorCount;
    private Integer successCount;

    public static TestMetricResponse from(TestMetric m) {
        TestMetricResponse dto = new TestMetricResponse();
        dto.setId(m.getId());
        dto.setSampledAt(m.getSampledAt());
        dto.setActiveUsers(m.getActiveUsers());
        dto.setRequestsInWindow(m.getRequestsInWindow());
        dto.setAvgResponseTime(m.getAvgResponseTime());
        dto.setErrorCount(m.getErrorCount());
        dto.setSuccessCount(m.getSuccessCount());
        return dto;
    }
}
