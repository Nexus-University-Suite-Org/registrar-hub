package org.nexus.regbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * REG_UCD_002 — login request.
 * {@code identifier} accepts either email or username.
 */
@Data
public class LoginRequest {

    @NotBlank(message = "Identifier (email or username) is required")
    @Size(max = 150, message = "Identifier must not exceed 150 characters")
    private String identifier;

    @NotBlank(message = "Password is required")
    @Size(max = 128, message = "Password must not exceed 128 characters")
    private String password;
}
