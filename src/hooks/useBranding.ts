import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, db } from "@/lib/firebase";

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
    const fetchBranding = async () => {
      try {
        const docRef = doc(db, "settings", "branding");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const brandingData = {
            ...DEFAULT_BRANDING,
            ...docSnap.data(),
          } as BrandingSettings;
          setBranding(brandingData);
          // Update meta tags on load
          if ((window as any).updateMetaTags) {
            (window as any).updateMetaTags(brandingData);
          }
        } else {
          // Initialize with defaults
          await setDoc(docRef, DEFAULT_BRANDING);
          if ((window as any).updateMetaTags) {
            (window as any).updateMetaTags(DEFAULT_BRANDING);
          }
        }
      } catch (error) {
        console.error("Error fetching branding settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();
  }, []);

  const updateBranding = async (updates: Partial<BrandingSettings>) => {
    try {
      const docRef = doc(db, "settings", "branding");
      const newBranding = { ...branding, ...updates };
      await setDoc(docRef, newBranding);
      setBranding(newBranding);

      // Update document title
      document.title = newBranding.siteName;

      // Update meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc)
        metaDesc.setAttribute("content", newBranding.metaDescription);

      // Update primary color CSS variable
      document.documentElement.style.setProperty(
        "--primary",
        newBranding.primaryColor,
      );

      // Update global meta tags if function exists
      if ((window as any).updateMetaTags) {
        (window as any).updateMetaTags(newBranding);
      }

      return true;
    } catch (error) {
      console.error("Error updating branding:", error);
      return false;
    }
  };

  return { branding, loading, updateBranding };
};
