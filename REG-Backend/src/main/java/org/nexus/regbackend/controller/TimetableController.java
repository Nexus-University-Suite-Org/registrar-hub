package org.nexus.regbackend.controller;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.ApiResponse;
import org.nexus.regbackend.dto.TimetableEntryDto;
import org.nexus.regbackend.model.TimetableEntry;
import org.nexus.regbackend.repository.TimetableEntryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/timetable")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableEntryRepository repository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TimetableEntryDto>>> list(
            @RequestParam(required = false) String program,
            @RequestParam(required = false) String program_code,
            @RequestParam(required = false) String academic_year,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) Integer year_of_study) {

        List<TimetableEntry> entries;

        if (program != null && !program.isBlank()) {
            if (academic_year != null && !academic_year.isBlank() && semester != null && year_of_study != null) {
                entries = repository.findByProgramIgnoreCaseAndAcademicYearAndSemesterAndYearOfStudyOrderByDayOfWeekAscStartTimeAsc(
                        program, academic_year, semester, year_of_study);
            } else {
                entries = repository.findByProgramIgnoreCaseOrderByDayOfWeekAscStartTimeAsc(program);
            }
        } else if (program_code != null && !program_code.isBlank()) {
            entries = repository.findByProgramCodeIgnoreCaseOrderByDayOfWeekAscStartTimeAsc(program_code);
        } else {
            entries = repository.findAllByOrderByDayOfWeekAscStartTimeAsc();
        }

        List<TimetableEntryDto> dtos = entries.stream().map(this::toDto).collect(Collectors.toList());
        return ApiResponse.ok("Timetable entries retrieved", dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TimetableEntryDto>> getById(@PathVariable Long id) {
        TimetableEntry entry = repository.findById(id).orElse(null);
        if (entry == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Timetable entry not found");
        }
        return ApiResponse.ok("Timetable entry retrieved", toDto(entry));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TimetableEntryDto>> create(@RequestBody TimetableEntryDto dto) {
        TimetableEntry entry = TimetableEntry.builder()
                .program(trim(dto.getProgram()))
                .programCode(trim(dto.getProgram_code()))
                .academicYear(trim(dto.getAcademic_year()))
                .semester(dto.getSemester())
                .yearOfStudy(dto.getYear_of_study())
                .dayOfWeek(trim(dto.getDay_of_week()))
                .startTime(trim(dto.getStart_time()))
                .endTime(trim(dto.getEnd_time()))
                .room(trim(dto.getRoom()))
                .sessionType(trim(dto.getSession_type()))
                .isOnline(dto.getIs_online() != null ? dto.getIs_online() : false)
                .lecturerName(trim(dto.getLecturer_name()))
                .courseUnitId(dto.getCourse_unit_id())
                .courseUnitCode(trim(dto.getCourse_unit_code()))
                .courseUnitName(trim(dto.getCourse_unit_name()))
                .build();
        entry = repository.save(entry);
        return ApiResponse.created("Timetable entry created", toDto(entry));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TimetableEntryDto>> update(
            @PathVariable Long id, @RequestBody TimetableEntryDto dto) {
        TimetableEntry entry = repository.findById(id).orElse(null);
        if (entry == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Timetable entry not found");
        }
        if (dto.getProgram() != null) entry.setProgram(dto.getProgram().trim());
        if (dto.getProgram_code() != null) entry.setProgramCode(dto.getProgram_code().trim());
        if (dto.getAcademic_year() != null) entry.setAcademicYear(dto.getAcademic_year().trim());
        if (dto.getSemester() != null) entry.setSemester(dto.getSemester());
        if (dto.getYear_of_study() != null) entry.setYearOfStudy(dto.getYear_of_study());
        if (dto.getDay_of_week() != null) entry.setDayOfWeek(dto.getDay_of_week().trim());
        if (dto.getStart_time() != null) entry.setStartTime(dto.getStart_time().trim());
        if (dto.getEnd_time() != null) entry.setEndTime(dto.getEnd_time().trim());
        if (dto.getRoom() != null) entry.setRoom(dto.getRoom().trim());
        if (dto.getSession_type() != null) entry.setSessionType(dto.getSession_type().trim());
        if (dto.getIs_online() != null) entry.setOnline(dto.getIs_online());
        if (dto.getLecturer_name() != null) entry.setLecturerName(dto.getLecturer_name().trim());
        if (dto.getCourse_unit_id() != null) entry.setCourseUnitId(dto.getCourse_unit_id());
        if (dto.getCourse_unit_code() != null) entry.setCourseUnitCode(dto.getCourse_unit_code().trim());
        if (dto.getCourse_unit_name() != null) entry.setCourseUnitName(dto.getCourse_unit_name().trim());
        entry = repository.save(entry);
        return ApiResponse.ok("Timetable entry updated", toDto(entry));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Timetable entry not found");
        }
        repository.deleteById(id);
        return ApiResponse.ok("Timetable entry deleted", null);
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }

    private TimetableEntryDto toDto(TimetableEntry e) {
        return TimetableEntryDto.builder()
                .id(e.getId())
                .program(e.getProgram())
                .program_code(e.getProgramCode())
                .academic_year(e.getAcademicYear())
                .semester(e.getSemester())
                .year_of_study(e.getYearOfStudy())
                .day_of_week(e.getDayOfWeek())
                .start_time(e.getStartTime())
                .end_time(e.getEndTime())
                .room(e.getRoom())
                .session_type(e.getSessionType())
                .is_online(e.isOnline())
                .lecturer_name(e.getLecturerName())
                .course_unit_id(e.getCourseUnitId())
                .course_unit_code(e.getCourseUnitCode())
                .course_unit_name(e.getCourseUnitName())
                .created_at(e.getCreatedAt() != null ? e.getCreatedAt().toString() : null)
                .updated_at(e.getUpdatedAt() != null ? e.getUpdatedAt().toString() : null)
                .build();
    }
}