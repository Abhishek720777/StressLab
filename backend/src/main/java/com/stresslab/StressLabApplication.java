package com.stresslab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class StressLabApplication {
    public static void main(String[] args) {
        SpringApplication.run(StressLabApplication.class, args);
    }
}
