package org.nexus.regbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ActivityDto {
    private Long id;
    private String entityType;
    private String entityId;
    private String entityName;
    private String entity;
    private String action;
    private String details;
    private String userId;
    private String userName;
    private String createdAt;
}
