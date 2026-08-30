package org.nexus.regbackend.repository;

import org.nexus.regbackend.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByCollege(String college);

    List<Course> findByCollegeContainingIgnoreCase(String college);
}
