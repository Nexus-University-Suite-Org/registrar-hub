package org.nexus.regbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RegistrarProfileDto {
    private Long id;
    private String first_name;
    private String last_name;
    private String email;
    private String username;
    private String employee_id;
    private String department;
    private String college;
    private String phone_number;
    private String role;
}