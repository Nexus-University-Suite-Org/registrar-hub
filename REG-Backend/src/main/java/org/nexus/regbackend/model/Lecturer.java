package org.nexus.regbackend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lecturers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lecturer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String lecturerNumber;

    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 255)
    private String address;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(length = 150)
    private String specialization;

    @Column(nullable = false)
    private LocalDate employmentDate;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(length = 500)
    private String avatarUrl;

    @Column(columnDefinition = "TEXT")
    private String inviteToken;

    private LocalDateTime inviteCreatedAt;

    @Column(nullable = false)
    private boolean inviteEmailSent;

    @Column(nullable = false)
    private Role role;

    @ElementCollection
    @CollectionTable(name = "lecturer_assigned_course_units", joinColumns = @JoinColumn(name = "lecturer_id"))
    @Column(name = "course_unit_id")
    private List<Long> assignedCourseUnits = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    private void prePersist() {
        this.role = Role.LECTURER;
        if (this.status == null) this.status = "Active";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    private void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
