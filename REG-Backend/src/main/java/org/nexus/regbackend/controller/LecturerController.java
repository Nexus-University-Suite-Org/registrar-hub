package org.nexus.regbackend.controller;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.ApiResponse;
import org.nexus.regbackend.dto.LecturerDto;
import org.nexus.regbackend.service.LecturerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class LecturerController {

    private final LecturerService lecturerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LecturerDto>>> list(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search) {
        if (role == null || role.isBlank()) {
            return ApiResponse.ok("All profiles", List.of());
        }
        if ("lecturer".equalsIgnoreCase(role)) {
            List<LecturerDto> lecturers = lecturerService.listAll(search);
            return ApiResponse.ok("Lecturers retrieved", lecturers);
        }
        return ApiResponse.ok("Profiles retrieved", List.of());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LecturerDto>> getById(@PathVariable Long id) {
        LecturerDto lecturer = lecturerService.getById(id);
        return ApiResponse.ok("Lecturer retrieved", lecturer);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LecturerDto>> create(@RequestBody LecturerDto dto) {
        LecturerDto created = lecturerService.create(dto);
        return ApiResponse.created("Lecturer created successfully", created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LecturerDto>> update(
            @PathVariable Long id,
            @RequestBody LecturerDto dto) {
        LecturerDto updated = lecturerService.update(id, dto);
        return ApiResponse.ok("Lecturer updated successfully", updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> delete(@PathVariable Long id) {
        lecturerService.delete(id);
        return ApiResponse.ok("Lecturer deleted successfully", Map.of("deleted", true));
    }
}
