package com.stresslab.repository;

import com.stresslab.model.TestRun;
import com.stresslab.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestRunRepository extends JpaRepository<TestRun, Long> {
    List<TestRun> findByUserOrderByCreatedAtDesc(User user);
    List<TestRun> findByConfigIdOrderByCreatedAtDesc(Long configId);
    List<TestRun> findTop5ByUserOrderByCreatedAtDesc(User user);
}
