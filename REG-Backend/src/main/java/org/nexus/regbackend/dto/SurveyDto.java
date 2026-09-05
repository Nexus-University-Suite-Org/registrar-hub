package org.nexus.regbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SurveyDto {
    private Long id;
    private String title;
    private String description;
    private Integer year;
    private Integer semester;
    private Long course_unit_id;
    private String course_unit_code;
    private String course_unit_name;
    private String status;
    private String deadline;
    private List<SurveyQuestionDto> questions;
    private String created_at;
    private String updated_at;
}