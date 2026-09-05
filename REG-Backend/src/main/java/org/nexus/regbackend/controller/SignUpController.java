package org.nexus.regbackend.controller;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.ApiResponse;
import org.nexus.regbackend.dto.SignUpDto;
import org.nexus.regbackend.model.SignUp;
import org.nexus.regbackend.repository.SignUpRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sign-ups")
@RequiredArgsConstructor
public class SignUpController {

    private final SignUpRepository signUpRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SignUpDto>>> list(
            @RequestParam(name = "lecturer_id", required = false) Long lecturerId) {
        List<SignUp> signUps;
        if (lecturerId != null) {
            signUps = signUpRepository.findByLecturerId(lecturerId);
        } else {
            signUps = signUpRepository.findAll();
        }
        List<SignUpDto> dtos = signUps.stream().map(this::toDto).collect(Collectors.toList());
        return ApiResponse.ok("Sign-ups retrieved", dtos);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SignUpDto>> create(@RequestBody SignUpDto dto) {
        SignUp signUp = SignUp.builder()
                .lecturerId(dto.getLecturer_id())
                .lecturerName(dto.getLecturer_name())
                .lecturerEmail(dto.getLecturer_email())
                .courseUnitId(dto.getCourse_unit_id())
                .courseUnitCode(dto.getCourse_unit_code())
                .courseUnitName(dto.getCourse_unit_name())
                .courseId(dto.getCourse_id())
                .assignedBy(dto.getAssigned_by())
                .status(dto.getStatus() != null ? dto.getStatus() : "active")
                .build();
        signUp = signUpRepository.save(signUp);
        return ApiResponse.created("Sign-up created", toDto(signUp));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> delete(@PathVariable Long id) {
        signUpRepository.deleteById(id);
        return ApiResponse.ok("Sign-up deleted", Map.of("deleted", true));
    }

    private SignUpDto toDto(SignUp s) {
        return SignUpDto.builder()
                .id(s.getId())
                .lecturer_id(s.getLecturerId())
                .lecturer_name(s.getLecturerName())
                .lecturer_email(s.getLecturerEmail())
                .course_unit_id(s.getCourseUnitId())
                .course_unit_code(s.getCourseUnitCode())
                .course_unit_name(s.getCourseUnitName())
                .course_id(s.getCourseId())
                .assigned_by(s.getAssignedBy())
                .assigned_at(s.getAssignedAt() != null ? s.getAssignedAt().toString() : null)
                .status(s.getStatus())
                .build();
    }
}
