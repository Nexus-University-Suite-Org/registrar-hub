package org.nexus.regbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request body for the authenticated change-staff-ID flow.
 * Staff ID has a unique constraint — uniqueness is verified before persisting.
 */
@Data
public class ChangeStaffIdRequest {

    @NotBlank(message = "New staff ID is required")
    @Size(max = 50, message = "Staff ID must not exceed 50 characters")
    private String newStaffId;
}
