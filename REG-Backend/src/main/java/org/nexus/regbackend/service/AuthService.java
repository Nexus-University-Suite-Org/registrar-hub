package org.nexus.regbackend.service;

import org.nexus.regbackend.dto.ChangePasswordRequest;
import org.nexus.regbackend.dto.LoginRequest;
import org.nexus.regbackend.dto.LoginResponse;
import org.nexus.regbackend.dto.RegistrarResponse;
import org.nexus.regbackend.dto.SessionDto;
import org.nexus.regbackend.dto.SignUpRequest;

import java.util.List;

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

    /**
     * Verifies the current password and sets a new BCrypt hash.
     * Revokes all existing refresh tokens.
     */
    void changePassword(String email, ChangePasswordRequest request);

    /**
     * Lists persisted sessions (refresh tokens) for a registrar.
     */
    List<SessionDto> listSessions(Long registrarId);

    /**
     * Revokes all refresh tokens for a registrar (sign-out everywhere).
     */
    void revokeAllSessions(Long registrarId);
}
