package org.nexus.regbackend.repository;

import org.nexus.regbackend.model.CourseUnit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseUnitRepository extends JpaRepository<CourseUnit, Long> {

    List<CourseUnit> findByCourseId(Long courseId);

    List<CourseUnit> findByCourseIdIn(List<Long> courseIds);

    Optional<CourseUnit> findByCourseIdAndCode(Long courseId, String code);
}
