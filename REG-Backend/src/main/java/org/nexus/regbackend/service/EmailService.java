package org.nexus.regbackend.service;

/**
 * Sends transactional emails.
 */
public interface EmailService {

    /**
     * Sends a plain-text OTP email to the given address.
     *
     * @param to      recipient email
     * @param otp     the raw 4-digit OTP (only passed here; never stored raw)
     */
    void sendOtpEmail(String to, String otp);
}
