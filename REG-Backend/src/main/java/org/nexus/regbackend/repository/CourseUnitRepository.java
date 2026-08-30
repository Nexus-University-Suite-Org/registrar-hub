package org.nexus.regbackend.repository;

import org.nexus.regbackend.model.CourseUnit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseUnitRepository extends JpaRepository<CourseUnit, Long> {

    List<CourseUnit> findByCourseId(Long courseId);

    List<CourseUnit> findByCourseIdIn(List<Long> courseIds);
}
