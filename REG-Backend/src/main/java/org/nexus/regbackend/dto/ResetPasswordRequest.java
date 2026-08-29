package org.nexus.regbackend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * REG_UCD_006 — request body for resetting a forgotten password.
 */
@Data
public class ResetPasswordRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid address")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;

    @NotBlank(message = "New password is required")
    @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
    private String newPassword;
}
