package org.nexus.regbackend.service;

import org.nexus.regbackend.dto.ChangePasswordRequest;
import org.nexus.regbackend.dto.RegistrarResponse;
import org.nexus.regbackend.dto.UpdateRegistrarRequest;
import org.nexus.regbackend.model.Registrar;

/**
 * REG_UCD_007 / REG_UCD_008 / REG_UCD_009 — Registrar account operations.
 */
public interface RegistrarService {

    /**
     * REG_UCD_007 — Returns the profile for the given {@code userId}.
     *
     * <p>Authorization: owner or admin only. Authorization is derived from
     * the authenticated {@code principal} — never from the path ID alone.
     *
     * @param userId    path variable — the account to retrieve
     * @param principal the authenticated registrar resolved from the JWT
     * @return the registrar profile
     */
    RegistrarResponse getRegistrar(Long userId, Registrar principal);

    /**
     * REG_UCD_008 — Merges supplied fields onto the existing registrar record.
     *
     * <p>Merge-on-null semantics: a {@code null} field in the request leaves
     * the existing value unchanged. Empty strings are treated as no-change.
     *
     * <p>Authorization: same owner-or-admin rule as {@link #getRegistrar}.
     *
     * @param userId    path variable — the account to update
     * @param request   partial update payload
     * @param principal the authenticated registrar resolved from the JWT
     * @return the updated registrar profile
     */
    RegistrarResponse updateRegistrar(Long userId, UpdateRegistrarRequest request, Registrar principal);

    /**
     * REG_UCD_009 — Changes the password for an authenticated registrar.
     *
     * <p>The caller must supply their current password for ownership verification.
     * On success all refresh tokens are revoked, forcing a re-login.
     *
     * <p>Authorization: owner only — a registrar may only change their own password.
     *
     * @param userId    path variable — the account whose password is being changed
     * @param request   contains currentPassword, newPassword, confirmPassword
     * @param principal the authenticated registrar resolved from the JWT
     */
    void changePassword(Long userId, ChangePasswordRequest request, Registrar principal);
}
