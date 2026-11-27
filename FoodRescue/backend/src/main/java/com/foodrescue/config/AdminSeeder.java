package com.foodrescue.config;

import com.foodrescue.domain.AccountStatus;
import com.foodrescue.domain.Role;
import com.foodrescue.domain.User;
import com.foodrescue.repo.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final String email;
    private final String password;

    public AdminSeeder(UserRepository users, PasswordEncoder encoder,
                       @Value("${app.admin.email}") String email,
                       @Value("${app.admin.password}") String password) {
        this.users = users;
        this.encoder = encoder;
        this.email = email;
        this.password = password;
    }

    @Override
    public void run(String... args) {
        if (users.existsByRole(Role.ADMIN)) return;
        User admin = new User();
        admin.setEmail(email.toLowerCase());
        admin.setPasswordHash(encoder.encode(password));
        admin.setPhone("-");
        admin.setRole(Role.ADMIN);
        admin.setStatus(AccountStatus.APPROVED);
        admin.setEmailVerified(true);
        users.save(admin);
    }
}
