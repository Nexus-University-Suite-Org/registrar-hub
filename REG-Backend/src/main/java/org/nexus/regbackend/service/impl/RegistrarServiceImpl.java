package org.nexus.regbackend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nexus.regbackend.dto.RegistrarResponse;
import org.nexus.regbackend.dto.UpdateRegistrarRequest;
import org.nexus.regbackend.mapper.RegistrarMapper;
import org.nexus.regbackend.model.Registrar;
import org.nexus.regbackend.model.Role;
import org.nexus.regbackend.repository.RegistrarRepository;
import org.nexus.regbackend.service.RegistrarService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * REG_UCD_007 / REG_UCD_008 implementation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RegistrarServiceImpl implements RegistrarService {

    private final RegistrarRepository registrarRepository;
    private final RegistrarMapper     registrarMapper;

    // ── REG_UCD_007 — View account ────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public RegistrarResponse getRegistrar(Long userId, Registrar principal) {
        authorize(userId, principal, "view");

        Registrar target = registrarRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Registrar not found."));

        log.info("Registrar profile viewed: requestedId={}, principalId={}, role={}",
                userId, principal.getId(), principal.getRole());

        return registrarMapper.toResponse(target);
    }

    // ── REG_UCD_008 — Update account ──────────────────────────────────────────

    @Override
    @Transactional
    public RegistrarResponse updateRegistrar(Long userId, UpdateRegistrarRequest request, Registrar principal) {
        authorize(userId, principal, "update");

        Registrar target = registrarRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Registrar not found."));

        // Merge-on-null: only overwrite fields that are explicitly supplied
        if (hasValue(request.getFirstName()))   target.setFirstName(request.getFirstName().trim());
        if (hasValue(request.getLastName()))    target.setLastName(request.getLastName().trim());
        if (hasValue(request.getStaffId()))     target.setStaffId(request.getStaffId().trim());
        if (hasValue(request.getInstitution())) target.setInstitution(request.getInstitution().trim());
        if (hasValue(request.getDepartment()))  target.setDepartment(request.getDepartment().trim());
        if (hasValue(request.getPhoneNumber())) target.setPhoneNumber(request.getPhoneNumber().trim());
        if (request.getDateOfBirth() != null)   target.setDateOfBirth(request.getDateOfBirth());

        Registrar saved = registrarRepository.save(target);

        log.info("Registrar profile updated: requestedId={}, principalId={}, role={}",
                userId, principal.getId(), principal.getRole());

        return registrarMapper.toResponse(saved);
    }

    // ── Shared helpers ────────────────────────────────────────────────────────

    /**
     * Enforces the owner-or-admin rule.
     * Authorization always derives from the authenticated principal (Validation Rule 1).
     */
    private void authorize(Long userId, Registrar principal, String action) {
        boolean isSelf  = principal.getId().equals(userId);
        boolean isAdmin = principal.getRole() == Role.ADMIN;

        if (!isSelf && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not authorized to " + action + " this account.");
        }
    }

    /** Returns true when a string field was supplied and is not blank. */
    private boolean hasValue(String value) {
        return value != null && !value.isBlank();
    }
}
