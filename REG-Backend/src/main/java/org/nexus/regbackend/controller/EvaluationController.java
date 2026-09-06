package org.nexus.regbackend.controller;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.ApiResponse;
import org.nexus.regbackend.dto.SurveyDto;
import org.nexus.regbackend.dto.SurveyQuestionDto;
import org.nexus.regbackend.exception.ValidationException;
import org.nexus.regbackend.model.EvaluationSurvey;
import org.nexus.regbackend.model.SurveyQuestion;
import org.nexus.regbackend.repository.EvaluationSurveyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Evaluation survey management (Settings → Evaluations).
 */
@RestController
@RequestMapping("/api/evaluations/surveys")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationSurveyRepository surveyRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SurveyDto>>> list() {
        List<SurveyDto> dtos = surveyRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ApiResponse.ok("Surveys retrieved", dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SurveyDto>> get(@PathVariable Long id) {
        EvaluationSurvey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new ValidationException("Survey not found with id: " + id));
        return ApiResponse.ok("Survey retrieved", toDto(survey));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SurveyDto>> create(@RequestBody SurveyDto dto) {
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new ValidationException("Survey title is required.");
        }
        if (dto.getQuestions() == null || dto.getQuestions().isEmpty()) {
            throw new ValidationException("A survey must have at least one question.");
        }
        EvaluationSurvey survey = applyFields(new EvaluationSurvey(), dto);
        survey = surveyRepository.save(survey);
        return ApiResponse.created("Survey created", toDto(survey));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SurveyDto>> update(
            @PathVariable Long id, @RequestBody SurveyDto dto) {
        EvaluationSurvey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new ValidationException("Survey not found with id: " + id));
        if (survey.getStatus() == EvaluationSurvey.Status.CLOSED) {
            throw new ValidationException("Closed surveys cannot be edited.");
        }
        applyFields(survey, dto);
        survey = surveyRepository.save(survey);
        return ApiResponse.ok("Survey updated", toDto(survey));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        if (!surveyRepository.existsById(id)) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Survey not found");
        }
        surveyRepository.deleteById(id);
        return ApiResponse.ok("Survey deleted", null);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<SurveyDto>> updateStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        EvaluationSurvey survey = surveyRepository.findById(id)
                .orElseThrow(() -> new ValidationException("Survey not found with id: " + id));
        String raw = body.getOrDefault("status", "");
        EvaluationSurvey.Status status;
        try {
            status = EvaluationSurvey.Status.valueOf(raw.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid status. Use DRAFT, PUBLISHED or CLOSED.");
        }
        survey.setStatus(status);
        survey = surveyRepository.save(survey);
        return ApiResponse.ok("Survey status updated", toDto(survey));
    }

    private EvaluationSurvey applyFields(EvaluationSurvey survey, SurveyDto dto) {
        if (dto.getTitle() != null) survey.setTitle(dto.getTitle());
        if (dto.getDescription() != null) survey.setDescription(dto.getDescription());
        if (dto.getYear() != null) survey.setYear(dto.getYear());
        if (dto.getSemester() != null) survey.setSemester(dto.getSemester());
        if (dto.getCourse_unit_id() != null) survey.setCourseUnitId(dto.getCourse_unit_id());
        if (dto.getCourse_unit_code() != null) survey.setCourseUnitCode(dto.getCourse_unit_code());
        if (dto.getCourse_unit_name() != null) survey.setCourseUnitName(dto.getCourse_unit_name());
        if (dto.getDeadline() != null && !dto.getDeadline().isBlank()) {
            survey.setDeadline(LocalDate.parse(dto.getDeadline()));
        } else {
            survey.setDeadline(null);
        }
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            survey.setStatus(EvaluationSurvey.Status.valueOf(dto.getStatus().toUpperCase()));
        }
        if (dto.getQuestions() != null) {
            survey.getQuestions().clear();
            int order = 0;
            for (SurveyQuestionDto q : dto.getQuestions()) {
                SurveyQuestion question = SurveyQuestion.builder()
                        .survey(survey)
                        .text(q.getText())
                        .type(SurveyQuestion.Type.valueOf(q.getType() != null ? q.getType().toUpperCase() : "RATING"))
                        .required(q.getRequired() != null ? q.getRequired() : true)
                        .sortOrder(order++)
                        .options(q.getOptions())
                        .build();
                survey.getQuestions().add(question);
            }
        }
        return survey;
    }

    private SurveyDto toDto(EvaluationSurvey survey) {
        List<SurveyQuestionDto> questionDtos = survey.getQuestions().stream()
                .map(q -> SurveyQuestionDto.builder()
                        .id(q.getId())
                        .text(q.getText())
                        .type(q.getType().name())
                        .required(q.isRequired())
                        .sort_order(q.getSortOrder())
                        .options(q.getOptions())
                        .build())
                .collect(Collectors.toList());
        return SurveyDto.builder()
                .id(survey.getId())
                .title(survey.getTitle())
                .description(survey.getDescription())
                .year(survey.getYear())
                .semester(survey.getSemester())
                .course_unit_id(survey.getCourseUnitId())
                .course_unit_code(survey.getCourseUnitCode())
                .course_unit_name(survey.getCourseUnitName())
                .status(survey.getStatus().name())
                .deadline(survey.getDeadline() != null ? survey.getDeadline().toString() : null)
                .questions(questionDtos)
                .created_at(survey.getCreatedAt() != null ? survey.getCreatedAt().toString() : null)
                .updated_at(survey.getUpdatedAt() != null ? survey.getUpdatedAt().toString() : null)
                .build();
    }
}