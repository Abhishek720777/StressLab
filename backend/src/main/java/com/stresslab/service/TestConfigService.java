package com.stresslab.service;

import com.stresslab.dto.TestConfigRequest;
import com.stresslab.dto.TestConfigResponse;
import com.stresslab.model.TestConfig;
import com.stresslab.model.User;
import com.stresslab.repository.TestConfigRepository;
import com.stresslab.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestConfigService {

    private final TestConfigRepository configRepository;
    private final UserRepository userRepository;

    public List<TestConfigResponse> getAllByUser(String email) {
        User user = getUser(email);
        return configRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(TestConfigResponse::from).collect(Collectors.toList());
    }

    public TestConfigResponse getById(Long id, String email) {
        User user = getUser(email);
        TestConfig config = configRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Test config not found"));
        return TestConfigResponse.from(config);
    }

    public TestConfigResponse create(TestConfigRequest req, String email) {
        User user = getUser(email);
        TestConfig config = TestConfig.builder()
                .user(user)
                .name(req.getName())
                .targetUrl(req.getTargetUrl())
                .httpMethod(req.getHttpMethod())
                .requestHeaders(req.getRequestHeaders())
                .requestBody(req.getRequestBody())
                .concurrentUsers(req.getConcurrentUsers())
                .totalRequests(req.getTotalRequests())
                .rampUpSeconds(req.getRampUpSeconds())
                .build();
        return TestConfigResponse.from(configRepository.save(config));
    }

    public TestConfigResponse update(Long id, TestConfigRequest req, String email) {
        User user = getUser(email);
        TestConfig config = configRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Test config not found"));
        config.setName(req.getName());
        config.setTargetUrl(req.getTargetUrl());
        config.setHttpMethod(req.getHttpMethod());
        config.setRequestHeaders(req.getRequestHeaders());
        config.setRequestBody(req.getRequestBody());
        config.setConcurrentUsers(req.getConcurrentUsers());
        config.setTotalRequests(req.getTotalRequests());
        config.setRampUpSeconds(req.getRampUpSeconds());
        return TestConfigResponse.from(configRepository.save(config));
    }

    public void delete(Long id, String email) {
        User user = getUser(email);
        TestConfig config = configRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Test config not found"));
        configRepository.delete(config);
    }

    public TestConfig getEntity(Long id, String email) {
        User user = getUser(email);
        return configRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Test config not found"));
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
