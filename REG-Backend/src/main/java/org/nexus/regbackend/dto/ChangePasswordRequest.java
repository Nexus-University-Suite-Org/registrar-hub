package org.nexus.regbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request body for the authenticated change-password flow.
 *
 * <p>Distinct from {@link ResetPasswordRequest}, which is used in the
 * unauthenticated OTP-based reset flow (REG_UCD_006).
 * Here the caller must supply their current password so the system can
 * verify ownership before accepting the new one.
 */
@Data
public class ChangePasswordRequest {

    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @NotBlank(message = "New password is required")
    @Size(min = 8, max = 128, message = "New password must be between 8 and 128 characters")
    private String newPassword;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;
}
