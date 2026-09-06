package org.nexus.regbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UniversityServiceDto {
    private Long id;
    private String name;
    private String description;
    private String category;
    private BigDecimal fee;
    private String processing_time;
    private String icon;
    private Boolean is_active;
    private Integer sort_order;
    private String created_at;
    private String updated_at;
}
