package org.nexus.regbackend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

/**
 * REG_UCD_008 — Partial update request for a registrar profile.
 *
 * <p>Every field is optional (no {@code @NotBlank} / {@code @NotNull}).
 * Fields that are {@code null} in the request are treated as "no change"
 * and must not overwrite the existing value (merge-on-null semantics).
 * Validation constraints apply only when the field is actually supplied.
 */
@Data
public class UpdateRegistrarRequest {

    @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
    @Pattern(regexp = "^[A-Za-z '-]+$", message = "First name contains invalid characters")
    private String firstName;

    @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
    @Pattern(regexp = "^[A-Za-z '-]+$", message = "Last name contains invalid characters")
    private String lastName;

    @Size(max = 50, message = "Staff ID must not exceed 50 characters")
    private String staffId;

    @Size(min = 2, max = 100, message = "Institution name must be between 2 and 100 characters")
    private String institution;

    @Size(min = 2, max = 100, message = "Department must be between 2 and 100 characters")
    private String department;

    @Pattern(
            regexp = "^\\+?[0-9]{7,20}$",
            message = "Phone number must be 7–20 digits and may start with +"
    )
    private String phoneNumber;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;
}
