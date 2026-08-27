package org.nexus.regbackend.service;

import org.nexus.regbackend.dto.LoginRequest;
import org.nexus.regbackend.dto.LoginResponse;
import org.nexus.regbackend.dto.RegistrarResponse;
import org.nexus.regbackend.dto.SignUpRequest;

/**
 * REG_UCD_002 / REG_UCD_003 — Registrar authentication and account creation.
 */
public interface AuthService {

    /**
     * REG_UCD_003 — Creates a new registrar account.
     */
    RegistrarResponse signUp(SignUpRequest request);

    /**
     * REG_UCD_002 — Authenticates a registrar by email/username + password.
     * Issues a JWT access token and a persisted refresh token.
     *
     * @param request login payload
     * @return tokens + user + profile
     */
    LoginResponse login(LoginRequest request);
}
