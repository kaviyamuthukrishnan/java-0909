package com.foodrescue.web;

import com.foodrescue.dto.Dtos.*;
import com.foodrescue.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService auth;

    @PostMapping("/register/provider") @ResponseStatus(HttpStatus.CREATED)
    public void registerProvider(@Valid @RequestBody RegisterProviderRequest r) { auth.registerProvider(r); }

    @PostMapping("/register/ngo") @ResponseStatus(HttpStatus.CREATED)
    public void registerNgo(@Valid @RequestBody RegisterNgoRequest r) { auth.registerNgo(r); }

    @PostMapping("/verify-email") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void verify(@Valid @RequestBody VerifyEmailRequest r) { auth.verifyEmail(r.email(), r.code()); }

    @PostMapping("/resend-otp") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resend(@Valid @RequestBody EmailRequest r) { auth.resendOtp(r.email()); }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest r) { return auth.login(r.email(), r.password()); }

    @GetMapping("/me")
    public UserView me(Authentication a) { return auth.me(a.getName()); }
}
