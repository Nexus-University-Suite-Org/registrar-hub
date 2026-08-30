package org.nexus.regbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SignUpDto {
    private Long id;
    private Long lecturer_id;
    private String lecturer_name;
    private String lecturer_email;
    private Long course_unit_id;
    private String course_unit_code;
    private String course_unit_name;
    private Long course_id;
    private String assigned_by;
    private String assigned_at;
    private String status;
}
