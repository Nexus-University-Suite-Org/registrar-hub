package org.nexus.regbackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.ApiResponse;
import org.nexus.regbackend.dto.ChangeEmailRequest;
import org.nexus.regbackend.dto.ChangePasswordRequest;
import org.nexus.regbackend.dto.RegistrarResponse;
import org.nexus.regbackend.dto.SendEmailChangeOtpRequest;
import org.nexus.regbackend.dto.UpdateRegistrarRequest;
import org.nexus.regbackend.model.Registrar;
import org.nexus.regbackend.repository.RegistrarRepository;
import org.nexus.regbackend.service.RegistrarService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

/**
 * REG_UCD_007 / REG_UCD_008 / REG_UCD_009 / REG_UCD_010 — Registrar account operations.
 * Base URL: /api/v1/registrars
 */
@RestController
@RequestMapping("/api/v1/registrars")
@RequiredArgsConstructor
public class RegistrarController {

    private final RegistrarService    registrarService;
    private final RegistrarRepository registrarRepository;

    /**
     * REG_UCD_007 — View a registrar account.
     * GET /api/v1/registrars/{userId}
     *
     * <p>Validation Rule 1: requires a valid Bearer access token (enforced by SecurityConfig).
     * <p>Validation Rules 2 & 3: owner-or-admin check enforced in {@link RegistrarService}.
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<RegistrarResponse>> getRegistrar(
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails) {

        Registrar principal = resolvePrincipal(userDetails);
        RegistrarResponse response = registrarService.getRegistrar(userId, principal);
        return ApiResponse.ok("Registrar profile retrieved.", response);
    }

    /**
     * REG_UCD_008 — Update a registrar account (partial / merge-on-null).
     * PUT /api/v1/registrars/{userId}
     *
     * <p>Validation Rule 1: requires a valid Bearer access token.
     * <p>Validation Rule 2: same owner-or-admin check as GET.
     */
    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<RegistrarResponse>> updateRegistrar(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateRegistrarRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Registrar principal = resolvePrincipal(userDetails);
        RegistrarResponse response = registrarService.updateRegistrar(userId, request, principal);
        return ApiResponse.ok("Registrar profile updated.", response);
    }

    /**
     * REG_UCD_009 — Change password (authenticated, owner only).
     * PUT /api/v1/registrars/{userId}/password
     *
     * <p>Requires the caller to supply their current password.
     * On success all refresh tokens are revoked — the client must re-login.
     */
    @PutMapping("/{userId}/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @PathVariable Long userId,
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Registrar principal = resolvePrincipal(userDetails);
        registrarService.changePassword(userId, request, principal);
        return ApiResponse.ok("Password changed successfully. Please log in again.", null);
    }

    /**
     * REG_UCD_010 — Step 1: send OTP to the new email address.
     * POST /api/v1/registrars/{userId}/email/send-otp
     *
     * <p>Validates that the new address is not already taken before dispatching.
     * Requires a valid Bearer access token (owner only).
     */
    @PostMapping("/{userId}/email/send-otp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendEmailChangeOtp(
            @PathVariable Long userId,
            @Valid @RequestBody SendEmailChangeOtpRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Registrar principal = resolvePrincipal(userDetails);
        String devOtp = registrarService.sendEmailChangeOtp(userId, request, principal);

        Map<String, Object> data = devOtp != null
                ? Map.of("sent", true, "otp", devOtp)
                : Map.of("sent", true);

        return ApiResponse.ok("Verification code sent to your new email address.", data);
    }

    /**
     * REG_UCD_010 — Step 2: verify OTP and commit new email address.
     * PUT /api/v1/registrars/{userId}/email
     *
     * <p>The OTP must match the server-side EMAIL_CHANGE record — no client flag is trusted.
     * Requires a valid Bearer access token (owner only).
     */
    @PutMapping("/{userId}/email")
    public ResponseEntity<ApiResponse<RegistrarResponse>> changeEmail(
            @PathVariable Long userId,
            @Valid @RequestBody ChangeEmailRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Registrar principal = resolvePrincipal(userDetails);
        RegistrarResponse response = registrarService.changeEmail(userId, request, principal);
        return ApiResponse.ok("Email address updated successfully.", response);
    }

    // ── Shared helpers ────────────────────────────────────────────────────────

    /** Resolves the full {@link Registrar} entity from the JWT principal. */
    private Registrar resolvePrincipal(UserDetails userDetails) {
        return registrarRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Authenticated registrar not found."));
    }
}
