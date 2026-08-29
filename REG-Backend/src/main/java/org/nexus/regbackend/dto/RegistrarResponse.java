package org.nexus.regbackend.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Full profile view of a registrar account.
 * Never exposes the password hash or other sensitive fields.
 */
@Getter
@Builder
public class RegistrarResponse {

    private Long          id;
    private String        firstName;
    private String        lastName;
    private String        email;
    private String        username;
    private String        staffId;
    private String        institution;
    private String        department;
    private String        phoneNumber;
    private LocalDate     dateOfBirth;
    private String        role;
    private boolean       emailVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
