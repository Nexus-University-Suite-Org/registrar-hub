package org.nexus.regbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseDto {
    private Long id;
    private String code;
    private String name;
    private String college;
    private String department;
    private Integer duration_years;
    private String created_at;
    private String updated_at;
}
