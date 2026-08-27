package org.nexus.regbackend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * REG_UCD_005 — request body for verifying a sign-up OTP.
 */
@Data
public class VerifyOtpRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid address")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;

    @NotBlank(message = "OTP is required")
    @Pattern(regexp = "^\\d{4}$", message = "OTP must be exactly 4 digits")
    private String otp;
}
