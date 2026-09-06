package org.nexus.regbackend.controller;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.ApiResponse;
import org.nexus.regbackend.model.Student;
import org.nexus.regbackend.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Settings → Database: table stats + student data migration.
 */
@RestController
@RequestMapping("/api/settings/db")
@RequiredArgsConstructor
public class SettingsDatabaseController {

    private final StudentRepository         studentRepository;
    private final CourseRepository          courseRepository;
    private final CourseUnitRepository      courseUnitRepository;
    private final LecturerRepository        lecturerRepository;
    private final FeeAssignmentRepository   feeAssignmentRepository;
    private final DepartmentRepository      departmentRepository;
    private final ServiceRequestRepository  serviceRequestRepository;
    private final AcademicCalendarEventRepository calendarEventRepository;
    private final UniversityServiceRepository   universityServiceRepository;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> stats() {
        Map<String, Object> counts = new LinkedHashMap<>();
        counts.put("students", studentRepository.count());
        counts.put("courses", courseRepository.count());
        counts.put("course_units", courseUnitRepository.count());
        counts.put("lecturers", lecturerRepository.count());
        counts.put("fee_assignments", feeAssignmentRepository.count());
        counts.put("departments", departmentRepository.count());
        counts.put("service_requests", serviceRequestRepository.count());
        counts.put("calendar_events", calendarEventRepository.count());
        counts.put("university_services", universityServiceRepository.count());
        return ApiResponse.ok("Database stats retrieved", counts);
    }

    @PostMapping("/migrate-students")
    public ResponseEntity<ApiResponse<Map<String, Object>>> migrateStudents() {
        List<Student> students = studentRepository.findAll();
        int updated = 0;
        int scanned = students.size();
        for (Student s : students) {
            boolean changed = false;
            if ((s.getDepartment() == null || s.getDepartment().isBlank())
                    && s.getProgram() != null && !s.getProgram().isBlank()) {
                // Fall back to program-derived department when the student has one
                s.setDepartment(defaultDepartment(s.getProgram()));
                changed = true;
            }
            if (changed) {
                updated++;
            }
        }
        studentRepository.saveAll(students);
        return ApiResponse.ok("Student migration complete",
                Map.of("scanned", scanned, "updated", updated));
    }

    private String defaultDepartment(String program) {
        if (program == null || program.isBlank()) return "";
        String lower = program.toLowerCase();
        if (lower.contains("computer") || lower.contains("information")
                || lower.contains("software") || lower.contains("data")
                || lower.contains("cyber") || lower.contains("artificial")) {
            return "Computer Science";
        }
        if (lower.contains("business") || lower.contains("account")
                || lower.contains("finance") || lower.contains("marketing")
                || lower.contains("economic")) {
            return "Business Administration";
        }
        if (lower.contains("engin") || lower.contains("mechanical")
                || lower.contains("electrical") || lower.contains("civil")) {
            return "Engineering";
        }
        if (lower.contains("medicine") || lower.contains("nursing")
                || lower.contains("health") || lower.contains("pharm")) {
            return "Medicine and Health Sciences";
        }
        if (lower.contains("law")) return "Law";
        if (lower.contains("education")) return "Education";
        if (lower.contains("art")) return "Arts and Humanities";
        return "Other Specialized Departments";
    }
}