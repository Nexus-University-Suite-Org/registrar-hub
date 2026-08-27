package org.nexus.regbackend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Registrar account — one row per registered registrar.
 * Password is stored as a BCrypt hash; plaintext is never persisted.
 */
@Entity
@Table(
        name = "registrars",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_registrar_email",    columnNames = "email"),
                @UniqueConstraint(name = "uq_registrar_username", columnNames = "username"),
                @UniqueConstraint(name = "uq_registrar_staff_id", columnNames = "staffId")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Registrar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Identity ─────────────────────────────────────────────────────────────

    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    /** BCrypt hash — never the raw password. */
    @Column(nullable = false)
    private String passwordHash;

    // ── Professional details ─────────────────────────────────────────────────

    /** Employee / staff ID issued by the institution. */
    @Column(nullable = false, unique = true, length = 50)
    private String staffId;

    @Column(nullable = false, length = 100)
    private String institution;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(nullable = false, length = 20)
    private String phoneNumber;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    // ── System fields ─────────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(nullable = false)
    private boolean emailVerified;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    private void prePersist() {
        this.role        = Role.REGISTRAR;
        this.emailVerified = false;
        this.createdAt   = LocalDateTime.now();
        this.updatedAt   = LocalDateTime.now();
    }

    @PreUpdate
    private void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
