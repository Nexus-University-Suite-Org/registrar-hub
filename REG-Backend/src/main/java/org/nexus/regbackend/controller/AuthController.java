package org.nexus.regbackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.*;
import org.nexus.regbackend.model.Registrar;
import org.nexus.regbackend.service.AuthService;
import org.nexus.regbackend.service.OtpService;
import org.nexus.regbackend.util.CurrentUser;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REG_UCD_002 / REG_UCD_003 / REG_UCD_004 / REG_UCD_005
 * Base URL: /api/v1/auth
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService  otpService;
    private final CurrentUser currentUser;

    /**
     * REG_UCD_004 — Send sign-up OTP.
     * POST /api/v1/auth/send-signup-otp
     */
    @PostMapping("/send-signup-otp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendSignupOtp(
            @Valid @RequestBody SendOtpRequest request) {

        String devOtp = otpService.sendSignupOtp(request);

        Map<String, Object> data = devOtp != null
                ? Map.of("sent", true, "otp", devOtp)
                : Map.of("sent", true);

        return ApiResponse.ok("OTP sent successfully. Please check your email.", data);
    }

    /**
     * REG_UCD_005 — Verify sign-up OTP.
     * POST /api/v1/auth/verify-signup-otp
     */
    @PostMapping("/verify-signup-otp")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> verifySignupOtp(
            @Valid @RequestBody VerifyOtpRequest request) {

        boolean valid = otpService.verifySignupOtp(request);
        return ApiResponse.ok("OTP verified.", Map.of("valid", valid));
    }

    /**
     * REG_UCD_003 — Registrar sign-up.
     * POST /api/v1/auth/signup
     */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<RegistrarResponse>> signUp(
            @Valid @RequestBody SignUpRequest request) {

        RegistrarResponse registrar = authService.signUp(request);
        return ApiResponse.created("Registrar account created successfully.", registrar);
    }

    /**
     * REG_UCD_002 — Registrar login.
     * POST /api/v1/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response = authService.login(request);
        return ApiResponse.ok("Login successful.", response);
    }

    /**
     * Changes the authenticated registrar's password.
     * POST /api/v1/auth/change-password
     */
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(currentUser.registrar().getEmail(), request);
        return ApiResponse.ok("Password updated successfully.", Map.of("changed", true));
    }

    /**
     * Lists the authenticated registrar's active sessions (refresh tokens).
     * GET /api/v1/auth/sessions
     */
    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<SessionDto>>> sessions() {
        Registrar registrar = currentUser.registrar();
        return ApiResponse.ok("Sessions retrieved", authService.listSessions(registrar.getId()));
    }

    /**
     * Revokes all of the authenticated registrar's sessions.
     * DELETE /api/v1/auth/sessions
     */
    @DeleteMapping("/sessions")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> revokeSessions() {
        Registrar registrar = currentUser.registrar();
        authService.revokeAllSessions(registrar.getId());
        return ApiResponse.ok("All sessions signed out.", Map.of("revoked", true));
    }
}
