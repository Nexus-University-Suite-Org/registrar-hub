package org.nexus.regbackend.repository;

import org.nexus.regbackend.model.Specialization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SpecializationRepository extends JpaRepository<Specialization, Long> {
    List<Specialization> findAllByOrderByNameAsc();
    List<Specialization> findByDepartmentIgnoreCase(String department);
    Optional<Specialization> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}
