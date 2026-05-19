package com.stresslab.repository;

import com.stresslab.model.TestMetric;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestMetricRepository extends JpaRepository<TestMetric, Long> {
    List<TestMetric> findByRunIdOrderBySampledAtAsc(Long runId);
}
