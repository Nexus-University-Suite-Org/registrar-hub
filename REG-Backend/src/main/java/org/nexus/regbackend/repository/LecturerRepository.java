package org.nexus.regbackend.repository;

import org.nexus.regbackend.model.Lecturer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LecturerRepository extends JpaRepository<Lecturer, Long> {

    List<Lecturer> findByRole(org.nexus.regbackend.model.Role role);

    @Query("SELECT l FROM Lecturer l WHERE LOWER(l.firstName) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(l.lastName) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(l.email) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(l.lecturerNumber) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "OR LOWER(l.department) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Lecturer> search(@Param("q") String query);

    boolean existsByEmail(String email);

    boolean existsByLecturerNumber(String lecturerNumber);
}
