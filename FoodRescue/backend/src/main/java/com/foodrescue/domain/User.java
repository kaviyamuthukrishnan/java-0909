package com.foodrescue.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private String phone;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private AccountStatus status = AccountStatus.PENDING_APPROVAL;

    private boolean emailVerified;

    private String reviewNote;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();
}
