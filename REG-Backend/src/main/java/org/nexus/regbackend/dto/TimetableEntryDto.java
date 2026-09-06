package org.nexus.regbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TimetableEntryDto {
    private Long id;
    private String program;
    private String program_code;
    private String academic_year;
    private Integer semester;
    private Integer year_of_study;
    private String day_of_week;
    private String start_time;
    private String end_time;
    private String room;
    private String session_type;
    private Boolean is_online;
    private String lecturer_name;
    private Long course_unit_id;
    private String course_unit_code;
    private String course_unit_name;
    private String created_at;
    private String updated_at;
}