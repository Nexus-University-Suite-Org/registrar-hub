package org.nexus.regbackend.controller;

import lombok.RequiredArgsConstructor;
import org.nexus.regbackend.dto.ApiResponse;
import org.nexus.regbackend.dto.SiteSettingsDto;
import org.nexus.regbackend.model.SiteSettings;
import org.nexus.regbackend.repository.SiteSettingsRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Site branding settings — GET is public (pre-auth login page reads it),
 * PUT requires an authenticated registrar.
 */
@RestController
@RequestMapping("/api/settings/branding")
@RequiredArgsConstructor
public class SiteSettingsController {

    private final SiteSettingsRepository siteSettingsRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<SiteSettingsDto>> get() {
        SiteSettings settings = siteSettingsRepository.findById(1L).orElse(null);
        return ApiResponse.ok("Branding retrieved", settings != null ? toDto(settings) : defaultDto());
    }

    @PutMapping
    public ResponseEntity<ApiResponse<SiteSettingsDto>> update(@RequestBody SiteSettingsDto dto) {
        SiteSettings settings = siteSettingsRepository.findById(1L)
                .orElseGet(() -> SiteSettings.builder().id(1L).build());

        if (dto.getSite_name() != null) settings.setSiteName(dto.getSite_name());
        if (dto.getTagline() != null) settings.setTagline(dto.getTagline());
        if (dto.getLogo_url() != null) settings.setLogoUrl(dto.getLogo_url());
        if (dto.getFavicon_url() != null) settings.setFaviconUrl(dto.getFavicon_url());
        if (dto.getPrimary_color() != null) settings.setPrimaryColor(dto.getPrimary_color());
        if (dto.getMeta_description() != null) settings.setMetaDescription(dto.getMeta_description());
        if (dto.getOg_image_url() != null) settings.setOgImageUrl(dto.getOg_image_url());

        settings = siteSettingsRepository.save(settings);
        return ApiResponse.ok("Branding updated", toDto(settings));
    }

    private SiteSettingsDto toDto(SiteSettings s) {
        return SiteSettingsDto.builder()
                .id(s.getId())
                .site_name(s.getSiteName())
                .tagline(s.getTagline())
                .logo_url(s.getLogoUrl())
                .favicon_url(s.getFaviconUrl())
                .primary_color(s.getPrimaryColor())
                .meta_description(s.getMetaDescription())
                .og_image_url(s.getOgImageUrl())
                .updated_at(s.getUpdatedAt() != null ? s.getUpdatedAt().toString() : null)
                .build();
    }

    private SiteSettingsDto defaultDto() {
        return SiteSettingsDto.builder()
                .id(1L)
                .site_name("Registrar Portal")
                .primary_color("24 100% 50%")
                .meta_description("Registrar Portal")
                .build();
    }
}