package com.foodrescue.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ngos")
@Getter @Setter @NoArgsConstructor
public class Ngo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(nullable = false)
    private String organizationName;
    private String contactName;
    private String registrationNumber;

    @Column(nullable = false, length = 500)
    private String address;
    private Double latitude;
    private Double longitude;
    private Integer beneficiaryCapacity;
    private boolean hasTransport;
}
