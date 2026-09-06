package org.nexus.regbackend.service.impl;

import org.nexus.regbackend.dto.NapProgramDto;
import org.nexus.regbackend.model.Course;
import org.nexus.regbackend.model.CourseUnit;
import org.nexus.regbackend.repository.CourseRepository;
import org.nexus.regbackend.repository.CourseUnitRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NapProgramSyncService {

    private static final Logger log = LoggerFactory.getLogger(NapProgramSyncService.class);

    private final String baseUrl;
    private final String endpoint;
    private final String college;
    private final CourseRepository courseRepository;
    private final CourseUnitRepository courseUnitRepository;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final java.util.concurrent.atomic.AtomicBoolean running = new java.util.concurrent.atomic.AtomicBoolean(false);

    public NapProgramSyncService(
            @Value("${nap.base-url:http://localhost:8080}") String baseUrl,
            @Value("${nap.endpoint:/api/v1/programs}") String endpoint,
            @Value("${nap.college:Alvin University}") String college,
            CourseRepository courseRepository,
            CourseUnitRepository courseUnitRepository) {
        this.baseUrl = baseUrl;
        this.endpoint = endpoint;
        this.college = college;
        this.courseRepository = courseRepository;
        this.courseUnitRepository = courseUnitRepository;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @EventListener(ApplicationReadyEvent.class)
    public void syncOnStartup() {
        try {
            syncPrograms();
        } catch (Exception e) {
            log.warn("NAP program sync on startup failed: {}", e.getMessage(), e);
        }
    }

    @Scheduled(fixedDelayString = "${nap.sync-interval-ms:3600000}")
    public void syncScheduled() {
        try {
            syncPrograms();
        } catch (Exception e) {
            log.warn("NAP program scheduled sync failed: {}", e.getMessage(), e);
        }
    }

    @Transactional
    public int syncPrograms() {
        if (!running.compareAndSet(false, true)) {
            return 0;
        }
        try {
            List<NapProgramDto> programs = fetchPrograms();
            int upserted = 0;
            int total = programs.size();

            for (NapProgramDto program : programs) {
                String code = program.programCode();
                if (code == null || code.isBlank()) {
                    continue;
                }
                if (upsertCourse(program)) {
                    upserted++;
                }
                syncCourseUnits(program);
            }

            log.info("NAP program sync complete: {} upserted of {} programs", upserted, total);
            return upserted;
        } finally {
            running.set(false);
        }
    }

    private boolean upsertCourse(NapProgramDto program) {
        String name = program.programName() != null && !program.programName().isBlank()
                ? program.programName().trim()
                : program.programCode();
        String department = program.department() != null && !program.department().isBlank()
                ? program.department().trim()
                : "Unassigned";
        int duration = program.numberOfYears() != null && program.numberOfYears() > 0
                ? program.numberOfYears()
                : 4;

        return courseRepository.findByCodeIgnoreCase(program.programCode().trim())
                .map(existing -> {
                    boolean changed = false;
                    if (!name.equals(existing.getName())) {
                        existing.setName(name);
                        changed = true;
                    }
                    if (!department.equals(existing.getDepartment())) {
                        existing.setDepartment(department);
                        changed = true;
                    }
                    if (existing.getDurationYears() == null
                            || existing.getDurationYears() != duration) {
                        existing.setDurationYears(duration);
                        changed = true;
                    }
                    if (changed) {
                        courseRepository.save(existing);
                    }
                    return false;
                })
                .orElseGet(() -> {
                    Course course = Course.builder()
                            .code(program.programCode().trim())
                            .name(name)
                            .college(college)
                            .department(department)
                            .durationYears(duration)
                            .build();
                    courseRepository.save(course);
                    return true;
                });
    }

    private void syncCourseUnits(NapProgramDto program) {
        if (program.curriculum() == null || program.curriculum().isBlank()) {
            return;
        }
        Course course = courseRepository.findByCodeIgnoreCase(program.programCode().trim()).orElse(null);
        if (course == null) {
            return;
        }
        try {
            JsonNode root = objectMapper.readTree(program.curriculum());
            JsonNode years = root.path("years");
            int synced = 0;
            if (years.isArray()) {
                for (JsonNode yearNode : years) {
                    int year = yearNode.path("year").asInt(0);
                    if (year <= 0) {
                        continue;
                    }
                    JsonNode semesters = yearNode.path("semesters");
                    if (semesters.isArray()) {
                        for (JsonNode semNode : semesters) {
                            int semester = semNode.path("semester").asInt(1);
                            JsonNode courses = semNode.path("courses");
                            if (courses.isArray()) {
                                for (JsonNode cu : courses) {
                                    if (upsertCourseUnit(course.getId(), cu, year, semester)) {
                                        synced++;
                                    }
                                }
                            }
                        }
                    }
                    JsonNode recess = yearNode.path("recessTerms");
                    if (recess.isArray()) {
                        for (JsonNode term : recess) {
                            JsonNode courses = term.path("courses");
                            if (courses.isArray()) {
                                for (JsonNode cu : courses) {
                                    if (upsertCourseUnit(course.getId(), cu, year, 1)) {
                                        synced++;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (synced > 0) {
                log.info("NAP course-unit sync: {} upserted for program {}", synced, program.programCode());
            }
        } catch (java.io.IOException e) {
            log.warn("Failed to parse curriculum for program {}: {}", program.programCode(), e.getMessage());
        }
    }

    private boolean upsertCourseUnit(Long courseId, JsonNode cu, int year, int semester) {
        String code = cu.path("code").asText("").trim();
        String name = cu.path("name").asText("").trim();
        int credits = cu.path("credits").asInt(0);
        if (code.isEmpty() || name.isEmpty()) {
            return false;
        }
        return courseUnitRepository.findByCourseIdAndCode(courseId, code)
                .map(existing -> {
                    boolean changed = false;
                    if (!name.equals(existing.getName())) {
                        existing.setName(name);
                        changed = true;
                    }
                    if (existing.getYear() == null || existing.getYear() != year) {
                        existing.setYear(year);
                        changed = true;
                    }
                    if (existing.getSemester() == null || existing.getSemester() != semester) {
                        existing.setSemester(semester);
                        changed = true;
                    }
                    if (existing.getCredits() == null || existing.getCredits() != credits) {
                        existing.setCredits(credits);
                        changed = true;
                    }
                    if (changed) {
                        courseUnitRepository.save(existing);
                    }
                    return false;
                })
                .orElseGet(() -> {
                    CourseUnit unit = CourseUnit.builder()
                            .code(code)
                            .name(name)
                            .courseId(courseId)
                            .semester(semester)
                            .year(year)
                            .credits(credits)
                            .build();
                    courseUnitRepository.save(unit);
                    return true;
                });
    }

    private List<NapProgramDto> fetchPrograms() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + endpoint))
                    .timeout(Duration.ofSeconds(20))
                    .header("Accept", "application/json")
                    .GET()
                    .build();
            HttpResponse<String> response =
                    httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new RuntimeException(
                        "NAP backend returned " + response.statusCode() + " for " + endpoint);
            }
            return objectMapper.readValue(
                    response.body(), new TypeReference<ArrayList<NapProgramDto>>() {});
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to contact NAP backend", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted while contacting NAP backend", e);
        }
    }
}
