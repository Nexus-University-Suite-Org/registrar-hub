package org.nexus.regbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StudentDto {
    private Long id;
    private String student_number;
    private String registration_number;
    private String full_name;
    private String email;
    private String department;
    private String program;
    private Integer year_of_study;
    private String status;
    private String admission_date;
    private String avatar_url;
    private String role;
    private Boolean is_registered;
    private String created_at;
    private String updated_at;
}
