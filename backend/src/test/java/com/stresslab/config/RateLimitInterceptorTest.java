package com.stresslab.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.io.PrintWriter;
import java.io.StringWriter;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RateLimitInterceptorTest {

    @InjectMocks
    private RateLimitInterceptor rateLimitInterceptor;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    private StringWriter stringWriter;
    private PrintWriter printWriter;

    @BeforeEach
    void setUp() {
        stringWriter = new StringWriter();
        printWriter = new PrintWriter(stringWriter);
    }

    @Test
    void preHandle_AllowsRequestsUnderLimit() throws Exception {
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("192.168.1.100");

        // First 60 requests should pass
        for (int i = 0; i < 60; i++) {
            boolean allowed = rateLimitInterceptor.preHandle(request, response, new Object());
            assertTrue(allowed, "Request " + (i + 1) + " should be allowed");
        }
    }

    @Test
    void preHandle_BlocksRequestOverLimit() throws Exception {
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("10.0.0.5");
        when(response.getWriter()).thenReturn(printWriter);

        // Exhaust the bucket (60 requests)
        for (int i = 0; i < 60; i++) {
            rateLimitInterceptor.preHandle(request, response, new Object());
        }

        // 61st request should be blocked
        boolean allowed = rateLimitInterceptor.preHandle(request, response, new Object());
        assertFalse(allowed);

        verify(response).setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        assertTrue(stringWriter.toString().contains("Too many requests"));
    }

    @Test
    void getClientIp_UsesXForwardedForHeader() throws Exception {
        when(request.getHeader("X-Forwarded-For")).thenReturn("203.0.113.195, 192.168.1.1");
        
        // This implicitly tests that it uses the first IP from X-Forwarded-For
        // by creating a bucket for it and allowing the request.
        boolean allowed = rateLimitInterceptor.preHandle(request, response, new Object());
        assertTrue(allowed);
        
        verify(request, never()).getRemoteAddr();
    }
}
