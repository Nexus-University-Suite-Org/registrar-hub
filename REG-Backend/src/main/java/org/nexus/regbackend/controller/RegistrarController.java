package org.nexus.regbackend.controller;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.ApiResponse;
import org.nexus.regbackend.dto.RegistrarProfileDto;
import org.nexus.regbackend.exception.ValidationException;
import org.nexus.regbackend.model.Registrar;
import org.nexus.regbackend.repository.RegistrarRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Registrar self-profile endpoints used by the Settings → Profile section.
 */
@RestController
@RequestMapping("/api/registrars")
@RequiredArgsConstructor
public class RegistrarController {

    private final RegistrarRepository registrarRepository;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RegistrarProfileDto>> get(@PathVariable Long id) {
        Registrar registrar = registrarRepository.findById(id)
                .orElseThrow(() -> new ValidationException("Registrar not found with id: " + id));
        return ApiResponse.ok("Registrar profile retrieved", toDto(registrar));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RegistrarProfileDto>> update(
            @PathVariable Long id, @RequestBody RegistrarProfileDto dto) {
        Registrar registrar = registrarRepository.findById(id)
                .orElseThrow(() -> new ValidationException("Registrar not found with id: " + id));
        if (dto.getFirst_name() != null) registrar.setFirstName(dto.getFirst_name());
        if (dto.getLast_name() != null) registrar.setLastName(dto.getLast_name());
        if (dto.getEmployee_id() != null) registrar.setStaffId(dto.getEmployee_id());
        if (dto.getDepartment() != null) registrar.setDepartment(dto.getDepartment());
        if (dto.getCollege() != null) registrar.setInstitution(dto.getCollege());
        if (dto.getPhone_number() != null) registrar.setPhoneNumber(dto.getPhone_number());
        registrar = registrarRepository.save(registrar);
        return ApiResponse.ok("Registrar profile updated", toDto(registrar));
    }

    private RegistrarProfileDto toDto(Registrar registrar) {
        return RegistrarProfileDto.builder()
                .id(registrar.getId())
                .first_name(registrar.getFirstName())
                .last_name(registrar.getLastName())
                .email(registrar.getEmail())
                .username(registrar.getUsername())
                .employee_id(registrar.getStaffId())
                .department(registrar.getDepartment())
                .college(registrar.getInstitution())
                .phone_number(registrar.getPhoneNumber())
                .role(registrar.getRole().name())
                .build();
    }
}