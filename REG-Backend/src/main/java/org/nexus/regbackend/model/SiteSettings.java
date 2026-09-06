package org.nexus.regbackend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Single-row site branding settings (id = 1).
 */
@Entity
@Table(name = "site_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteSettings {

    @Id
    private Long id;

    @Column(nullable = false, length = 150)
    private String siteName;

    @Column(length = 200)
    private String tagline;

    @Column(length = 500)
    private String logoUrl;

    @Column(length = 500)
    private String faviconUrl;

    /** HSL color triple, e.g. "24 100% 50%" — matches the app's CSS variables. */
    @Column(nullable = false, length = 50)
    private String primaryColor;

    @Column(length = 500)
    private String metaDescription;

    @Column(length = 500)
    private String ogImageUrl;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    private void touch() {
        this.updatedAt = LocalDateTime.now();
    }
}