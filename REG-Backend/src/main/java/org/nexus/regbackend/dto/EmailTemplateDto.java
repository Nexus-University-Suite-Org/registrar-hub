package org.nexus.regbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmailTemplateDto {
    private Long id;
    private String template_key;
    private String name;
    private String subject;
    private String body;
    private String description;
    private Boolean is_active;
    private String created_at;
    private String updated_at;
}