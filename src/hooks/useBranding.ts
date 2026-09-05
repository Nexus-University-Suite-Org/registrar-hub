import { useEffect, useState } from "react";
import { get, put } from "@/lib/api";
import { adjustHsl, hslToCss, hslToTriplet, parseHsl } from "@/lib/color";
import type { SiteBranding } from "@/types/settings";

export interface BrandingSettings {
  id?: number;
  name: string;
  siteName: string;
  tagline?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  primaryRaw: string;
  metaDescription: string;
  ogImageUrl?: string;
}

const DEFAULT_BRANDING: BrandingSettings = {
  id: 1,
  siteName: "Registrar Portal",
  tagline: "Nexus University Registrar Management System",
  logoUrl: "",
  faviconUrl: "",
  primaryColor: "hsl(24, 100%, 50%)",
  primaryRaw: "24 100% 50%",
  metaDescription: "Registrar Portal",
  ogImageUrl: "",
};

function applyBrandingTheme(branding: BrandingSettings) {
  const hsl = parseHsl(branding.primaryColor) || parseHsl(DEFAULT_BRANDING.primaryColor);
  if (!hsl) return;
  const root = document.documentElement;
  const set = (name: string, value: string) => root.style.setProperty(name, value);
  const primary = hslToTriplet(hsl);
  set("--primary", primary);
  set("--ring", primary);
  set("--sidebar-primary", primary);
  set("--sidebar-ring", primary);
  set("--primary-hover", hslToTriplet(adjustHsl(hsl, 0, 0, -5)));
  set(
    "--sidebar-accent",
    hslToTriplet(adjustHsl(hsl, 0, 0, Math.min(97, hsl.l + 47))),
  );
  set(
    "--sidebar-accent-foreground",
    hslToTriplet(adjustHsl(hsl, 0, 0, 35)),
  );
  set("--sidebar-border", hslToTriplet(adjustHsl(hsl, 0, -80, 92)));
}

function toBranding(site: SiteBranding | null | undefined): BrandingSettings {
  if (!site) return DEFAULT_BRANDING;
  const primaryRaw = site.primary_color || DEFAULT_BRANDING.primaryRaw;
  const hsl = parseHsl(primaryRaw);
  return {
    id: site.id,
    name: site.site_name,
    siteName: site.site_name,
    tagline: site.tagline || "",
    logoUrl: site.logo_url || "",
    faviconUrl: site.favicon_url || "",
    primaryColor: hsl ? hslToCss(hsl) : DEFAULT_BRANDING.primaryColor,
    primaryRaw,
    metaDescription: site.meta_description || "",
    ogImageUrl: site.og_image_url || "",
  };
}

export const useBranding = () => {
  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const site = await get<SiteBranding>("/settings/branding");
        if (cancelled) return;
        const next = toBranding(site);
        setBranding(next);
        applyBrandingTheme(next);
      } catch {
        if (cancelled) return;
        setBranding(DEFAULT_BRANDING);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateBranding = async (updates: Partial<BrandingSettings>) => {
    try {
      const next = { ...branding, ...updates };
      const selectedHsl = parseHsl(next.primaryColor);
      const payload: Partial<SiteBranding> = {
        site_name: next.siteName,
        tagline: next.tagline,
        logo_url: next.logoUrl,
        favicon_url: next.faviconUrl,
        primary_color: selectedHsl
          ? hslToTriplet(selectedHsl)
          : next.primaryRaw,
        meta_description: next.metaDescription,
        og_image_url: next.ogImageUrl,
      };
      const saved = await put<SiteBranding>("/settings/branding", payload);
      const nextBranding = toBranding(saved);
      setBranding(nextBranding);
      applyBrandingTheme(nextBranding);
      if (nextBranding.siteName) document.title = nextBranding.siteName;
      return true;
    } catch (error) {
      console.error("Error updating branding:", error);
      return false;
    }
  };

  return { branding, loading, updateBranding };
};