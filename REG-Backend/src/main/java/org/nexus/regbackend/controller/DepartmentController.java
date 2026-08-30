package org.nexus.regbackend.controller;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.ApiResponse;
import org.nexus.regbackend.exception.DuplicateResourceException;
import org.nexus.regbackend.model.Department;
import org.nexus.regbackend.repository.DepartmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> list(
            @RequestParam(required = false) String faculty) {
        List<Department> depts;
        if (faculty != null && !faculty.isBlank()) {
            depts = departmentRepository.findAll().stream()
                    .filter(d -> faculty.equalsIgnoreCase(d.getFaculty()))
                    .collect(Collectors.toList());
        } else {
            depts = departmentRepository.findAllByOrderByFacultyAscNameAsc();
        }
        List<Map<String, Object>> data = depts.stream().map(d -> {
            var map = new java.util.HashMap<String, Object>();
            map.put("id", d.getId());
            map.put("name", d.getName());
            map.put("faculty", d.getFaculty());
            return (Map<String, Object>) map;
        }).collect(Collectors.toList());
        return ApiResponse.ok("Departments retrieved", data);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String faculty = body.get("faculty");
        if (name == null || name.isBlank()) {
            throw new org.nexus.regbackend.exception.ValidationException("Department name is required");
        }
        if (departmentRepository.existsByNameIgnoreCase(name.trim())) {
            throw new DuplicateResourceException("Department already exists");
        }
        Department dept = Department.builder()
                .name(name.trim())
                .faculty(faculty != null ? faculty.trim() : null)
                .build();
        dept = departmentRepository.save(dept);
        var map = new java.util.HashMap<String, Object>();
        map.put("id", dept.getId());
        map.put("name", dept.getName());
        map.put("faculty", dept.getFaculty());
        return ApiResponse.created("Department created", map);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> delete(@PathVariable Long id) {
        departmentRepository.deleteById(id);
        return ApiResponse.ok("Department deleted", Map.of("deleted", true));
    }
}
