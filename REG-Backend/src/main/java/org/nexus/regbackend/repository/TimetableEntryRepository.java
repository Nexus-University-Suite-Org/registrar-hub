package org.nexus.regbackend.repository;

import org.nexus.regbackend.model.TimetableEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimetableEntryRepository extends JpaRepository<TimetableEntry, Long> {

    List<TimetableEntry> findByProgramIgnoreCaseOrderByDayOfWeekAscStartTimeAsc(String program);

    List<TimetableEntry> findByProgramCodeIgnoreCaseOrderByDayOfWeekAscStartTimeAsc(String programCode);

    List<TimetableEntry> findByProgramIgnoreCaseAndAcademicYearAndSemesterAndYearOfStudyOrderByDayOfWeekAscStartTimeAsc(
            String program, String academicYear, Integer semester, Integer yearOfStudy);

    List<TimetableEntry> findAllByOrderByDayOfWeekAscStartTimeAsc();
}