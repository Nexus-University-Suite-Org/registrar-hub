package org.nexus.regbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AcademicCalendarEventDto {
    private Long id;
    private String title;
    private String date;
    private String due_date;
    private String type;
    private String description;
    private Boolean is_active;
    private String created_at;
    private String updated_at;
}
