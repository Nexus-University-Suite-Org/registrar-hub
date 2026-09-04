package org.nexus.regbackend.controller;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.AcademicCalendarEventDto;
import org.nexus.regbackend.dto.ApiResponse;
import org.nexus.regbackend.model.AcademicCalendarEvent;
import org.nexus.regbackend.repository.AcademicCalendarEventRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/academic-calendar")
@RequiredArgsConstructor
public class AcademicCalendarController {

    private final AcademicCalendarEventRepository repository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AcademicCalendarEventDto>>> list() {
        List<AcademicCalendarEventDto> dtos = repository.findAllByOrderByDateAscIdAsc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ApiResponse.ok("Academic calendar events retrieved", dtos);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AcademicCalendarEventDto>> create(
            @RequestBody AcademicCalendarEventDto dto) {
        AcademicCalendarEvent event = AcademicCalendarEvent.builder()
                .title(dto.getTitle())
                .date(parseDate(dto.getDate()))
                .dueDate(parseDateOrNull(dto.getDue_date()))
                .type(dto.getType())
                .description(dto.getDescription())
                .isActive(dto.getIs_active() != null ? dto.getIs_active() : true)
                .build();
        event = repository.save(event);
        return ApiResponse.created("Academic calendar event created", toDto(event));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AcademicCalendarEventDto>> update(
            @PathVariable Long id, @RequestBody AcademicCalendarEventDto dto) {
        AcademicCalendarEvent event = repository.findById(id).orElse(null);
        if (event == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Event not found");
        }
        if (dto.getTitle() != null) event.setTitle(dto.getTitle());
        if (dto.getDate() != null) event.setDate(parseDate(dto.getDate()));
        if (dto.getDue_date() != null) event.setDueDate(parseDateOrNull(dto.getDue_date()));
        if (dto.getType() != null) event.setType(dto.getType());
        if (dto.getDescription() != null) event.setDescription(dto.getDescription());
        if (dto.getIs_active() != null) event.setActive(dto.getIs_active());
        event = repository.save(event);
        return ApiResponse.ok("Academic calendar event updated", toDto(event));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Event not found");
        }
        repository.deleteById(id);
        return ApiResponse.ok("Academic calendar event deleted", null);
    }

    private AcademicCalendarEventDto toDto(AcademicCalendarEvent e) {
        return AcademicCalendarEventDto.builder()
                .id(e.getId())
                .title(e.getTitle())
                .date(e.getDate() != null ? e.getDate().toString() : null)
                .due_date(e.getDueDate() != null ? e.getDueDate().toString() : null)
                .type(e.getType())
                .description(e.getDescription())
                .is_active(e.isActive())
                .created_at(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null)
                .updated_at(e.getUpdatedAt() != null ? e.getUpdatedAt().toString() : null)
                .build();
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDate.parse(value);
        } catch (Exception ex) {
            try {
                return LocalDateTime.parse(value).toLocalDate();
            } catch (Exception ex2) {
                return LocalDate.parse(value.substring(0, 10));
            }
        }
    }

    private LocalDate parseDateOrNull(String value) {
        if (value == null || value.isBlank()) return null;
        return parseDate(value);
    }
}
