package org.nexus.regbackend.mapper;

import org.nexus.regbackend.dto.RegistrarResponse;
import org.nexus.regbackend.model.Registrar;
import org.springframework.stereotype.Component;

/**
 * Maps {@link Registrar} entities to DTOs.
 * Centralises all field-level mapping in one place (SRP).
 */
@Component
public class RegistrarMapper {

    /**
     * Maps a {@link Registrar} to a full {@link RegistrarResponse}.
     * Never exposes the password hash or other sensitive fields.
     */
    public RegistrarResponse toResponse(Registrar registrar) {
        return RegistrarResponse.builder()
                .id(registrar.getId())
                .firstName(registrar.getFirstName())
                .lastName(registrar.getLastName())
                .email(registrar.getEmail())
                .username(registrar.getUsername())
                .staffId(registrar.getStaffId())
                .institution(registrar.getInstitution())
                .department(registrar.getDepartment())
                .phoneNumber(registrar.getPhoneNumber())
                .dateOfBirth(registrar.getDateOfBirth())
                .role(registrar.getRole().name())
                .emailVerified(registrar.isEmailVerified())
                .createdAt(registrar.getCreatedAt())
                .updatedAt(registrar.getUpdatedAt())
                .build();
    }
}
