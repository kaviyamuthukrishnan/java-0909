package com.foodrescue.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/** Development OTP service: codes are printed to the console instead of being emailed. */
@Service
public class OtpService {
    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private record Entry(String code, Instant expiresAt) {}

    private final Map<String, Entry> codes = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    public void send(String email) {
        String code = String.format("%06d", random.nextInt(1_000_000));
        codes.put(email, new Entry(code, Instant.now().plusSeconds(600)));
        log.info("[DEV OTP] Verification code for {} is {} (valid 10 minutes)", email, code);
    }

    public boolean verify(String email, String code) {
        Entry e = codes.get(email);
        if (e == null || Instant.now().isAfter(e.expiresAt()) || !e.code().equals(code.trim())) return false;
        codes.remove(email);
        return true;
    }
}
