package org.nexus.regbackend.controller;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.ApiResponse;
import org.nexus.regbackend.dto.ServiceRequestDto;
import org.nexus.regbackend.model.ServiceRequest;
import org.nexus.regbackend.model.UniversityService;
import org.nexus.regbackend.repository.ServiceRequestRepository;
import org.nexus.regbackend.repository.UniversityServiceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/service-requests")
@RequiredArgsConstructor
public class ServiceRequestController {

    private final ServiceRequestRepository requestRepository;
    private final UniversityServiceRepository serviceRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceRequestDto>>> listRequests(
            @RequestParam(required = false) String student_id,
            @RequestParam(required = false) String status) {
        List<ServiceRequest> requests;
        if (student_id != null && !student_id.isBlank()) {
            requests = requestRepository.findByStudentIdOrderByCreatedAtDesc(student_id);
        } else if (status != null && !status.isBlank()) {
            try {
                ServiceRequest.Status s = ServiceRequest.Status.valueOf(status.toUpperCase());
                requests = requestRepository.findByStatusOrderByCreatedAtDesc(s);
            } catch (IllegalArgumentException e) {
                return ApiResponse.error(HttpStatus.BAD_REQUEST, "Invalid status value");
            }
        } else {
            requests = requestRepository.findAllByOrderByCreatedAtDesc();
        }
        List<ServiceRequestDto> dtos = requests.stream().map(this::toDto).collect(Collectors.toList());
        return ApiResponse.ok("Service requests retrieved", dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceRequestDto>> getRequest(@PathVariable Long id) {
        ServiceRequest request = requestRepository.findById(id).orElse(null);
        if (request == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Service request not found");
        }
        return ApiResponse.ok("Service request retrieved", toDto(request));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ServiceRequestDto>> createRequest(@RequestBody ServiceRequestDto dto) {
        UniversityService service = serviceRepository.findById(dto.getService_id()).orElse(null);
        if (service == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Service not found");
        }
        ServiceRequest request = ServiceRequest.builder()
                .studentId(dto.getStudent_id())
                .studentName(dto.getStudent_name())
                .service(service)
                .serviceName(service.getName())
                .notes(dto.getNotes())
                .build();
        request = requestRepository.save(request);
        return ApiResponse.created("Service request submitted", toDto(request));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ServiceRequestDto>> updateStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        ServiceRequest request = requestRepository.findById(id).orElse(null);
        if (request == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Service request not found");
        }
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "Status is required");
        }
        try {
            request.setStatus(ServiceRequest.Status.valueOf(newStatus.toUpperCase()));
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "Invalid status value");
        }
        request = requestRepository.save(request);
        return ApiResponse.ok("Status updated", toDto(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRequest(@PathVariable Long id) {
        if (!requestRepository.existsById(id)) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Service request not found");
        }
        requestRepository.deleteById(id);
        return ApiResponse.ok("Service request deleted", null);
    }

    private ServiceRequestDto toDto(ServiceRequest r) {
        return ServiceRequestDto.builder()
                .id(r.getId())
                .student_id(r.getStudentId())
                .student_name(r.getStudentName())
                .service_id(r.getService() != null ? r.getService().getId() : null)
                .service_name(r.getServiceName())
                .status(r.getStatus() != null ? r.getStatus().name() : null)
                .notes(r.getNotes())
                .created_at(r.getCreatedAt() != null ? r.getCreatedAt().toString() : null)
                .updated_at(r.getUpdatedAt() != null ? r.getUpdatedAt().toString() : null)
                .build();
    }
}
