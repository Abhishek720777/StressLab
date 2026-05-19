package com.stresslab.dto;

import com.stresslab.model.HttpMethodType;
import com.stresslab.model.TestConfig;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TestConfigResponse {
    private Long id;
    private String name;
    private String targetUrl;
    private HttpMethodType httpMethod;
    private String requestHeaders;
    private String requestBody;
    private Integer concurrentUsers;
    private Integer totalRequests;
    private Integer rampUpSeconds;
    private LocalDateTime createdAt;

    public static TestConfigResponse from(TestConfig c) {
        TestConfigResponse r = new TestConfigResponse();
        r.setId(c.getId());
        r.setName(c.getName());
        r.setTargetUrl(c.getTargetUrl());
        r.setHttpMethod(c.getHttpMethod());
        r.setRequestHeaders(c.getRequestHeaders());
        r.setRequestBody(c.getRequestBody());
        r.setConcurrentUsers(c.getConcurrentUsers());
        r.setTotalRequests(c.getTotalRequests());
        r.setRampUpSeconds(c.getRampUpSeconds());
        r.setCreatedAt(c.getCreatedAt());
        return r;
    }
}
