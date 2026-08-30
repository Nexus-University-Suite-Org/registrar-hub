package org.nexus.regbackend.controller;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.ApiResponse;
import org.nexus.regbackend.dto.CourseDto;
import org.nexus.regbackend.dto.CourseUnitDto;
import org.nexus.regbackend.model.Course;
import org.nexus.regbackend.model.CourseUnit;
import org.nexus.regbackend.repository.CourseRepository;
import org.nexus.regbackend.repository.CourseUnitRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CourseController {

    private final CourseRepository courseRepository;
    private final CourseUnitRepository courseUnitRepository;

    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<List<CourseDto>>> listCourses(
            @RequestParam(required = false) String college) {
        List<Course> courses;
        if (college != null && !college.isBlank()) {
            courses = courseRepository.findByCollegeContainingIgnoreCase(college);
        } else {
            courses = courseRepository.findAll();
        }
        List<CourseDto> dtos = courses.stream().map(this::toCourseDto).collect(Collectors.toList());
        return ApiResponse.ok("Courses retrieved", dtos);
    }

    @PostMapping("/courses")
    public ResponseEntity<ApiResponse<CourseDto>> createCourse(@RequestBody CourseDto dto) {
        Course course = Course.builder()
                .code(dto.getCode())
                .name(dto.getName())
                .college(dto.getCollege())
                .department(dto.getDepartment())
                .durationYears(dto.getDuration_years() != null ? dto.getDuration_years() : 4)
                .feeStructure(dto.getFee_structure())
                .build();
        course = courseRepository.save(course);
        return ApiResponse.created("Course created", toCourseDto(course));
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<ApiResponse<CourseDto>> updateCourse(
            @PathVariable Long id, @RequestBody CourseDto dto) {
        Course course = courseRepository.findById(id)
                .orElse(null);
        if (course == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Course not found");
        }
        if (dto.getCode() != null) course.setCode(dto.getCode());
        if (dto.getName() != null) course.setName(dto.getName());
        if (dto.getCollege() != null) course.setCollege(dto.getCollege());
        if (dto.getDepartment() != null) course.setDepartment(dto.getDepartment());
        if (dto.getDuration_years() != null) course.setDurationYears(dto.getDuration_years());
        if (dto.getFee_structure() != null) course.setFeeStructure(dto.getFee_structure());
        course = courseRepository.save(course);
        return ApiResponse.ok("Course updated", toCourseDto(course));
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id) {
        if (!courseRepository.existsById(id)) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Course not found");
        }
        List<CourseUnit> units = courseUnitRepository.findByCourseId(id);
        courseUnitRepository.deleteAll(units);
        courseRepository.deleteById(id);
        return ApiResponse.ok("Course deleted", null);
    }

    @GetMapping("/course-units")
    public ResponseEntity<ApiResponse<List<CourseUnitDto>>> listCourseUnits(
            @RequestParam(required = false) Long courseId) {
        List<CourseUnit> units;
        if (courseId != null) {
            units = courseUnitRepository.findByCourseId(courseId);
        } else {
            units = courseUnitRepository.findAll();
        }

        List<Long> courseIds = units.stream().map(CourseUnit::getCourseId).distinct().collect(Collectors.toList());
        Map<Long, Course> courseMap = courseRepository.findAllById(courseIds).stream()
                .collect(Collectors.toMap(Course::getId, c -> c));

        List<CourseUnitDto> dtos = units.stream().map(u -> {
            Course course = courseMap.get(u.getCourseId());
            return CourseUnitDto.builder()
                    .id(u.getId())
                    .code(u.getCode())
                    .name(u.getName())
                    .course_id(u.getCourseId())
                    .course_name(course != null ? course.getName() : "Unknown")
                    .semester(u.getSemester())
                    .year(u.getYear())
                    .credits(u.getCredits())
                    .created_at(u.getCreatedAt() != null ? u.getCreatedAt().toString() : null)
                    .updated_at(u.getUpdatedAt() != null ? u.getUpdatedAt().toString() : null)
                    .build();
        }).collect(Collectors.toList());

        return ApiResponse.ok("Course units retrieved", dtos);
    }

    @PostMapping("/course-units")
    public ResponseEntity<ApiResponse<CourseUnitDto>> createCourseUnit(@RequestBody CourseUnitDto dto) {
        CourseUnit unit = CourseUnit.builder()
                .code(dto.getCode())
                .name(dto.getName())
                .courseId(dto.getCourse_id())
                .semester(dto.getSemester())
                .year(dto.getYear())
                .credits(dto.getCredits())
                .build();
        unit = courseUnitRepository.save(unit);

        Course course = courseRepository.findById(unit.getCourseId()).orElse(null);
        CourseUnitDto result = CourseUnitDto.builder()
                .id(unit.getId())
                .code(unit.getCode())
                .name(unit.getName())
                .course_id(unit.getCourseId())
                .course_name(course != null ? course.getName() : "Unknown")
                .semester(unit.getSemester())
                .year(unit.getYear())
                .credits(unit.getCredits())
                .created_at(unit.getCreatedAt() != null ? unit.getCreatedAt().toString() : null)
                .updated_at(unit.getUpdatedAt() != null ? unit.getUpdatedAt().toString() : null)
                .build();

        return ApiResponse.created("Course unit created", result);
    }

    @PutMapping("/course-units/{id}")
    public ResponseEntity<ApiResponse<CourseUnitDto>> updateCourseUnit(
            @PathVariable Long id, @RequestBody CourseUnitDto dto) {
        CourseUnit unit = courseUnitRepository.findById(id).orElse(null);
        if (unit == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Course unit not found");
        }
        if (dto.getCode() != null) unit.setCode(dto.getCode());
        if (dto.getName() != null) unit.setName(dto.getName());
        if (dto.getCourse_id() != null) unit.setCourseId(dto.getCourse_id());
        if (dto.getSemester() != null) unit.setSemester(dto.getSemester());
        if (dto.getYear() != null) unit.setYear(dto.getYear());
        if (dto.getCredits() != null) unit.setCredits(dto.getCredits());
        unit = courseUnitRepository.save(unit);

        Course course = courseRepository.findById(unit.getCourseId()).orElse(null);
        CourseUnitDto result = CourseUnitDto.builder()
                .id(unit.getId())
                .code(unit.getCode())
                .name(unit.getName())
                .course_id(unit.getCourseId())
                .course_name(course != null ? course.getName() : "Unknown")
                .semester(unit.getSemester())
                .year(unit.getYear())
                .credits(unit.getCredits())
                .created_at(unit.getCreatedAt() != null ? unit.getCreatedAt().toString() : null)
                .updated_at(unit.getUpdatedAt() != null ? unit.getUpdatedAt().toString() : null)
                .build();

        return ApiResponse.ok("Course unit updated", result);
    }

    @DeleteMapping("/course-units/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCourseUnit(@PathVariable Long id) {
        if (!courseUnitRepository.existsById(id)) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Course unit not found");
        }
        courseUnitRepository.deleteById(id);
        return ApiResponse.ok("Course unit deleted", null);
    }

    private CourseDto toCourseDto(Course c) {
        return CourseDto.builder()
                .id(c.getId())
                .code(c.getCode())
                .name(c.getName())
                .college(c.getCollege())
                .department(c.getDepartment())
                .duration_years(c.getDurationYears())
                .fee_structure(c.getFeeStructure())
                .created_at(c.getCreatedAt() != null ? c.getCreatedAt().toString() : null)
                .updated_at(c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : null)
                .build();
    }
}
