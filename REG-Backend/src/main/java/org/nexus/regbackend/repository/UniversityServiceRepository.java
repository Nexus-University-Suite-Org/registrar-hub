package org.nexus.regbackend.repository;

import org.nexus.regbackend.model.UniversityService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UniversityServiceRepository extends JpaRepository<UniversityService, Long> {
    List<UniversityService> findByIsActiveTrueOrderBySortOrderAsc();
    List<UniversityService> findByCategoryContainingIgnoreCaseOrderBySortOrderAsc(String category);
    List<UniversityService> findAllByOrderBySortOrderAsc();
}
