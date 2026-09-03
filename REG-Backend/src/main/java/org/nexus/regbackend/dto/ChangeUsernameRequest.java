package org.nexus.regbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request body for the authenticated change-username flow.
 */
@Data
public class ChangeUsernameRequest {

    @NotBlank(message = "New username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(
            regexp = "^[A-Za-z0-9_.-]+$",
            message = "Username may only contain letters, digits, underscores, dots and hyphens"
    )
    private String newUsername;
}
