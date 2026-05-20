package com.stresslab.service;

import com.stresslab.dto.TestRunResponse;
import com.stresslab.engine.LoadTestEngine;
import com.stresslab.model.RunStatus;
import com.stresslab.model.TestConfig;
import com.stresslab.model.TestRun;
import com.stresslab.model.User;
import com.stresslab.repository.TestMetricRepository;
import com.stresslab.repository.TestRunRepository;
import com.stresslab.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.concurrent.Executor;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoadTestServiceTest {

    @Mock
    private TestRunRepository runRepository;
    @Mock
    private TestMetricRepository metricRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TestConfigService configService;
    @Mock
    private LoadTestEngine engine;
    @Mock
    private Executor loadTestExecutor;

    @InjectMocks
    private LoadTestService loadTestService;

    private User testUser;
    private TestConfig testConfig;
    private TestRun testRun;
    private final String email = "test@example.com";

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail(email);

        testConfig = new TestConfig();
        testConfig.setId(100L);
        testConfig.setTargetUrl("http://localhost");

        testRun = new TestRun();
        testRun.setId(500L);
        testRun.setUser(testUser);
        testRun.setConfig(testConfig);
        testRun.setStatus(RunStatus.PENDING);
    }

    @Test
    void startRun_CreatesPendingRun_AndSubmitsToExecutor() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        when(configService.getEntity(100L, email)).thenReturn(testConfig);
        when(runRepository.save(any(TestRun.class))).thenReturn(testRun);

        TestRunResponse response = loadTestService.startRun(100L, email);

        assertNotNull(response);
        assertEquals(500L, response.getId());
        assertEquals(RunStatus.PENDING, response.getStatus());

        verify(runRepository).save(any(TestRun.class));
        verify(loadTestExecutor).execute(any(Runnable.class));
    }

    @Test
    void abortRun_RunBelongsToUser_StatusUpdatedToFailed() {
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        when(runRepository.findById(500L)).thenReturn(Optional.of(testRun));

        loadTestService.abortRun(500L, email);

        verify(engine).abortRun(500L);
        assertEquals(RunStatus.FAILED, testRun.getStatus());
        assertEquals("Stopped by user", testRun.getErrorMessage());
        verify(runRepository).save(testRun);
    }

    @Test
    void abortRun_RunBelongsToDifferentUser_ThrowsException() {
        User otherUser = new User();
        otherUser.setId(99L);
        testRun.setUser(otherUser);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        when(runRepository.findById(500L)).thenReturn(Optional.of(testRun));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            loadTestService.abortRun(500L, email);
        });

        assertEquals("Run not found", exception.getMessage());
        verify(engine, never()).abortRun(anyLong());
    }
}
