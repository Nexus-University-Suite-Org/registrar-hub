package org.nexus.regbackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.*;
import org.nexus.regbackend.service.AuthService;
import org.nexus.regbackend.service.OtpService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REG_UCD_001 / REG_UCD_002 / REG_UCD_003 / REG_UCD_004 / REG_UCD_005 / REG_UCD_006
 * Base URL: /api/v1/auth
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService  otpService;

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
     * REG_UCD_001 — Registrar logout.
     * POST /api/v1/auth/logout
     * Requires a valid Bearer access token. Revokes the entire refresh-token family.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @AuthenticationPrincipal UserDetails principal) {

        authService.logout(principal.getUsername());
        return ApiResponse.ok("Logged out successfully.", null);
    }

    /**
     * REG_UCD_006 — Step 1: send password-reset OTP.
     * POST /api/v1/auth/send-reset-otp
     */
    @PostMapping("/send-reset-otp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendResetOtp(
            @Valid @RequestBody SendOtpRequest request) {

        String devOtp = otpService.sendResetOtp(request);

        Map<String, Object> data = devOtp != null
                ? Map.of("sent", true, "otp", devOtp)
                : Map.of("sent", true);

        return ApiResponse.ok("Password reset code sent. Please check your email.", data);
    }

    /**
     * REG_UCD_006 — Step 2: verify password-reset OTP (sets server-side verified flag).
     * POST /api/v1/auth/verify-reset-otp
     */
    @PostMapping("/verify-reset-otp")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> verifyResetOtp(
            @Valid @RequestBody VerifyOtpRequest request) {

        boolean valid = otpService.verifyResetOtp(request);
        return ApiResponse.ok("OTP verified.", Map.of("valid", valid));
    }

    /**
     * REG_UCD_006 — Step 3: reset the password using the server-verified challenge.
     * POST /api/v1/auth/reset-password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        authService.resetPassword(request);
        return ApiResponse.ok("Password reset successfully. Please log in with your new password.", null);
    }
}
