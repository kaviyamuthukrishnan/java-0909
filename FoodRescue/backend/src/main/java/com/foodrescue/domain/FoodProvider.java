package com.foodrescue.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "food_providers")
@Getter @Setter @NoArgsConstructor
public class FoodProvider {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(nullable = false)
    private String establishmentName;
    private String ownerName;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private EstablishmentType establishmentType;

    @Column(nullable = false, length = 500)
    private String address;
    private Double latitude;
    private Double longitude;
    private String licenceNumber;
}
