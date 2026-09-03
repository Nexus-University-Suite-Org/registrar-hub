package org.nexus.regbackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Step 1 of the email-change flow.
 * Supplies the new email address that the OTP will be sent to.
 */
@Data
public class SendEmailChangeOtpRequest {

    @NotBlank(message = "New email is required")
    @Email(message = "New email must be a valid address")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String newEmail;
}
