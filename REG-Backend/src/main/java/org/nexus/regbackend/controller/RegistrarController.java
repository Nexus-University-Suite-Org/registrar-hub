package org.nexus.regbackend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.ApiResponse;
import org.nexus.regbackend.dto.RegistrarResponse;
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

/**
 * REG_UCD_007 / REG_UCD_008 — Registrar account operations.
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

    // ── Shared helpers ────────────────────────────────────────────────────────

    /** Resolves the full {@link Registrar} entity from the JWT principal. */
    private Registrar resolvePrincipal(UserDetails userDetails) {
        return registrarRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "Authenticated registrar not found."));
    }
}
