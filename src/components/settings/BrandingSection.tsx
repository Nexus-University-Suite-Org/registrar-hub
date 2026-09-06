import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, ImageIcon } from "lucide-react";
import { uploadFile } from "@/lib/api";
import { hslToHex, parseHsl } from "@/lib/color";
import { toast } from "sonner";
import type { BrandingSettings } from "@/hooks/useBranding";

interface Props {
  branding: BrandingSettings;
  updateBranding: (updates: Partial<BrandingSettings>) => Promise<boolean>;
}

export default function BrandingSection({ branding, updateBranding }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [siteName, setSiteName] = useState(branding.siteName);
  const [tagline, setTagline] = useState(branding.tagline || "");
  const [metaDescription, setMetaDescription] = useState(
    branding.metaDescription || "",
  );
  const [logoUrl, setLogoUrl] = useState(branding.logoUrl || "");
  const [searchColor, setSearchColor] = useState(
    hslToHex(parseHsl(branding.primaryColor) ?? { h: 24, s: 100, l: 50 }),
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleColorChange = (hex: string) => {
    setSearchColor(hex);
  };

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadFile<{ url: string }>("/upload", file);
      setLogoUrl(result.url);
      toast.success("Logo uploaded");
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!siteName.trim()) {
      toast.error("Site name is required");
      return;
    }
    setSaving(true);
    const ok = await updateBranding({
      siteName,
      tagline,
      metaDescription,
      logoUrl,
      primaryColor: searchColor,
    });
    setSaving(false);
    if (ok) toast.success("Branding updated");
    else toast.error("Failed to update branding");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Branding</h3>
        <p className="text-sm text-muted-foreground">
          Customize how the Registrar Portal looks across the platform.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand-site-name">Site Name</Label>
            <Input
              id="brand-site-name"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Registrar Portal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-tagline">Tagline</Label>
            <Input
              id="brand-tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Nexus University Registrar Management System"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-meta">Meta Description</Label>
            <Textarea
              id="brand-meta"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Short description used for search engines"
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Site logo"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files?.[0])}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="gap-2"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {logoUrl ? "Replace Logo" : "Upload Logo"}
                </Button>
                {logoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setLogoUrl("")}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-color">Primary Color</Label>
            <div className="flex items-center gap-3">
              <input
                id="brand-color"
                type="color"
                value={searchColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded border bg-transparent p-1"
              />
              <Input
                value={searchColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="max-w-[140px] font-mono"
              />
              <div
                className="h-10 flex-1 rounded border"
                style={{ backgroundColor: searchColor }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Applied across the sidebar, buttons, links and highlights.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          ) : (
            "Save Branding"
          )}
        </Button>
      </div>
    </div>
  );
}