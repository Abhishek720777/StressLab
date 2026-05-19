package com.stresslab.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LiveMetricPayload {
    private Long runId;
    private Long second;
    private Integer requestsSent;
    private Integer successCount;
    private Integer failCount;
    private Double successRate;
    private Double avgResponseTime;
    private Integer requestsInWindow;
    private Integer activeUsers;
    private String status;
}
