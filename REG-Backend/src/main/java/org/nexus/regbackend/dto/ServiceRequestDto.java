package org.nexus.regbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ServiceRequestDto {
    private Long id;
    private String student_id;
    private String student_name;
    private Long service_id;
    private String service_name;
    private String status;
    private String notes;
    private String created_at;
    private String updated_at;
}
