package org.nexus.regbackend.service;

import org.nexus.regbackend.dto.ChangeEmailRequest;
import org.nexus.regbackend.dto.ChangePasswordRequest;
import org.nexus.regbackend.dto.ChangeStaffIdRequest;
import org.nexus.regbackend.dto.ChangeUsernameRequest;
import org.nexus.regbackend.dto.RegistrarResponse;
import org.nexus.regbackend.dto.SendEmailChangeOtpRequest;
import org.nexus.regbackend.dto.UpdateRegistrarRequest;
import org.nexus.regbackend.model.Registrar;

/**
 * REG_UCD_007 / REG_UCD_008 / REG_UCD_009 / REG_UCD_010 / REG_UCD_011 / REG_UCD_012 — Registrar account operations.
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

    /**
     * REG_UCD_010 — Step 1: sends an OTP to the requested new email address.
     *
     * <p>Authorization: owner only.
     * Checks that the new email is not already registered before dispatching.
     *
     * @param userId    path variable — must match the authenticated principal
     * @param request   carries the new email address
     * @param principal the authenticated registrar resolved from the JWT
     * @return the raw OTP only when {@code otp.show-in-dev=true}; otherwise {@code null}
     */
    String sendEmailChangeOtp(Long userId, SendEmailChangeOtpRequest request, Registrar principal);

    /**
     * REG_UCD_010 — Step 2: verifies the OTP and commits the new email address.
     *
     * <p>Authorization: owner only.
     * The OTP must have been verified server-side against the EMAIL_CHANGE record
     * keyed on the new address — a client-supplied flag is never trusted.
     *
     * @param userId    path variable — must match the authenticated principal
     * @param request   carries the new email address and submitted OTP
     * @param principal the authenticated registrar resolved from the JWT
     * @return the updated registrar profile with the new email committed
     */
    RegistrarResponse changeEmail(Long userId, ChangeEmailRequest request, Registrar principal);

    /**
     * REG_UCD_011 — Changes the username for the authenticated registrar.
     *
     * <p>Authorization: owner only.
     * The new username must not already be taken by another account.
     *
     * @param userId    path variable — must match the authenticated principal
     * @param request   carries the new username
     * @param principal the authenticated registrar resolved from the JWT
     * @return the updated registrar profile
     */
    RegistrarResponse changeUsername(Long userId, ChangeUsernameRequest request, Registrar principal);

    /**
     * REG_UCD_012 — Changes the staff ID for the authenticated registrar.
     *
     * <p>Authorization: owner only.
     * The new staff ID must not already be registered to another account.
     *
     * @param userId    path variable — must match the authenticated principal
     * @param request   carries the new staff ID
     * @param principal the authenticated registrar resolved from the JWT
     * @return the updated registrar profile
     */
    RegistrarResponse changeStaffId(Long userId, ChangeStaffIdRequest request, Registrar principal);
}
