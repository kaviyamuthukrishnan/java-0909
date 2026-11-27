package com.foodrescue.dto;

import com.foodrescue.domain.AccountStatus;
import com.foodrescue.domain.EstablishmentType;
import com.foodrescue.domain.Role;
import jakarta.validation.constraints.*;

import java.time.Instant;

public final class Dtos {
    private Dtos() {}

    public record RegisterProviderRequest(
            @NotBlank(message = "Enter your email address") @Email(message = "Enter a valid email address") String email,
            @NotBlank(message = "Choose a password") @Size(min = 8, message = "Password must be at least 8 characters") String password,
            @NotBlank(message = "Enter a phone number") String phone,
            @NotBlank(message = "Enter the establishment name") String establishmentName,
            @NotBlank(message = "Enter the owner or manager name") String ownerName,
            @NotNull(message = "Choose the establishment type") EstablishmentType establishmentType,
            @NotBlank(message = "Enter the full address") String address,
            Double latitude, Double longitude,
            String licenceNumber) {}

    public record RegisterNgoRequest(
            @NotBlank(message = "Enter your email address") @Email(message = "Enter a valid email address") String email,
            @NotBlank(message = "Choose a password") @Size(min = 8, message = "Password must be at least 8 characters") String password,
            @NotBlank(message = "Enter a phone number") String phone,
            @NotBlank(message = "Enter the organisation name") String organizationName,
            @NotBlank(message = "Enter a contact person") String contactName,
            @NotBlank(message = "Enter the registration number") String registrationNumber,
            @NotBlank(message = "Enter the full address") String address,
            Double latitude, Double longitude,
            @NotNull(message = "Enter how many people you can serve") @Min(value = 1, message = "Enter how many people you can serve") Integer beneficiaryCapacity,
            Boolean hasTransport) {}

    public record LoginRequest(
            @NotBlank(message = "Enter your email address") String email,
            @NotBlank(message = "Enter your password") String password) {}

    public record EmailRequest(@NotBlank @Email String email) {}

    public record VerifyEmailRequest(
            @NotBlank String email,
            @NotBlank(message = "Enter the 6-digit code") String code) {}

    public record UserView(Long id, String email, Role role, AccountStatus status,
                           boolean emailVerified, String displayName, String reviewNote) {}

    public record AuthResponse(String token, UserView user) {}

    public record AccountSummary(Long id, String email, String phone, Role role, AccountStatus status,
                                 String displayName, String address, String details, Instant createdAt,
                                 boolean emailVerified) {}

    public record DecisionRequest(boolean approve, String note) {}
}
