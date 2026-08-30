package org.nexus.regbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FeeAssignmentDto {
    private Long id;
    private String item_name;
    private String category;
    private Integer year_level;
    private Integer semester;
    private String academic_year;
    private Double amount;
    private String currency;
    private String college;
    private String notes;
    private String created_at;
    private String updated_at;
}
