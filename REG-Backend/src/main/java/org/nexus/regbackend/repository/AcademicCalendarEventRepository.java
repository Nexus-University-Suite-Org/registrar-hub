package org.nexus.regbackend.repository;

import org.nexus.regbackend.model.AcademicCalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AcademicCalendarEventRepository extends JpaRepository<AcademicCalendarEvent, Long> {
    List<AcademicCalendarEvent> findAllByOrderByDateAscIdAsc();
}
