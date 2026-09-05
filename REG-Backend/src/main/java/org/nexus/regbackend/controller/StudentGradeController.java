package org.nexus.regbackend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.ApiResponse;
import org.nexus.regbackend.model.Role;
import org.nexus.regbackend.repository.StudentRepository;
import org.nexus.regbackend.service.LecturerApiClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Exposes lecturer-submitted grades (8084) to the registrar portal on 8082.
 * Student ids are remapped from the lecturer DB to the registrar DB by email so
 * the registrar Results page can merge grades with its own student records.
 */
@RestController
@RequestMapping("/api/student-grades")
@RequiredArgsConstructor
public class StudentGradeController {

    private final LecturerApiClient lecturerApiClient;
    private final StudentRepository studentRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> list(
            @RequestParam(required = false) String course_id,
            @RequestParam(required = false) String student_id) {
        StringBuilder path = new StringBuilder("/api/student-grades");
        List<String> params = new ArrayList<>();
        if (course_id != null && !course_id.isBlank()) params.add("course_id=" + course_id);
        if (student_id != null && !student_id.isBlank()) params.add("student_id=" + student_id);
        if (!params.isEmpty()) path.append("?").append(String.join("&", params));

        List<JsonNode> grades = lecturerApiClient.getList(path.toString());

        Map<String, String> lecturerEmailById = lecturerStudentEmails();
        Map<String, Long> registrarIdByEmail = registrarStudentIdsByEmail();
        Map<String, Map<String, Object>> courseInfo = lecturerCourseInfo();

        List<Map<String, Object>> result = new ArrayList<>();
        for (JsonNode grade : grades) {
            Map<String, Object> row = lecturerApiClient.toMap(grade);

            String originalStudentId =
                    grade.hasNonNull("student_id") ? String.valueOf(grade.get("student_id").asLong()) : null;
            if (originalStudentId != null) {
                String email = lecturerEmailById.get(originalStudentId);
                if (email != null) {
                    Long registrarId = registrarIdByEmail.get(email.toLowerCase());
                    if (registrarId != null) {
                        row.put("student_id", registrarId);
                        row.put("original_lecturer_student_id", originalStudentId);
                    }
                }
            }

            String courseId =
                    grade.hasNonNull("course_id") ? String.valueOf(grade.get("course_id").asLong()) : null;
            if (courseId != null) {
                Map<String, Object> info = courseInfo.get(courseId);
                if (info != null) {
                    row.putIfAbsent("course_code", info.get("course_code"));
                    row.putIfAbsent("course_title", info.get("course_title"));
                    row.putIfAbsent("credits", info.get("credits"));
                }
            }

            result.add(row);
        }

        return ApiResponse.ok("Student grades retrieved", result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> getById(@PathVariable Long id) {
        return ApiResponse.ok("Student grade retrieved",
                lecturerApiClient.getSingle("/api/student-grades/" + id));
    }

    @GetMapping("/{id}/")
    public ResponseEntity<ApiResponse<Object>> getByIdSlash(@PathVariable Long id) {
        return getById(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> update(
            @PathVariable Long id, @RequestBody Map<String, Object> body) {
        return doUpdate(id, body);
    }

    @PutMapping("/{id}/")
    public ResponseEntity<ApiResponse<Object>> updateSlash(
            @PathVariable Long id, @RequestBody Map<String, Object> body) {
        return doUpdate(id, body);
    }

    private ResponseEntity<ApiResponse<Object>> doUpdate(
            Long id, Map<String, Object> body) {
        Map<String, Object> payload = new HashMap<>();
        if (body.containsKey("total")) payload.put("total", body.get("total"));
        if (body.containsKey("grade")) payload.put("grade", body.get("grade"));
        if (body.containsKey("gp")) payload.put("gp", body.get("gp"));
        return ApiResponse.ok("Student grade updated",
                lecturerApiClient.put("/api/student-grades/" + id + "/", payload));
    }

    private Map<String, String> lecturerStudentEmails() {
        Map<String, String> map = new HashMap<>();
        try {
            List<JsonNode> profiles = lecturerApiClient.getList("/api/profiles/");
            for (JsonNode profile : profiles) {
                if (!profile.hasNonNull("id") || !profile.hasNonNull("email")) continue;
                String email = profile.get("email").asText().trim();
                if (email.isBlank()) continue;
                map.put(String.valueOf(profile.get("id").asLong()), email);
            }
        } catch (Exception ignored) {
            // Lecturer backend temporarily unavailable; rows keep their original ids.
        }
        return map;
    }

    private Map<String, Long> registrarStudentIdsByEmail() {
        Map<String, Long> map = new HashMap<>();
        studentRepository.findByRole(Role.STUDENT).forEach(student -> {
            if (student.getEmail() != null) {
                map.put(student.getEmail().toLowerCase(), student.getId());
            }
        });
        return map;
    }

    private Map<String, Map<String, Object>> lecturerCourseInfo() {
        Map<String, Map<String, Object>> map = new HashMap<>();
        try {
            List<JsonNode> units = lecturerApiClient.getList("/api/course-units/");
            for (JsonNode unit : units) {
                if (!unit.hasNonNull("id")) continue;
                Map<String, Object> info = new HashMap<>();
                info.put("course_code",
                        unit.hasNonNull("code") ? unit.get("code").asText()
                                : unit.hasNonNull("course_unit_code") ? unit.get("course_unit_code").asText() : "");
                info.put("course_title",
                        unit.hasNonNull("name") ? unit.get("name").asText()
                                : unit.hasNonNull("course_unit_name") ? unit.get("course_unit_name").asText() : "");
                info.put("credits", unit.hasNonNull("credits") ? unit.get("credits").asInt() : 3);
                map.put(String.valueOf(unit.get("id").asLong()), info);
            }
        } catch (Exception ignored) {
            // Course enrichment best-effort only.
        }
        return map;
    }
}