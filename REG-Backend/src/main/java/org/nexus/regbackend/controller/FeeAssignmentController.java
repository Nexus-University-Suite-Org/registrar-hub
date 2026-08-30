package org.nexus.regbackend.controller;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.ApiResponse;
import org.nexus.regbackend.dto.FeeAssignmentDto;
import org.nexus.regbackend.model.FeeAssignment;
import org.nexus.regbackend.repository.FeeAssignmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/fee-assignments")
@RequiredArgsConstructor
public class FeeAssignmentController {

    private final FeeAssignmentRepository feeAssignmentRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FeeAssignmentDto>>> listFees(
            @RequestParam(required = false) String college,
            @RequestParam(required = false) String academic_year) {
        List<FeeAssignment> fees;
        if (college != null && !college.isBlank() && academic_year != null && !academic_year.isBlank()) {
            fees = feeAssignmentRepository.findByCollegeContainingIgnoreCaseAndAcademicYear(college, academic_year);
        } else if (college != null && !college.isBlank()) {
            fees = feeAssignmentRepository.findByCollegeContainingIgnoreCase(college);
        } else {
            fees = feeAssignmentRepository.findAll();
        }
        List<FeeAssignmentDto> dtos = fees.stream().map(this::toDto).collect(Collectors.toList());
        return ApiResponse.ok("Fee assignments retrieved", dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FeeAssignmentDto>> getFee(@PathVariable Long id) {
        FeeAssignment fee = feeAssignmentRepository.findById(id).orElse(null);
        if (fee == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Fee assignment not found");
        }
        return ApiResponse.ok("Fee assignment retrieved", toDto(fee));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FeeAssignmentDto>> createFee(@RequestBody FeeAssignmentDto dto) {
        FeeAssignment fee = FeeAssignment.builder()
                .itemName(dto.getItem_name())
                .category(dto.getCategory())
                .yearLevel(dto.getYear_level())
                .semester(dto.getSemester())
                .academicYear(dto.getAcademic_year())
                .amount(dto.getAmount() != null ? dto.getAmount() : 0.0)
                .currency(dto.getCurrency() != null ? dto.getCurrency() : "UGX")
                .college(dto.getCollege())
                .notes(dto.getNotes())
                .build();
        fee = feeAssignmentRepository.save(fee);
        return ApiResponse.created("Fee assignment created", toDto(fee));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FeeAssignmentDto>> updateFee(
            @PathVariable Long id, @RequestBody FeeAssignmentDto dto) {
        FeeAssignment fee = feeAssignmentRepository.findById(id).orElse(null);
        if (fee == null) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Fee assignment not found");
        }
        if (dto.getItem_name() != null) fee.setItemName(dto.getItem_name());
        if (dto.getCategory() != null) fee.setCategory(dto.getCategory());
        if (dto.getYear_level() != null) fee.setYearLevel(dto.getYear_level());
        if (dto.getSemester() != null) fee.setSemester(dto.getSemester());
        if (dto.getAcademic_year() != null) fee.setAcademicYear(dto.getAcademic_year());
        if (dto.getAmount() != null) fee.setAmount(dto.getAmount());
        if (dto.getCurrency() != null) fee.setCurrency(dto.getCurrency());
        if (dto.getCollege() != null) fee.setCollege(dto.getCollege());
        if (dto.getNotes() != null) fee.setNotes(dto.getNotes());
        fee = feeAssignmentRepository.save(fee);
        return ApiResponse.ok("Fee assignment updated", toDto(fee));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFee(@PathVariable Long id) {
        if (!feeAssignmentRepository.existsById(id)) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, "Fee assignment not found");
        }
        feeAssignmentRepository.deleteById(id);
        return ApiResponse.ok("Fee assignment deleted", null);
    }

    private FeeAssignmentDto toDto(FeeAssignment f) {
        return FeeAssignmentDto.builder()
                .id(f.getId())
                .item_name(f.getItemName())
                .category(f.getCategory())
                .year_level(f.getYearLevel())
                .semester(f.getSemester())
                .academic_year(f.getAcademicYear())
                .amount(f.getAmount())
                .currency(f.getCurrency())
                .college(f.getCollege())
                .notes(f.getNotes())
                .created_at(f.getCreatedAt() != null ? f.getCreatedAt().toString() : null)
                .updated_at(f.getUpdatedAt() != null ? f.getUpdatedAt().toString() : null)
                .build();
    }
}
