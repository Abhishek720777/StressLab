package com.stresslab.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class TestResultResponse {
    private TestRunResponse run;
    private TestConfigResponse config;
    private List<TestMetricResponse> metrics;
}
