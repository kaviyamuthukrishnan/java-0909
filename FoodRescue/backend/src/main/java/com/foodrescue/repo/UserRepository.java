package com.foodrescue.repo;

import com.foodrescue.domain.AccountStatus;
import com.foodrescue.domain.Role;
import com.foodrescue.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByRole(Role role);
    List<User> findByStatusAndRoleNotOrderByCreatedAtDesc(AccountStatus status, Role role);
}
