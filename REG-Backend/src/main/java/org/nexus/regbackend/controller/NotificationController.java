package org.nexus.regbackend.controller;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.ApiResponse;
import org.nexus.regbackend.dto.NotificationPreferenceDto;
import org.nexus.regbackend.model.NotificationPreference;
import org.nexus.regbackend.model.Registrar;
import org.nexus.regbackend.repository.NotificationPreferenceRepository;
import org.nexus.regbackend.util.CurrentUser;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Notification preferences for the currently authenticated registrar
 * (Settings → Notifications).
 */
@RestController
@RequestMapping("/api/notifications/preferences")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationPreferenceRepository preferenceRepository;
    private final CurrentUser                    currentUser;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationPreferenceDto>>> getPreferences() {
        Registrar registrar = currentUser.registrar();
        List<NotificationPreferenceDto> dtos = preferenceRepository.findByRegistrarId(registrar.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ApiResponse.ok("Notification preferences retrieved", dtos);
    }

    @PutMapping
    public ResponseEntity<ApiResponse<List<NotificationPreferenceDto>>> updatePreferences(
            @RequestBody List<NotificationPreferenceDto> preferences) {
        Registrar registrar = currentUser.registrar();
        List<NotificationPreferenceDto> saved = new ArrayList<>();
        for (NotificationPreferenceDto dto : preferences) {
            NotificationPreference pref = preferenceRepository
                    .findByRegistrarIdAndCategory(registrar.getId(), dto.getCategory())
                    .orElseGet(() -> NotificationPreference.builder()
                            .registrar(registrar)
                            .category(dto.getCategory())
                            .build());
            if (dto.getEmail_enabled() != null) pref.setEmailEnabled(dto.getEmail_enabled());
            if (dto.getIn_app_enabled() != null) pref.setInAppEnabled(dto.getIn_app_enabled());
            saved.add(toDto(preferenceRepository.save(pref)));
        }
        return ApiResponse.ok("Notification preferences updated", saved);
    }

    private NotificationPreferenceDto toDto(NotificationPreference p) {
        return NotificationPreferenceDto.builder()
                .category(p.getCategory())
                .email_enabled(p.getEmailEnabled())
                .in_app_enabled(p.getInAppEnabled())
                .updated_at(p.getUpdatedAt() != null ? p.getUpdatedAt().toString() : null)
                .build();
    }
}