package org.nexus.regbackend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nexus.regbackend.dto.RegistrarResponse;
import org.nexus.regbackend.dto.SignUpRequest;
import org.nexus.regbackend.dto.VerifyOtpRequest;
import org.nexus.regbackend.exception.DuplicateResourceException;
import org.nexus.regbackend.exception.OtpException;
import org.nexus.regbackend.exception.ValidationException;
import org.nexus.regbackend.model.Registrar;
import org.nexus.regbackend.repository.OtpRecordRepository;
import org.nexus.regbackend.repository.RegistrarRepository;
import org.nexus.regbackend.service.AuthService;
import org.nexus.regbackend.service.OtpService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final RegistrarRepository  registrarRepository;
    private final OtpRecordRepository  otpRecordRepository;
    private final OtpService           otpService;
    private final PasswordEncoder      passwordEncoder;

    @Override
    @Transactional
    public RegistrarResponse signUp(SignUpRequest request) {
        // ── Validate password match ───────────────────────────────────────────
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("Passwords do not match.");
        }

        // ── Uniqueness checks ─────────────────────────────────────────────────
        if (registrarRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new DuplicateResourceException("An account with this email already exists.");
        }
        if (registrarRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("This username is already taken.");
        }
        if (registrarRepository.existsByStaffId(request.getStaffId())) {
            throw new DuplicateResourceException("This staff ID is already registered.");
        }

        // ── Re-verify OTP (final gate before account creation) ───────────────
        VerifyOtpRequest otpCheck = new VerifyOtpRequest();
        otpCheck.setEmail(request.getEmail());
        otpCheck.setOtp(request.getOtp());
        boolean otpValid = otpService.verifySignupOtp(otpCheck);
        if (!otpValid) {
            throw new OtpException("Invalid or expired OTP. Please verify your email again.");
        }

        // ── Persist registrar ─────────────────────────────────────────────────
        Registrar registrar = Registrar.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail().toLowerCase().trim())
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .staffId(request.getStaffId())
                .institution(request.getInstitution())
                .department(request.getDepartment())
                .phoneNumber(request.getPhoneNumber())
                .dateOfBirth(request.getDateOfBirth())
                .emailVerified(true)
                .build();

        Registrar saved = registrarRepository.save(registrar);

        // Clean up OTP records now that the account exists
        otpRecordRepository.deleteAllByEmail(saved.getEmail());

        log.info("Registrar account created: id={}, email={}", saved.getId(), saved.getEmail());

        return toResponse(saved);
    }

    // ── Mapper (kept here; extracted to RegistrarMapper when more mappings exist) ──

    private RegistrarResponse toResponse(Registrar registrar) {
        return RegistrarResponse.builder()
                .id(registrar.getId())
                .firstName(registrar.getFirstName())
                .lastName(registrar.getLastName())
                .email(registrar.getEmail())
                .username(registrar.getUsername())
                .staffId(registrar.getStaffId())
                .institution(registrar.getInstitution())
                .department(registrar.getDepartment())
                .phoneNumber(registrar.getPhoneNumber())
                .role(registrar.getRole().name())
                .build();
    }
}
