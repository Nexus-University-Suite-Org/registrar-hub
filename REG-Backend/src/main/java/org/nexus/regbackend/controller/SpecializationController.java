package org.nexus.regbackend.controller;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.ApiResponse;
import org.nexus.regbackend.exception.DuplicateResourceException;
import org.nexus.regbackend.exception.ValidationException;
import org.nexus.regbackend.model.Specialization;
import org.nexus.regbackend.repository.SpecializationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/specializations")
@RequiredArgsConstructor
public class SpecializationController {

    private final SpecializationRepository specializationRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> list(
            @RequestParam(required = false) String department) {
        List<Specialization> specs;
        if (department != null && !department.isBlank()) {
            specs = specializationRepository.findByDepartmentIgnoreCase(department);
        } else {
            specs = specializationRepository.findAllByOrderByNameAsc();
        }
        List<Map<String, Object>> data = specs.stream().map(s -> {
            var map = new java.util.HashMap<String, Object>();
            map.put("id", s.getId());
            map.put("name", s.getName());
            map.put("department", s.getDepartment());
            return (Map<String, Object>) map;
        }).collect(Collectors.toList());
        return ApiResponse.ok("Specializations retrieved", data);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> create(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String department = body.get("department");
        if (name == null || name.isBlank()) {
            throw new ValidationException("Specialization name is required");
        }
        if (specializationRepository.existsByNameIgnoreCase(name.trim())) {
            throw new DuplicateResourceException("Specialization already exists");
        }
        Specialization spec = Specialization.builder()
                .name(name.trim())
                .department(department != null ? department.trim() : null)
                .build();
        spec = specializationRepository.save(spec);
        var map = new java.util.HashMap<String, Object>();
        map.put("id", spec.getId());
        map.put("name", spec.getName());
        map.put("department", spec.getDepartment());
        return ApiResponse.created("Specialization created", map);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> delete(@PathVariable Long id) {
        specializationRepository.deleteById(id);
        return ApiResponse.ok("Specialization deleted", Map.of("deleted", true));
    }
}
