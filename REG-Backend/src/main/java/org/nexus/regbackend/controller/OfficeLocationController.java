package org.nexus.regbackend.controller;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.ApiResponse;
import org.nexus.regbackend.dto.OfficeLocationDto;
import org.nexus.regbackend.model.OfficeLocation;
import org.nexus.regbackend.repository.OfficeLocationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/office-locations")
@RequiredArgsConstructor
public class OfficeLocationController {

    private final OfficeLocationRepository officeLocationRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OfficeLocationDto>>> listOffices() {
        List<OfficeLocation> offices = officeLocationRepository.findAllByOrderBySortOrderAsc();
        List<OfficeLocationDto> dtos = offices.stream().map(this::toDto).collect(Collectors.toList());
        return ApiResponse.ok("Office locations retrieved", dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OfficeLocationDto>> getOffice(@PathVariable Long id) {
        OfficeLocation office = officeLocationRepository.findById(id).orElse(null);
        if (office == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Office location not found");
        }
        return ApiResponse.ok("Office location retrieved", toDto(office));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OfficeLocationDto>> createOffice(@RequestBody OfficeLocationDto dto) {
        OfficeLocation office = OfficeLocation.builder()
                .name(dto.getName())
                .building(dto.getBuilding())
                .room(dto.getRoom())
                .hours(dto.getHours())
                .sortOrder(dto.getSort_order() != null ? dto.getSort_order() : 0)
                .build();
        office = officeLocationRepository.save(office);
        return ApiResponse.created("Office location created", toDto(office));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<OfficeLocationDto>> updateOffice(
            @PathVariable Long id, @RequestBody OfficeLocationDto dto) {
        OfficeLocation office = officeLocationRepository.findById(id).orElse(null);
        if (office == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Office location not found");
        }
        if (dto.getName() != null) office.setName(dto.getName());
        if (dto.getBuilding() != null) office.setBuilding(dto.getBuilding());
        if (dto.getRoom() != null) office.setRoom(dto.getRoom());
        if (dto.getHours() != null) office.setHours(dto.getHours());
        if (dto.getSort_order() != null) office.setSortOrder(dto.getSort_order());
        office = officeLocationRepository.save(office);
        return ApiResponse.ok("Office location updated", toDto(office));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOffice(@PathVariable Long id) {
        if (!officeLocationRepository.existsById(id)) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Office location not found");
        }
        officeLocationRepository.deleteById(id);
        return ApiResponse.ok("Office location deleted", null);
    }

    private OfficeLocationDto toDto(OfficeLocation o) {
        return OfficeLocationDto.builder()
                .id(o.getId())
                .name(o.getName())
                .building(o.getBuilding())
                .room(o.getRoom())
                .hours(o.getHours())
                .sort_order(o.getSortOrder())
                .created_at(o.getCreatedAt() != null ? o.getCreatedAt().toString() : null)
                .updated_at(o.getUpdatedAt() != null ? o.getUpdatedAt().toString() : null)
                .build();
    }
}
