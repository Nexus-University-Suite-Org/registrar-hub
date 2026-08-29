package org.nexus.regbackend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nexus.regbackend.dto.RegistrarResponse;
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
 * REG_UCD_007 implementation.
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
        // Validation Rule 2 & 3: authorize from principal, never from the path ID alone
        boolean isSelf  = principal.getId().equals(userId);
        boolean isAdmin = principal.getRole() == Role.ADMIN;

        if (!isSelf && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not authorized to view this account.");
        }

        Registrar target = registrarRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Registrar not found."));

        log.info("Registrar profile viewed: requestedId={}, principalId={}, role={}",
                userId, principal.getId(), principal.getRole());

        return registrarMapper.toResponse(target);
    }
}
