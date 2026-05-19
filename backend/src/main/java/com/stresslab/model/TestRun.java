package com.stresslab.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "test_runs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "config_id", nullable = false)
    private TestConfig config;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RunStatus status;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "total_requests")
    private Integer totalRequests;

    @Column(name = "successful_requests")
    private Integer successfulRequests;

    @Column(name = "failed_requests")
    private Integer failedRequests;

    @Column(name = "avg_response_time")
    private Double avgResponseTime;

    @Column(name = "min_response_time")
    private Double minResponseTime;

    @Column(name = "max_response_time")
    private Double maxResponseTime;

    @Column(name = "p95_response_time")
    private Double p95ResponseTime;

    @Column(name = "p99_response_time")
    private Double p99ResponseTime;

    @Column(name = "requests_per_second")
    private Double requestsPerSecond;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
