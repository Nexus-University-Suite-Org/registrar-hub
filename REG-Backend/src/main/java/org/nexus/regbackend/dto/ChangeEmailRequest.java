package org.nexus.regbackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Step 2 of the email-change flow.
 * Supplies the new email address and the OTP that was sent to it.
 * The system verifies the OTP server-side before committing the new address.
 */
@Data
public class ChangeEmailRequest {

    @NotBlank(message = "New email is required")
    @Email(message = "New email must be a valid address")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String newEmail;

    @NotBlank(message = "OTP is required")
    @Pattern(regexp = "^\\d{4}$", message = "OTP must be exactly 4 digits")
    private String otp;
}
