package org.nexus.regbackend.controller;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.ApiResponse;
import org.nexus.regbackend.dto.EmailTemplateDto;
import org.nexus.regbackend.exception.ValidationException;
import org.nexus.regbackend.model.EmailTemplate;
import org.nexus.regbackend.repository.EmailTemplateRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Email template management (Settings → Email Templates).
 */
@RestController
@RequestMapping("/api/email-templates")
@RequiredArgsConstructor
public class EmailTemplateController {

    private final EmailTemplateRepository emailTemplateRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EmailTemplateDto>>> list() {
        List<EmailTemplateDto> dtos = emailTemplateRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ApiResponse.ok("Email templates retrieved", dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmailTemplateDto>> get(@PathVariable Long id) {
        EmailTemplate template = emailTemplateRepository.findById(id)
                .orElseThrow(() -> new ValidationException("Email template not found with id: " + id));
        return ApiResponse.ok("Email template retrieved", toDto(template));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmailTemplateDto>> create(@RequestBody EmailTemplateDto dto) {
        if (dto.getTemplate_key() == null || dto.getTemplate_key().isBlank()
                || dto.getSubject() == null || dto.getSubject().isBlank()
                || dto.getBody() == null || dto.getBody().isBlank()) {
            throw new ValidationException("Template key, subject and body are required.");
        }
        if (emailTemplateRepository.existsByTemplateKey(dto.getTemplate_key())) {
            throw new ValidationException("A template with this key already exists.");
        }
        EmailTemplate template = EmailTemplate.builder()
                .templateKey(dto.getTemplate_key().trim())
                .name(dto.getName() != null ? dto.getName() : dto.getTemplate_key())
                .subject(dto.getSubject())
                .body(dto.getBody())
                .description(dto.getDescription())
                .isActive(dto.getIs_active() != null ? dto.getIs_active() : true)
                .build();
        template = emailTemplateRepository.save(template);
        return ApiResponse.created("Email template created", toDto(template));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmailTemplateDto>> update(
            @PathVariable Long id, @RequestBody EmailTemplateDto dto) {
        EmailTemplate template = emailTemplateRepository.findById(id)
                .orElseThrow(() -> new ValidationException("Email template not found with id: " + id));
        if (dto.getName() != null) template.setName(dto.getName());
        if (dto.getSubject() != null) template.setSubject(dto.getSubject());
        if (dto.getBody() != null) template.setBody(dto.getBody());
        if (dto.getDescription() != null) template.setDescription(dto.getDescription());
        if (dto.getIs_active() != null) template.setActive(dto.getIs_active());
        template = emailTemplateRepository.save(template);
        return ApiResponse.ok("Email template updated", toDto(template));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        if (!emailTemplateRepository.existsById(id)) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Email template not found");
        }
        emailTemplateRepository.deleteById(id);
        return ApiResponse.ok("Email template deleted", null);
    }

    private EmailTemplateDto toDto(EmailTemplate t) {
        return EmailTemplateDto.builder()
                .id(t.getId())
                .template_key(t.getTemplateKey())
                .name(t.getName())
                .subject(t.getSubject())
                .body(t.getBody())
                .description(t.getDescription())
                .is_active(t.isActive())
                .created_at(t.getCreatedAt() != null ? t.getCreatedAt().toString() : null)
                .updated_at(t.getUpdatedAt() != null ? t.getUpdatedAt().toString() : null)
                .build();
    }
}