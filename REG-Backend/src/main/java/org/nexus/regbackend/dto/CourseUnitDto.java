package org.nexus.regbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseUnitDto {
    private Long id;
    private String code;
    private String name;
    private Long course_id;
    private String course_name;
    private Integer semester;
    private Integer year;
    private Integer credits;
    private String created_at;
    private String updated_at;
}
