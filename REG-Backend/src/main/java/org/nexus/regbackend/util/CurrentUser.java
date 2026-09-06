package org.nexus.regbackend.util;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.model.Registrar;
import org.nexus.regbackend.repository.RegistrarRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/**
 * Resolves the authenticated registrar from the SecurityContext.
 * The JWT filter sets the principal for any request carrying a valid Bearer token.
 */
@Component
@RequiredArgsConstructor
public class CurrentUser {

    private final RegistrarRepository registrarRepository;

    public Registrar registrar() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated.");
        }
        return registrarRepository.findByEmail(auth.getName().toLowerCase().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Account not found."));
    }
}