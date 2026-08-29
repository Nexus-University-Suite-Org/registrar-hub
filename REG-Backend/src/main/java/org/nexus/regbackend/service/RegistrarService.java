package org.nexus.regbackend.service;

import org.nexus.regbackend.dto.RegistrarResponse;
import org.nexus.regbackend.model.Registrar;

/**
 * REG_UCD_007 — Registrar account read operations.
 */
public interface RegistrarService {

    /**
     * REG_UCD_007 — Returns the profile for the given {@code userId}.
     *
     * <p>Authorization rules (Validation Rules 2 and 3):
     * <ul>
     *   <li>A registrar may only read their own account.</li>
     *   <li>An administrator may read any account.</li>
     *   <li>Authorization is derived from the authenticated {@code principal}
     *       — never from an ID supplied only in the request.</li>
     * </ul>
     *
     * @param userId    path variable — the account to retrieve
     * @param principal the authenticated registrar resolved from the JWT
     * @return the registrar profile
     */
    RegistrarResponse getRegistrar(Long userId, Registrar principal);
}
