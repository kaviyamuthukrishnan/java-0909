package com.foodrescue.web;

import com.foodrescue.domain.AccountStatus;
import com.foodrescue.dto.Dtos.AccountSummary;
import com.foodrescue.dto.Dtos.DecisionRequest;
import com.foodrescue.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService admin;

    @GetMapping("/accounts")
    public List<AccountSummary> accounts(@RequestParam(defaultValue = "PENDING_APPROVAL") AccountStatus status) {
        return admin.list(status);
    }

    @PostMapping("/accounts/{id}/decision")
    public AccountSummary decide(@PathVariable Long id, @RequestBody DecisionRequest r) {
        return admin.decide(id, r.approve(), r.note());
    }
}
