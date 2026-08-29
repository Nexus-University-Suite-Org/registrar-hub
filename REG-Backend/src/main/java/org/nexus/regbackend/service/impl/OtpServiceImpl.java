package org.nexus.regbackend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nexus.regbackend.configuration.OtpProperties;
import org.nexus.regbackend.dto.SendOtpRequest;
import org.nexus.regbackend.dto.VerifyOtpRequest;
import org.nexus.regbackend.exception.OtpException;
import org.nexus.regbackend.model.OtpPurpose;
import org.nexus.regbackend.model.OtpRecord;
import org.nexus.regbackend.repository.OtpRecordRepository;
import org.nexus.regbackend.service.EmailService;
import org.nexus.regbackend.service.OtpService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;

/**
 * REG_UCD_004 / REG_UCD_005 implementation.
 *
 * <p>OTP hashing: HMAC-SHA256(key = secret + nonce, data = rawOtp)
 * The nonce is a random 32-byte hex string generated per send, preventing
 * rainbow-table and pre-computation attacks even if two users receive the
 * same 4-digit code.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final OtpRecordRepository otpRecordRepository;
    private final EmailService         emailService;
    private final OtpProperties        otpProperties;

    // ── REG_UCD_004 ──────────────────────────────────────────────────────────

    @Override
    @Transactional
    public String sendSignupOtp(SendOtpRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        LocalDateTime now = LocalDateTime.now();

        Optional<OtpRecord> existing = otpRecordRepository.findTopByEmailOrderByCreatedAtDesc(email);

        if (existing.isPresent()) {
            OtpRecord record = existing.get();

            // Enforce resend cooldown
            if (now.isBefore(record.getResendAllowedAt())) {
                throw new OtpException("Please wait before requesting a new code.");
            }

            // Reset hourly window if it has expired
            boolean windowExpired = now.isAfter(record.getHourWindowStart().plusHours(1));
            int sendsThisHour = windowExpired ? 0 : record.getSendsThisHour();
            LocalDateTime windowStart = windowExpired ? now : record.getHourWindowStart();

            // Enforce hourly send cap
            if (sendsThisHour >= otpProperties.getMaxSendsPerHour()) {
                throw new OtpException("Maximum OTP requests reached. Please try again later.");
            }

            // Invalidate the old record before issuing a new one
            otpRecordRepository.deleteAllByEmail(email);
        }

        String rawOtp = generateRawOtp();
        String nonce  = generateNonce();
        String hash   = hmac(otpProperties.getSecret() + nonce, rawOtp);

        // Recalculate sends for rate limiting after deletion above
        int previousSends = existing.map(r -> {
            boolean expired = now.isAfter(r.getHourWindowStart().plusHours(1));
            return expired ? 0 : r.getSendsThisHour();
        }).orElse(0);

        LocalDateTime windowStart = existing.map(r ->
                now.isAfter(r.getHourWindowStart().plusHours(1)) ? now : r.getHourWindowStart()
        ).orElse(now);

        OtpRecord newRecord = OtpRecord.builder()
                .email(email)
                .otpHash(hash)
                .nonce(nonce)
                .expiresAt(now.plusMinutes(otpProperties.getExpiryMinutes()))
                .verifyAttempts(0)
                .resendAllowedAt(now.plusSeconds(otpProperties.getResendCooldownSeconds()))
                .sendsThisHour(previousSends + 1)
                .hourWindowStart(windowStart)
                .build();

        otpRecordRepository.save(newRecord);
        emailService.sendOtpEmail(email, rawOtp);

        // Only expose raw OTP in dev; never in production
        return otpProperties.isShowInDev() ? rawOtp : null;
    }

    // ── REG_UCD_005 ──────────────────────────────────────────────────────────

    @Override
    @Transactional
    public boolean verifySignupOtp(VerifyOtpRequest request) {
        return verifyOtp(request, OtpPurpose.SIGNUP, false);
    }

    // ── REG_UCD_006 — Send reset OTP ─────────────────────────────────────────

    @Override
    @Transactional
    public String sendResetOtp(SendOtpRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        LocalDateTime now = LocalDateTime.now();

        Optional<OtpRecord> existing = otpRecordRepository
                .findTopByEmailAndPurposeOrderByCreatedAtDesc(email, OtpPurpose.RESET);

        if (existing.isPresent()) {
            OtpRecord record = existing.get();

            if (now.isBefore(record.getResendAllowedAt())) {
                throw new OtpException("Please wait before requesting a new code.");
            }

            boolean windowExpired = now.isAfter(record.getHourWindowStart().plusHours(1));
            int sendsThisHour = windowExpired ? 0 : record.getSendsThisHour();

            if (sendsThisHour >= otpProperties.getMaxSendsPerHour()) {
                throw new OtpException("Maximum OTP requests reached. Please try again later.");
            }

            otpRecordRepository.deleteAllByEmailAndPurpose(email, OtpPurpose.RESET);
        }

        String rawOtp = generateRawOtp();
        String nonce  = generateNonce();
        String hash   = hmac(otpProperties.getSecret() + nonce, rawOtp);

        int previousSends = existing.map(r -> {
            boolean expired = now.isAfter(r.getHourWindowStart().plusHours(1));
            return expired ? 0 : r.getSendsThisHour();
        }).orElse(0);

        LocalDateTime windowStart = existing.map(r ->
                now.isAfter(r.getHourWindowStart().plusHours(1)) ? now : r.getHourWindowStart()
        ).orElse(now);

        OtpRecord newRecord = OtpRecord.builder()
                .email(email)
                .purpose(OtpPurpose.RESET)
                .otpHash(hash)
                .nonce(nonce)
                .expiresAt(now.plusMinutes(otpProperties.getExpiryMinutes()))
                .verifyAttempts(0)
                .verified(false)
                .resendAllowedAt(now.plusSeconds(otpProperties.getResendCooldownSeconds()))
                .sendsThisHour(previousSends + 1)
                .hourWindowStart(windowStart)
                .build();

        otpRecordRepository.save(newRecord);
        emailService.sendResetOtpEmail(email, rawOtp);

        return otpProperties.isShowInDev() ? rawOtp : null;
    }

    // ── REG_UCD_006 — Verify reset OTP ───────────────────────────────────────

    @Override
    @Transactional
    public boolean verifyResetOtp(VerifyOtpRequest request) {
        return verifyOtp(request, OtpPurpose.RESET, true);
    }

    // ── Shared verify logic ───────────────────────────────────────────────────

    /**
     * Core OTP verification — shared by signup and reset flows.
     *
     * @param request    email + submitted OTP
     * @param purpose    which OTP namespace to look up
     * @param markVerified if {@code true}, sets {@code verified=true} on the record upon success
     */
    private boolean verifyOtp(VerifyOtpRequest request, OtpPurpose purpose, boolean markVerified) {
        String email  = request.getEmail().toLowerCase().trim();
        String rawOtp = request.getOtp();

        OtpRecord record = otpRecordRepository
                .findTopByEmailAndPurposeOrderByCreatedAtDesc(email, purpose)
                .orElseThrow(() -> new OtpException("No OTP found for this email. Please request a new code."));

        if (record.getVerifyAttempts() >= otpProperties.getMaxVerifyAttempts()) {
            throw new OtpException("Maximum verification attempts reached. Please request a new code.");
        }

        record.setVerifyAttempts(record.getVerifyAttempts() + 1);
        otpRecordRepository.save(record);

        if (LocalDateTime.now().isAfter(record.getExpiresAt())) {
            throw new OtpException("OTP has expired. Please request a new code.");
        }

        String expectedHash = hmac(otpProperties.getSecret() + record.getNonce(), rawOtp);
        boolean match = expectedHash.equals(record.getOtpHash());

        if (match && markVerified) {
            record.setVerified(true);
            otpRecordRepository.save(record);
        }

        return match;
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private String generateRawOtp() {
        int otp = SECURE_RANDOM.nextInt(10_000);
        return String.format("%04d", otp);
    }

    private String generateNonce() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private String hmac(String key, String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(key.getBytes(), HMAC_ALGORITHM));
            return HexFormat.of().formatHex(mac.doFinal(data.getBytes()));
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new IllegalStateException("HMAC computation failed", e);
        }
    }
}
