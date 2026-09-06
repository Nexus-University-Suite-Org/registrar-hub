package org.nexus.regbackend.repository;

import org.nexus.regbackend.model.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    List<ServiceRequest> findByStudentIdOrderByCreatedAtDesc(String studentId);
    List<ServiceRequest> findByStatusOrderByCreatedAtDesc(ServiceRequest.Status status);
    List<ServiceRequest> findAllByOrderByCreatedAtDesc();
    List<ServiceRequest> findByServiceIdOrderByCreatedAtDesc(Long serviceId);
}
