package org.nexus.regbackend.service.impl;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.LecturerDto;
import org.nexus.regbackend.exception.DuplicateResourceException;
import org.nexus.regbackend.exception.ValidationException;
import org.nexus.regbackend.model.Lecturer;
import org.nexus.regbackend.model.Role;
import org.nexus.regbackend.repository.LecturerRepository;
import org.nexus.regbackend.service.EmailService;
import org.nexus.regbackend.service.JwtService;
import org.nexus.regbackend.service.LecturerService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LecturerServiceImpl implements LecturerService {

    private final LecturerRepository lecturerRepository;
    private final EmailService emailService;
    private final JwtService jwtService;

    @Value("${set-password.url:http://localhost:5176/set-password}")
    private String setPasswordBaseUrl;

    @Override
    @Transactional(readOnly = true)
    public List<LecturerDto> listAll(String search) {
        List<Lecturer> lecturers;
        if (search != null && !search.isBlank()) {
            lecturers = lecturerRepository.search(search);
        } else {
            lecturers = lecturerRepository.findByRole(Role.LECTURER);
        }
        return lecturers.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public LecturerDto getById(Long id) {
        Lecturer lecturer = lecturerRepository.findById(id)
                .orElseThrow(() -> new ValidationException("Lecturer not found with id: " + id));
        return toDto(lecturer);
    }

    @Override
    @Transactional
    public LecturerDto create(LecturerDto dto) {
        if (dto.getEmail() != null && lecturerRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("A lecturer with this email already exists");
        }
        if (dto.getLecturer_number() != null && lecturerRepository.existsByLecturerNumber(dto.getLecturer_number())) {
            throw new DuplicateResourceException("A lecturer with this number already exists");
        }

        Lecturer lecturer = Lecturer.builder()
                .lecturerNumber(dto.getLecturer_number())
                .firstName(dto.getFirst_name())
                .lastName(dto.getLast_name())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .bio(dto.getBio())
                .department(dto.getDepartment())
                .specialization(dto.getSpecialization())
                .employmentDate(LocalDate.parse(dto.getEmployment_date()))
                .status(dto.getStatus() != null ? dto.getStatus() : "Active")
                .avatarUrl(dto.getAvatar_url())
                .build();

        lecturer = lecturerRepository.save(lecturer);

        // Send welcome email with set-password link
        try {
            String token = jwtService.generateSetPasswordToken(dto.getEmail());
            String setPasswordUrl = setPasswordBaseUrl
                    + "?token=" + token
                    + "&email=" + java.net.URLEncoder.encode(dto.getEmail(), java.nio.charset.StandardCharsets.UTF_8)
                    + "&firstName=" + java.net.URLEncoder.encode(dto.getFirst_name() != null ? dto.getFirst_name() : "", java.nio.charset.StandardCharsets.UTF_8)
                    + "&lastName=" + java.net.URLEncoder.encode(dto.getLast_name() != null ? dto.getLast_name() : "", java.nio.charset.StandardCharsets.UTF_8)
                    + "&department=" + java.net.URLEncoder.encode(dto.getDepartment() != null ? dto.getDepartment() : "", java.nio.charset.StandardCharsets.UTF_8)
                    + "&specialization=" + java.net.URLEncoder.encode(dto.getSpecialization() != null ? dto.getSpecialization() : "", java.nio.charset.StandardCharsets.UTF_8);
            emailService.sendLecturerWelcomeEmail(dto.getEmail(), dto.getFirst_name(), setPasswordUrl);
        } catch (Exception e) {
            // Email failure should not block lecturer creation
        }

        return toDto(lecturer);
    }

    @Override
    @Transactional
    public LecturerDto update(Long id, LecturerDto dto) {
        Lecturer lecturer = lecturerRepository.findById(id)
                .orElseThrow(() -> new ValidationException("Lecturer not found with id: " + id));

        if (dto.getFirst_name() != null) lecturer.setFirstName(dto.getFirst_name());
        if (dto.getLast_name() != null) lecturer.setLastName(dto.getLast_name());
        if (dto.getEmail() != null) lecturer.setEmail(dto.getEmail());
        if (dto.getPhone() != null) lecturer.setPhone(dto.getPhone());
        if (dto.getAddress() != null) lecturer.setAddress(dto.getAddress());
        if (dto.getBio() != null) lecturer.setBio(dto.getBio());
        if (dto.getDepartment() != null) lecturer.setDepartment(dto.getDepartment());
        if (dto.getSpecialization() != null) lecturer.setSpecialization(dto.getSpecialization());
        if (dto.getStatus() != null) lecturer.setStatus(dto.getStatus());
        if (dto.getAvatar_url() != null) lecturer.setAvatarUrl(dto.getAvatar_url());
        if (dto.getLecturer_number() != null) lecturer.setLecturerNumber(dto.getLecturer_number());
        if (dto.getEmployment_date() != null) lecturer.setEmploymentDate(LocalDate.parse(dto.getEmployment_date()));
        if (dto.getAssigned_course_units() != null) lecturer.setAssignedCourseUnits(dto.getAssigned_course_units());

        lecturer = lecturerRepository.save(lecturer);
        return toDto(lecturer);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!lecturerRepository.existsById(id)) {
            throw new ValidationException("Lecturer not found with id: " + id);
        }
        lecturerRepository.deleteById(id);
    }

    private LecturerDto toDto(Lecturer l) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        return LecturerDto.builder()
                .id(l.getId())
                .lecturer_number(l.getLecturerNumber())
                .first_name(l.getFirstName())
                .last_name(l.getLastName())
                .email(l.getEmail())
                .phone(l.getPhone())
                .address(l.getAddress())
                .bio(l.getBio())
                .department(l.getDepartment())
                .specialization(l.getSpecialization())
                .employment_date(l.getEmploymentDate() != null ? l.getEmploymentDate().format(fmt) : null)
                .status(l.getStatus())
                .avatar_url(l.getAvatarUrl())
                .assigned_course_units(l.getAssignedCourseUnits() != null
                        ? new ArrayList<>(l.getAssignedCourseUnits())
                        : null)
                .role("lecturer")
                .created_at(l.getCreatedAt() != null ? l.getCreatedAt().toString() : null)
                .updated_at(l.getUpdatedAt() != null ? l.getUpdatedAt().toString() : null)
                .build();
    }
}
