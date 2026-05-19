package com.stresslab.repository;

import com.stresslab.model.TestConfig;
import com.stresslab.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TestConfigRepository extends JpaRepository<TestConfig, Long> {
    List<TestConfig> findByUserOrderByCreatedAtDesc(User user);
    Optional<TestConfig> findByIdAndUser(Long id, User user);
}
