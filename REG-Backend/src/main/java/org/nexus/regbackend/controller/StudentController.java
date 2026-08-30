package org.nexus.regbackend.controller;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.ApiResponse;
import org.nexus.regbackend.dto.StudentDto;
import org.nexus.regbackend.exception.DuplicateResourceException;
import org.nexus.regbackend.exception.ValidationException;
import org.nexus.regbackend.model.Role;
import org.nexus.regbackend.model.Student;
import org.nexus.regbackend.repository.StudentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentRepository studentRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StudentDto>>> list(
            @RequestParam(required = false) String search) {
        List<Student> students;
        if (search != null && !search.isBlank()) {
            students = studentRepository.search(search);
        } else {
            students = studentRepository.findByRole(Role.STUDENT);
        }
        List<StudentDto> dtos = students.stream().map(this::toDto).collect(Collectors.toList());
        return ApiResponse.ok("Students retrieved", dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentDto>> getById(@PathVariable Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ValidationException("Student not found with id: " + id));
        return ApiResponse.ok("Student retrieved", toDto(student));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StudentDto>> create(@RequestBody StudentDto dto) {
        if (dto.getEmail() != null && studentRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("A student with this email already exists");
        }

        Student student = Student.builder()
                .studentNumber(dto.getStudent_number())
                .registrationNumber(dto.getRegistration_number())
                .fullName(dto.getFull_name())
                .email(dto.getEmail())
                .department(dto.getDepartment())
                .program(dto.getProgram())
                .yearOfStudy(dto.getYear_of_study() != null ? dto.getYear_of_study() : 1)
                .status(dto.getStatus() != null ? dto.getStatus() : "Active")
                .admissionDate(dto.getAdmission_date() != null ? LocalDate.parse(dto.getAdmission_date()) : LocalDate.now())
                .avatarUrl(dto.getAvatar_url())
                .isRegistered(dto.getIs_registered() != null ? dto.getIs_registered() : true)
                .build();

        student = studentRepository.save(student);
        return ApiResponse.created("Student created successfully", toDto(student));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentDto>> update(
            @PathVariable Long id,
            @RequestBody StudentDto dto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ValidationException("Student not found with id: " + id));

        if (dto.getFull_name() != null) student.setFullName(dto.getFull_name());
        if (dto.getEmail() != null) student.setEmail(dto.getEmail());
        if (dto.getStudent_number() != null) student.setStudentNumber(dto.getStudent_number());
        if (dto.getRegistration_number() != null) student.setRegistrationNumber(dto.getRegistration_number());
        if (dto.getDepartment() != null) student.setDepartment(dto.getDepartment());
        if (dto.getProgram() != null) student.setProgram(dto.getProgram());
        if (dto.getYear_of_study() != null) student.setYearOfStudy(dto.getYear_of_study());
        if (dto.getStatus() != null) student.setStatus(dto.getStatus());
        if (dto.getAvatar_url() != null) student.setAvatarUrl(dto.getAvatar_url());
        if (dto.getAdmission_date() != null) student.setAdmissionDate(LocalDate.parse(dto.getAdmission_date()));

        student = studentRepository.save(student);
        return ApiResponse.ok("Student updated successfully", toDto(student));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> delete(@PathVariable Long id) {
        if (!studentRepository.existsById(id)) {
            throw new ValidationException("Student not found with id: " + id);
        }
        studentRepository.deleteById(id);
        return ApiResponse.ok("Student deleted successfully", Map.of("deleted", true));
    }

    private StudentDto toDto(Student s) {
        return StudentDto.builder()
                .id(s.getId())
                .student_number(s.getStudentNumber())
                .registration_number(s.getRegistrationNumber())
                .full_name(s.getFullName())
                .email(s.getEmail())
                .department(s.getDepartment())
                .program(s.getProgram())
                .year_of_study(s.getYearOfStudy())
                .status(s.getStatus())
                .admission_date(s.getAdmissionDate() != null ? s.getAdmissionDate().toString() : null)
                .avatar_url(s.getAvatarUrl())
                .role("student")
                .is_registered(s.isRegistered())
                .created_at(s.getCreatedAt() != null ? s.getCreatedAt().toString() : null)
                .updated_at(s.getUpdatedAt() != null ? s.getUpdatedAt().toString() : null)
                .build();
    }
}
