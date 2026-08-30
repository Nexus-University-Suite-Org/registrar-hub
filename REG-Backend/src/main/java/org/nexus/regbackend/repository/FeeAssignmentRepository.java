package org.nexus.regbackend.repository;

import org.nexus.regbackend.model.FeeAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeeAssignmentRepository extends JpaRepository<FeeAssignment, Long> {
    List<FeeAssignment> findByCollegeContainingIgnoreCase(String college);
    List<FeeAssignment> findByCollegeContainingIgnoreCaseAndAcademicYear(String college, String academicYear);
}
