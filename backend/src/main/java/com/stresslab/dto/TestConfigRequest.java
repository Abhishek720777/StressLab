package com.stresslab.dto;

import com.stresslab.model.HttpMethodType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class TestConfigRequest {

    @NotBlank(message = "Test name is required")
    @Size(max = 100, message = "Name must be under 100 characters")
    private String name;

    @NotBlank(message = "Target URL is required")
    private String targetUrl;

    @NotNull(message = "HTTP method is required")
    private HttpMethodType httpMethod;

    private String requestHeaders;

    private String requestBody;

    @NotNull
    @Min(value = 1, message = "At least 1 concurrent user")
    @Max(value = 1000, message = "Max 1000 concurrent users")
    private Integer concurrentUsers;

    @NotNull
    @Min(value = 1, message = "At least 1 request")
    @Max(value = 100000, message = "Max 100,000 requests")
    private Integer totalRequests;

    @NotNull
    @Min(value = 0, message = "Ramp-up cannot be negative")
    @Max(value = 300, message = "Max ramp-up is 300 seconds")
    private Integer rampUpSeconds;
}
