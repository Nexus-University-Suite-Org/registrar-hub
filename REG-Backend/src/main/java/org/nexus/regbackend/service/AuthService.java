package org.nexus.regbackend.service;

import org.nexus.regbackend.dto.RegistrarResponse;
import org.nexus.regbackend.dto.SignUpRequest;

/**
 * REG_UCD_003 — Registrar account creation.
 */
public interface AuthService {

    /**
     * Creates a new registrar account.
     * Validates password match, uniqueness, and that the email OTP was verified.
     *
     * @param request validated sign-up payload
     * @return slim view of the persisted account
     */
    RegistrarResponse signUp(SignUpRequest request);
}
