package com.stresslab.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "test_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "run_id", nullable = false)
    private TestRun run;

    @Column(name = "sampled_at", nullable = false)
    private LocalDateTime sampledAt;

    @Column(name = "active_users")
    private Integer activeUsers;

    @Column(name = "requests_in_window")
    private Integer requestsInWindow;

    @Column(name = "avg_response_time")
    private Double avgResponseTime;

    @Column(name = "error_count")
    private Integer errorCount;

    @Column(name = "success_count")
    private Integer successCount;
}
