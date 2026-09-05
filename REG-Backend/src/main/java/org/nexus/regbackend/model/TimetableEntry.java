package org.nexus.regbackend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * A single weekly teaching session placed on a program's timetable.
 */
@Entity
@Table(name = "timetable_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimetableEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String program;

    @Column(length = 50)
    private String programCode;

    @Column(nullable = false, length = 50)
    private String academicYear;

    @Column(nullable = false)
    private Integer semester;

    @Column(nullable = false)
    private Integer yearOfStudy;

    @Column(nullable = false, length = 20)
    private String dayOfWeek;

    @Column(nullable = false, length = 10)
    private String startTime;

    @Column(nullable = false, length = 10)
    private String endTime;

    @Column(nullable = false, length = 200)
    private String room;

    @Column(length = 100)
    private String sessionType;

    @Column(nullable = false)
    private boolean isOnline;

    @Column(length = 100)
    private String lecturerName;

    @Column(nullable = false)
    private Long courseUnitId;

    @Column(length = 50)
    private String courseUnitCode;

    @Column(length = 200)
    private String courseUnitName;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    private void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.sessionType == null) this.sessionType = "Lecture";
    }

    @PreUpdate
    private void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}