package com.foodrescue.service;

import com.foodrescue.domain.*;
import com.foodrescue.dto.Dtos.*;
import com.foodrescue.repo.FoodProviderRepository;
import com.foodrescue.repo.NgoRepository;
import com.foodrescue.repo.UserRepository;
import com.foodrescue.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository users;
    private final FoodProviderRepository providers;
    private final NgoRepository ngos;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final OtpService otp;

    @Transactional
    public void registerProvider(RegisterProviderRequest r) {
        User u = newUser(r.email(), r.password(), r.phone(), Role.PROVIDER);
        FoodProvider p = new FoodProvider();
        p.setUser(u);
        p.setEstablishmentName(r.establishmentName().trim());
        p.setOwnerName(r.ownerName().trim());
        p.setEstablishmentType(r.establishmentType());
        p.setAddress(r.address().trim());
        p.setLatitude(r.latitude());
        p.setLongitude(r.longitude());
        p.setLicenceNumber(r.licenceNumber());
        providers.save(p);
        otp.send(u.getEmail());
    }

    @Transactional
    public void registerNgo(RegisterNgoRequest r) {
        User u = newUser(r.email(), r.password(), r.phone(), Role.NGO);
        Ngo n = new Ngo();
        n.setUser(u);
        n.setOrganizationName(r.organizationName().trim());
        n.setContactName(r.contactName().trim());
        n.setRegistrationNumber(r.registrationNumber().trim());
        n.setAddress(r.address().trim());
        n.setLatitude(r.latitude());
        n.setLongitude(r.longitude());
        n.setBeneficiaryCapacity(r.beneficiaryCapacity());
        n.setHasTransport(Boolean.TRUE.equals(r.hasTransport()));
        ngos.save(n);
        otp.send(u.getEmail());
    }

    @Transactional
    public void verifyEmail(String email, String code) {
        User u = find(email);
        if (!otp.verify(u.getEmail(), code)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_CODE",
                    "That code is incorrect or has expired. Request a new one.");
        }
        u.setEmailVerified(true);
        users.save(u);
    }

    public void resendOtp(String email) {
        users.findByEmail(norm(email)).ifPresent(u -> {
            if (!u.isEmailVerified()) otp.send(u.getEmail());
        });
    }

    public AuthResponse login(String email, String password) {
        ApiException bad = new ApiException(HttpStatus.UNAUTHORIZED, "BAD_CREDENTIALS",
                "Email or password is incorrect.");
        User u = users.findByEmail(norm(email)).orElseThrow(() -> bad);
        if (!encoder.matches(password, u.getPasswordHash())) throw bad;
        if (!u.isEmailVerified()) {
            otp.send(u.getEmail());
            throw new ApiException(HttpStatus.FORBIDDEN, "EMAIL_NOT_VERIFIED",
                    "Verify your email to continue. We sent you a new code.");
        }
        if (u.getStatus() == AccountStatus.SUSPENDED) {
            throw new ApiException(HttpStatus.FORBIDDEN, "ACCOUNT_SUSPENDED",
                    "This account is suspended. Contact the platform administrator.");
        }
        return new AuthResponse(jwt.generate(u), toView(u));
    }

    public UserView me(String email) {
        return toView(find(email));
    }

    public UserView toView(User u) {
        return new UserView(u.getId(), u.getEmail(), u.getRole(), u.getStatus(),
                u.isEmailVerified(), displayName(u), u.getReviewNote());
    }

    public String displayName(User u) {
        return switch (u.getRole()) {
            case PROVIDER -> providers.findByUser(u).map(FoodProvider::getEstablishmentName).orElse(u.getEmail());
            case NGO -> ngos.findByUser(u).map(Ngo::getOrganizationName).orElse(u.getEmail());
            case ADMIN -> "Administrator";
        };
    }

    private User find(String email) {
        return users.findByEmail(norm(email)).orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "We couldn't find that account."));
    }

    private User newUser(String email, String password, String phone, Role role) {
        String e = norm(email);
        if (users.existsByEmail(e)) {
            throw new ApiException(HttpStatus.CONFLICT, "EMAIL_TAKEN",
                    "An account with this email already exists. Try signing in.");
        }
        User u = new User();
        u.setEmail(e);
        u.setPasswordHash(encoder.encode(password));
        u.setPhone(phone.trim());
        u.setRole(role);
        return users.save(u);
    }

    private static String norm(String email) { return email.trim().toLowerCase(); }
}
