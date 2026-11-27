package com.foodrescue.service;

import com.foodrescue.domain.*;
import com.foodrescue.dto.Dtos.AccountSummary;
import com.foodrescue.repo.FoodProviderRepository;
import com.foodrescue.repo.NgoRepository;
import com.foodrescue.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserRepository users;
    private final FoodProviderRepository providers;
    private final NgoRepository ngos;
    private final AuthService auth;

    @Transactional(readOnly = true)
    public List<AccountSummary> list(AccountStatus status) {
        return users.findByStatusAndRoleNotOrderByCreatedAtDesc(status, Role.ADMIN)
                .stream().map(this::summary).toList();
    }

    @Transactional
    public AccountSummary decide(Long id, boolean approve, String note) {
        User u = users.findById(id).orElseThrow(() ->
                new ApiException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Account not found."));
        if (u.getRole() == Role.ADMIN) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "NOT_ALLOWED", "Admin accounts can't be reviewed.");
        }
        if (approve && !u.isEmailVerified()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "EMAIL_NOT_VERIFIED",
                    "This account hasn't verified its email yet.");
        }
        u.setStatus(approve ? AccountStatus.APPROVED : AccountStatus.REJECTED);
        u.setReviewNote(note == null || note.isBlank() ? null : note.trim());
        return summary(users.save(u));
    }

    private AccountSummary summary(User u) {
        String address = "", details = "";
        if (u.getRole() == Role.PROVIDER) {
            FoodProvider p = providers.findByUser(u).orElse(null);
            if (p != null) {
                address = p.getAddress();
                details = p.getEstablishmentType() + (p.getLicenceNumber() == null || p.getLicenceNumber().isBlank()
                        ? "" : " · Licence " + p.getLicenceNumber());
            }
        } else {
            Ngo n = ngos.findByUser(u).orElse(null);
            if (n != null) {
                address = n.getAddress();
                details = "Reg. " + n.getRegistrationNumber() + " · serves " + n.getBeneficiaryCapacity()
                        + (n.isHasTransport() ? " · has transport" : " · no transport");
            }
        }
        return new AccountSummary(u.getId(), u.getEmail(), u.getPhone(), u.getRole(), u.getStatus(),
                auth.displayName(u), address, details, u.getCreatedAt(), u.isEmailVerified());
    }
}
