package org.nexus.regbackend.service;

/**
 * Sends transactional emails.
 */
public interface EmailService {

    /**
     * REG_UCD_004 — Sends a sign-up OTP email.
     *
     * @param to  recipient email
     * @param otp the raw 4-digit OTP (only passed here; never stored raw)
     */
    void sendOtpEmail(String to, String otp);

    /**
     * REG_UCD_006 — Sends a password-reset OTP email.
     *
     * @param to  recipient email
     * @param otp the raw 4-digit OTP (only passed here; never stored raw)
     */
    void sendResetOtpEmail(String to, String otp);
}
