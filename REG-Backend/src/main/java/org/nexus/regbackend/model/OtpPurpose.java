package org.nexus.regbackend.model;

/**
 * Discriminates OTP records so that signup and password-reset
 * challenges are stored and verified in fully separate namespaces.
 */
public enum OtpPurpose {
    SIGNUP,
    RESET,
    /** Authenticated email-change flow — OTP is sent to the new address. */
    EMAIL_CHANGE
}
