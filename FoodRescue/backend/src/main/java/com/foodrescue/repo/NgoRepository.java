package com.foodrescue.repo;

import com.foodrescue.domain.Ngo;
import com.foodrescue.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NgoRepository extends JpaRepository<Ngo, Long> {
    Optional<Ngo> findByUser(User user);
}
