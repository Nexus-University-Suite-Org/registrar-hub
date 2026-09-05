package org.nexus.regbackend.controller;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.ApiResponse;
import org.nexus.regbackend.dto.UniversityServiceDto;
import org.nexus.regbackend.model.UniversityService;
import org.nexus.regbackend.repository.UniversityServiceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/university-services")
@RequiredArgsConstructor
public class UniversityServiceController {

    private final UniversityServiceRepository serviceRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UniversityServiceDto>>> listServices(
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String category) {
        List<UniversityService> services;
        if (Boolean.TRUE.equals(active)) {
            services = serviceRepository.findByIsActiveTrueOrderBySortOrderAsc();
        } else if (category != null && !category.isBlank()) {
            services = serviceRepository.findByCategoryContainingIgnoreCaseOrderBySortOrderAsc(category);
        } else {
            services = serviceRepository.findAllByOrderBySortOrderAsc();
        }
        List<UniversityServiceDto> dtos = services.stream().map(this::toDto).collect(Collectors.toList());
        return ApiResponse.ok("Services retrieved", dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UniversityServiceDto>> getService(@PathVariable Long id) {
        UniversityService service = serviceRepository.findById(id).orElse(null);
        if (service == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Service not found");
        }
        return ApiResponse.ok("Service retrieved", toDto(service));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UniversityServiceDto>> createService(@RequestBody UniversityServiceDto dto) {
        UniversityService service = UniversityService.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .category(dto.getCategory())
                .fee(dto.getFee())
                .processingTime(dto.getProcessing_time())
                .icon(dto.getIcon())
                .isActive(dto.getIs_active() != null ? dto.getIs_active() : true)
                .sortOrder(dto.getSort_order() != null ? dto.getSort_order() : 0)
                .build();
        service = serviceRepository.save(service);
        return ApiResponse.created("Service created", toDto(service));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UniversityServiceDto>> updateService(
            @PathVariable Long id, @RequestBody UniversityServiceDto dto) {
        UniversityService service = serviceRepository.findById(id).orElse(null);
        if (service == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Service not found");
        }
        if (dto.getName() != null) service.setName(dto.getName());
        if (dto.getDescription() != null) service.setDescription(dto.getDescription());
        if (dto.getCategory() != null) service.setCategory(dto.getCategory());
        if (dto.getFee() != null) service.setFee(dto.getFee());
        if (dto.getProcessing_time() != null) service.setProcessingTime(dto.getProcessing_time());
        if (dto.getIcon() != null) service.setIcon(dto.getIcon());
        if (dto.getIs_active() != null) service.setIsActive(dto.getIs_active());
        if (dto.getSort_order() != null) service.setSortOrder(dto.getSort_order());
        service = serviceRepository.save(service);
        return ApiResponse.ok("Service updated", toDto(service));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable Long id) {
        if (!serviceRepository.existsById(id)) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Service not found");
        }
        serviceRepository.deleteById(id);
        return ApiResponse.ok("Service deleted", null);
    }

    private UniversityServiceDto toDto(UniversityService s) {
        return UniversityServiceDto.builder()
                .id(s.getId())
                .name(s.getName())
                .description(s.getDescription())
                .category(s.getCategory())
                .fee(s.getFee())
                .processing_time(s.getProcessingTime())
                .icon(s.getIcon())
                .is_active(s.getIsActive())
                .sort_order(s.getSortOrder())
                .created_at(s.getCreatedAt() != null ? s.getCreatedAt().toString() : null)
                .updated_at(s.getUpdatedAt() != null ? s.getUpdatedAt().toString() : null)
                .build();
    }
}
