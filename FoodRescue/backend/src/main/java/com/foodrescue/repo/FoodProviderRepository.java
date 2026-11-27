package com.foodrescue.repo;

import com.foodrescue.domain.FoodProvider;
import com.foodrescue.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FoodProviderRepository extends JpaRepository<FoodProvider, Long> {
    Optional<FoodProvider> findByUser(User user);
}
