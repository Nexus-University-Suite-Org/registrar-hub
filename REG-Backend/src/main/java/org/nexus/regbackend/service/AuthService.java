package org.nexus.regbackend.service;

import org.nexus.regbackend.dto.LoginRequest;
import org.nexus.regbackend.dto.LoginResponse;
import org.nexus.regbackend.dto.RegistrarResponse;
import org.nexus.regbackend.dto.ResetPasswordRequest;
import org.nexus.regbackend.dto.SignUpRequest;

/**
 * REG_UCD_001 / REG_UCD_002 / REG_UCD_003 / REG_UCD_006 — Registrar authentication and account creation.
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
     * REG_UCD_001 — Revokes the entire refresh-token family for the authenticated registrar.
     * Access-token expiry remains stateless and is not individually revoked.
     *
     * @param email the authenticated registrar's email (JWT subject)
     */
    void logout(String email);

    /**
     * REG_UCD_006 — Resets the registrar's password.
     * Succeeds only when a server-side verified reset challenge exists for the email.
     * Never trusts any client-supplied "otpVerified" flag.
     *
     * @param request contains email and newPassword
     */
    void resetPassword(ResetPasswordRequest request);
}
