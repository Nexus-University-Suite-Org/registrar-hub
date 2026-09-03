package org.nexus.regbackend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nexus.regbackend.dto.ChangeEmailRequest;
import org.nexus.regbackend.dto.ChangePasswordRequest;
import org.nexus.regbackend.dto.ChangeUsernameRequest;
import org.nexus.regbackend.dto.RegistrarResponse;
import org.nexus.regbackend.dto.SendEmailChangeOtpRequest;
import org.nexus.regbackend.dto.UpdateRegistrarRequest;
import org.nexus.regbackend.exception.DuplicateResourceException;
import org.nexus.regbackend.exception.OtpException;
import org.nexus.regbackend.exception.ValidationException;
import org.nexus.regbackend.mapper.RegistrarMapper;
import org.nexus.regbackend.model.Registrar;
import org.nexus.regbackend.model.OtpPurpose;
import org.nexus.regbackend.model.Role;
import org.nexus.regbackend.repository.OtpRecordRepository;
import org.nexus.regbackend.repository.RefreshTokenRepository;
import org.nexus.regbackend.repository.RegistrarRepository;
import org.nexus.regbackend.service.OtpService;
import org.nexus.regbackend.service.RegistrarService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * REG_UCD_007 / REG_UCD_008 / REG_UCD_009 / REG_UCD_010 implementation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RegistrarServiceImpl implements RegistrarService {

    private final RegistrarRepository    registrarRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OtpRecordRepository    otpRecordRepository;
    private final OtpService             otpService;
    private final RegistrarMapper        registrarMapper;
    private final PasswordEncoder        passwordEncoder;

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

    // ── REG_UCD_009 — Change password ─────────────────────────────────────────

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request, Registrar principal) {
        // Authorization: owner only — admins cannot change another user's password
        if (!principal.getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not authorized to change this account's password.");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("New password and confirmation do not match.");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), principal.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Current password is incorrect.");
        }

        if (passwordEncoder.matches(request.getNewPassword(), principal.getPasswordHash())) {
            throw new ValidationException("New password must be different from the current password.");
        }

        principal.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        registrarRepository.save(principal);

        // Revoke all refresh tokens — forces re-login on all devices
        refreshTokenRepository.deleteAllByRegistrarId(principal.getId());

        log.info("Password changed: id={}", principal.getId());
    }

    // ── REG_UCD_010 — Send email-change OTP ──────────────────────────────────

    @Override
    @Transactional
    public String sendEmailChangeOtp(Long userId, SendEmailChangeOtpRequest request, Registrar principal) {
        // Authorization: owner only
        if (!principal.getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not authorized to change this account's email.");
        }

        String newEmail = request.getNewEmail().toLowerCase().trim();

        // Reject if the new address is the same as the current one
        if (principal.getEmail().equalsIgnoreCase(newEmail)) {
            throw new ValidationException("New email must be different from the current email.");
        }

        // Reject if another account already owns that address
        if (registrarRepository.existsByEmail(newEmail)) {
            throw new DuplicateResourceException("This email address is already in use.");
        }

        String devOtp = otpService.sendEmailChangeOtp(newEmail);
        log.info("Email-change OTP requested: principalId={}, newEmail={}", principal.getId(), newEmail);
        return devOtp;
    }

    // ── REG_UCD_010 — Commit email change ────────────────────────────────────

    @Override
    @Transactional
    public RegistrarResponse changeEmail(Long userId, ChangeEmailRequest request, Registrar principal) {
        // Authorization: owner only
        if (!principal.getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not authorized to change this account's email.");
        }

        String newEmail = request.getNewEmail().toLowerCase().trim();

        // Verify OTP server-side — never trust a client-supplied flag
        if (!otpService.verifyEmailChangeOtp(newEmail, request.getOtp())) {
            throw new OtpException("Invalid or expired OTP. Please request a new code.");
        }

        // Guard: re-check uniqueness in case another registrar claimed the address
        // between the send-otp and commit steps
        if (registrarRepository.existsByEmail(newEmail)) {
            throw new DuplicateResourceException("This email address is already in use.");
        }

        principal.setEmail(newEmail);
        Registrar saved = registrarRepository.save(principal);

        // Clean up OTP records for the new address
        otpRecordRepository.deleteAllByEmailAndPurpose(newEmail, OtpPurpose.EMAIL_CHANGE);

        log.info("Email changed: principalId={}, newEmail={}", principal.getId(), newEmail);
        return registrarMapper.toResponse(saved);
    }

    // ── REG_UCD_011 — Change username ─────────────────────────────────────────

    @Override
    @Transactional
    public RegistrarResponse changeUsername(Long userId, ChangeUsernameRequest request, Registrar principal) {
        // Authorization: owner only
        if (!principal.getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not authorized to change this account's username.");
        }

        String newUsername = request.getNewUsername().trim();

        // Reject if the new username is the same as the current one
        if (principal.getUsername().equalsIgnoreCase(newUsername)) {
            throw new ValidationException("New username must be different from the current username.");
        }

        // Reject if another account already owns that username
        if (registrarRepository.existsByUsername(newUsername)) {
            throw new DuplicateResourceException("This username is already taken.");
        }

        principal.setUsername(newUsername);
        Registrar saved = registrarRepository.save(principal);

        log.info("Username changed: id={}, newUsername={}", principal.getId(), newUsername);
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
