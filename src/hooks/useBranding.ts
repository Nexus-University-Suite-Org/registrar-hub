import { useEffect, useState } from "react";

export interface BrandingSettings {
  name: string;
  siteName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  metaDescription: string;
  ogImageUrl?: string;
}

const DEFAULT_BRANDING: BrandingSettings = {
  siteName: "Registrar Portal",
  logoUrl: "",
  faviconUrl: "",
  primaryColor: "hsl(24, 100%, 50%)",
  metaDescription: "Registrar Portal",
  ogImageUrl: "",
};

export const useBranding = () => {
  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch branding from Django API endpoint
    setLoading(false);
  }, []);

  const updateBranding = async (updates: Partial<BrandingSettings>) => {
    try {
      const newBranding = { ...branding, ...updates };
      setBranding(newBranding);
      // TODO: Persist via Django API
      return true;
    } catch (error) {
      console.error("Error updating branding:", error);
      return false;
    }
  };

  return { branding, loading, updateBranding };
};
