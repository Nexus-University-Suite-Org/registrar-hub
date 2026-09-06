package org.nexus.regbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OfficeLocationDto {
    private Long id;
    private String name;
    private String building;
    private String room;
    private String hours;
    private Integer sort_order;
    private String created_at;
    private String updated_at;
}
