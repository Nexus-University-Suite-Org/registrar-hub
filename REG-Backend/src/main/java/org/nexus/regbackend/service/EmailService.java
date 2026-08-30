package org.nexus.regbackend.service;

/**
 * Sends transactional emails.
 */
public interface EmailService {

    /**
     * Sends a plain-text OTP email to the given address.
     */
    void sendOtpEmail(String to, String otp);

    /**
     * Sends a welcome email to a newly created lecturer with a link to set their password.
     */
    void sendLecturerWelcomeEmail(String to, String firstName, String setPasswordUrl);
}
