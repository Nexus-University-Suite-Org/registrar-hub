package org.nexus.regbackend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String studentNumber;

    @Column(nullable = false, unique = true, length = 50)
    private String registrationNumber;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(nullable = false, length = 150)
    private String program;

    @Column(nullable = false)
    private Integer yearOfStudy;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(nullable = false)
    private LocalDate admissionDate;

    @Column(length = 500)
    private String avatarUrl;

    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private boolean isRegistered;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    private void prePersist() {
        this.role = Role.STUDENT;
        if (this.status == null) this.status = "Active";
        this.isRegistered = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    private void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
