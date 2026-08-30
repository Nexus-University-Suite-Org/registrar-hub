package org.nexus.regbackend.repository;

import org.nexus.regbackend.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {

    List<Student> findByRole(org.nexus.regbackend.model.Role role);

    @Query("SELECT s FROM Student s WHERE LOWER(s.fullName) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(s.email) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(s.studentNumber) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(s.department) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Student> search(@Param("q") String query);

    boolean existsByEmail(String email);

    boolean existsByStudentNumber(String studentNumber);
}
