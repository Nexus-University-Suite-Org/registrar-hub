package org.nexus.regbackend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Stores a hashed OTP record tied to an email address.
 *
 * <ul>
 *   <li>The raw OTP is never persisted — only its HMAC-SHA256 hash.</li>
 *   <li>Each row tracks attempt count, send count within the current hour,
 *       the hour-window start, and a resend-cooldown timestamp.</li>
 * </ul>
 */
@Entity
@Table(name = "otp_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String email;

    /**
     * Separates signup OTPs from password-reset OTPs so they cannot
     * be cross-used. Defaults to SIGNUP for backwards compatibility.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OtpPurpose purpose = OtpPurpose.SIGNUP;

    /**
     * Set to {@code true} server-side when verify-reset-otp succeeds.
     * reset-password checks this flag — never a client-supplied value.
     */
    @Column(nullable = false)
    @Builder.Default
    private boolean verified = false;

    /** HMAC-SHA256(secret + nonce, rawOtp) — hex-encoded. */
    @Column(nullable = false)
    private String otpHash;

    /** Random nonce mixed into the hash to prevent rainbow-table attacks. */
    @Column(nullable = false, length = 64)
    private String nonce;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    /** How many verification attempts have been made against this record. */
    @Column(nullable = false)
    private int verifyAttempts;

    /** Earliest time a resend is allowed. */
    @Column(nullable = false)
    private LocalDateTime resendAllowedAt;

    /** Total sends made in the current hourly window. */
    @Column(nullable = false)
    private int sendsThisHour;

    /** Start of the current hourly tracking window. */
    @Column(nullable = false)
    private LocalDateTime hourWindowStart;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    private void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
