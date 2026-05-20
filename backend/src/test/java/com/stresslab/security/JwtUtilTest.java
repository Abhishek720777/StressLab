package com.stresslab.security;

import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private final String testEmail = "test@example.com";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        // Set a valid 256-bit hex secret key for HS256 (64 hex characters)
        String secret = "5A7134743777217A25432A46294A404E635166546A576E5A7234753778214125";
        ReflectionTestUtils.setField(jwtUtil, "secret", secret);
        ReflectionTestUtils.setField(jwtUtil, "expiration", 3600000L); // 1 hour
    }

    @Test
    void testGenerateToken() {
        String token = jwtUtil.generateToken(testEmail);
        assertNotNull(token);
        assertTrue(token.startsWith("eyJ"));
    }

    @Test
    void testExtractEmail() {
        String token = jwtUtil.generateToken(testEmail);
        String extractedEmail = jwtUtil.extractEmail(token);
        assertEquals(testEmail, extractedEmail);
    }

    @Test
    void testIsValid_ValidToken() {
        String token = jwtUtil.generateToken(testEmail);
        assertTrue(jwtUtil.isValid(token));
    }

    @Test
    void testIsValid_InvalidToken() {
        String token = jwtUtil.generateToken(testEmail) + "tampered";
        assertFalse(jwtUtil.isValid(token));
    }

    @Test
    void testIsValid_DifferentSecret() {
        String token = jwtUtil.generateToken(testEmail);
        
        // Change secret
        String differentSecret = "9A7134743777217A25432A46294A404E635166546A576E5A7234753778214125";
        ReflectionTestUtils.setField(jwtUtil, "secret", differentSecret);
        
        assertFalse(jwtUtil.isValid(token));
    }
}
