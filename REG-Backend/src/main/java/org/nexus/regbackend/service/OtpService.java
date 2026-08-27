package org.nexus.regbackend.service;

import org.nexus.regbackend.dto.SendOtpRequest;
import org.nexus.regbackend.dto.VerifyOtpRequest;

/**
 * REG_UCD_004 / REG_UCD_005 — OTP lifecycle.
 */
public interface OtpService {

    /**
     * Generates, hashes, stores and emails a 4-digit OTP.
     * Enforces resend cooldown and hourly send cap.
     *
     * @return the raw OTP only when {@code otp.show-in-dev=true}; otherwise {@code null}
     */
    String sendSignupOtp(SendOtpRequest request);

    /**
     * Validates the submitted OTP against the stored hash.
     * Enforces attempt limit.
     *
     * @return {@code true} when OTP matches, is unexpired, and within attempt limit
     */
    boolean verifySignupOtp(VerifyOtpRequest request);
}
