package org.nexus.regbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LecturerDto {
    private Long id;
    private String lecturer_number;
    private String first_name;
    private String last_name;
    private String email;
    private String phone;
    private String address;
    private String bio;
    private String department;
    private String specialization;
    private String employment_date;
    private String status;
    private String avatar_url;
    private String role;
    private String created_at;
    private String updated_at;
}
