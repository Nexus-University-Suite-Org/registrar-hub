package org.nexus.regbackend.service;

import org.nexus.regbackend.dto.SendOtpRequest;
import org.nexus.regbackend.dto.VerifyOtpRequest;

/**
 * REG_UCD_004 / REG_UCD_005 / REG_UCD_006 — OTP lifecycle.
 */
public interface OtpService {

    /**
     * REG_UCD_004 — Generates, hashes, stores and emails a sign-up OTP.
     * Enforces resend cooldown and hourly send cap.
     *
     * @return the raw OTP only when {@code otp.show-in-dev=true}; otherwise {@code null}
     */
    String sendSignupOtp(SendOtpRequest request);

    /**
     * REG_UCD_005 — Validates the submitted sign-up OTP against the stored hash.
     * Enforces attempt limit.
     *
     * @return {@code true} when OTP matches, is unexpired, and within attempt limit
     */
    boolean verifySignupOtp(VerifyOtpRequest request);

    /**
     * REG_UCD_006 — Generates, hashes, stores and emails a password-reset OTP.
     * Stored under purpose=RESET — fully separate namespace from signup OTPs.
     *
     * @return the raw OTP only when {@code otp.show-in-dev=true}; otherwise {@code null}
     */
    String sendResetOtp(SendOtpRequest request);

    /**
     * REG_UCD_006 — Validates the submitted reset OTP.
     * On success, flips the server-side {@code verified} flag on the OTP record.
     * A client-supplied "otpVerified" flag must never be trusted instead.
     *
     * @return {@code true} when OTP matches, is unexpired, and within attempt limit
     */
    boolean verifyResetOtp(VerifyOtpRequest request);
}
