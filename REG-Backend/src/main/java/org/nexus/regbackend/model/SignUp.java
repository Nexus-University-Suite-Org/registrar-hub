package org.nexus.regbackend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sign_ups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignUp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long lecturerId;

    @Column(length = 100)
    private String lecturerName;

    @Column(length = 150)
    private String lecturerEmail;

    @Column(nullable = false)
    private Long courseUnitId;

    @Column(length = 50)
    private String courseUnitCode;

    @Column(length = 200)
    private String courseUnitName;

    @Column(nullable = false)
    private Long courseId;

    @Column(length = 50)
    private String assignedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime assignedAt;

    @Column(length = 20)
    private String status;

    @PrePersist
    private void prePersist() {
        this.assignedAt = LocalDateTime.now();
        if (this.status == null) this.status = "active";
    }
}
