package org.nexus.regbackend.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * Slim view of a newly created registrar account returned after sign-up.
 * Never exposes the password hash or other sensitive fields.
 */
@Getter
@Builder
public class RegistrarResponse {

    private Long   id;
    private String firstName;
    private String lastName;
    private String email;
    private String username;
    private String staffId;
    private String institution;
    private String department;
    private String phoneNumber;
    private String role;
}
