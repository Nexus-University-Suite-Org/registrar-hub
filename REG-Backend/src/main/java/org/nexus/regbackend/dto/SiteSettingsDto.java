package org.nexus.regbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SiteSettingsDto {
    private Long id;
    private String site_name;
    private String tagline;
    private String logo_url;
    private String favicon_url;
    private String primary_color;
    private String meta_description;
    private String og_image_url;
    private String updated_at;
}