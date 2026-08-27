package org.nexus.regbackend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.nexus.regbackend.configuration.JwtProperties;
import org.nexus.regbackend.dto.*;
import org.nexus.regbackend.exception.DuplicateResourceException;
import org.nexus.regbackend.exception.OtpException;
import org.nexus.regbackend.exception.ValidationException;
import org.nexus.regbackend.model.RefreshToken;
import org.nexus.regbackend.model.Registrar;
import org.nexus.regbackend.repository.OtpRecordRepository;
import org.nexus.regbackend.repository.RefreshTokenRepository;
import org.nexus.regbackend.repository.RegistrarRepository;
import org.nexus.regbackend.service.AuthService;
import org.nexus.regbackend.service.JwtService;
import org.nexus.regbackend.service.OtpService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final RegistrarRepository   registrarRepository;
    private final OtpRecordRepository   otpRecordRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OtpService            otpService;
    private final JwtService            jwtService;
    private final PasswordEncoder       passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtProperties         jwtProperties;

    // ── REG_UCD_003 — Sign Up ─────────────────────────────────────────────────

    @Override
    @Transactional
    public RegistrarResponse signUp(SignUpRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("Passwords do not match.");
        }

        if (registrarRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new DuplicateResourceException("An account with this email already exists.");
        }
        if (registrarRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("This username is already taken.");
        }
        if (registrarRepository.existsByStaffId(request.getStaffId())) {
            throw new DuplicateResourceException("This staff ID is already registered.");
        }

        VerifyOtpRequest otpCheck = new VerifyOtpRequest();
        otpCheck.setEmail(request.getEmail());
        otpCheck.setOtp(request.getOtp());
        if (!otpService.verifySignupOtp(otpCheck)) {
            throw new OtpException("Invalid or expired OTP. Please verify your email again.");
        }

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
        otpRecordRepository.deleteAllByEmail(saved.getEmail());

        log.info("Registrar account created: id={}, email={}", saved.getId(), saved.getEmail());
        return toRegistrarResponse(saved);
    }

    // ── REG_UCD_002 — Login ───────────────────────────────────────────────────

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        // Resolve identifier — accepts email or username
        String identifier = request.getIdentifier().trim().toLowerCase();
        Registrar registrar = registrarRepository.findByEmail(identifier)
                .or(() -> registrarRepository.findByUsername(identifier))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials."));

        // Authenticate via Spring Security — validates password against BCrypt hash
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(registrar.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials.");
        }

        // Revoke any existing refresh token for this registrar (one active token per user)
        refreshTokenRepository.deleteAllByRegistrarId(registrar.getId());

        // Issue tokens
        String accessToken  = jwtService.generateAccessToken(registrar);
        String refreshToken = UUID.randomUUID().toString();

        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .token(refreshToken)
                .registrar(registrar)
                .expiresAt(LocalDateTime.now().plusSeconds(
                        jwtProperties.getRefreshTokenExpiryMs() / 1000
                ))
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        log.info("Registrar logged in: id={}, email={}", registrar.getId(), registrar.getEmail());

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtProperties.getAccessTokenExpiryMs() / 1000)
                .user(LoginResponse.UserDto.builder()
                        .id(registrar.getId())
                        .email(registrar.getEmail())
                        .username(registrar.getUsername())
                        .role(registrar.getRole().name())
                        .build())
                .profile(LoginResponse.ProfileDto.builder()
                        .firstName(registrar.getFirstName())
                        .lastName(registrar.getLastName())
                        .staffId(registrar.getStaffId())
                        .institution(registrar.getInstitution())
                        .department(registrar.getDepartment())
                        .phoneNumber(registrar.getPhoneNumber())
                        .build())
                .build();
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private RegistrarResponse toRegistrarResponse(Registrar registrar) {
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
