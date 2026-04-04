import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Database,
  Mail,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { auth } from "@/lib/firebase";
import { useBranding } from "@/hooks/useBranding";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const settingsSections = [
  { id: "branding", name: "Branding", icon: Palette },
  { id: "profile", name: "Profile", icon: User },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "security", name: "Security", icon: Shield },
  { id: "database", name: "Database", icon: Database },
  { id: "email", name: "Email Templates", icon: Mail },
];

export default function Settings() {
  const navigate = useNavigate();
  const { branding, updateBranding } = useBranding();
  const [activeSection, setActiveSection] = useState("branding");
  const [brandingForm, setBrandingForm] = useState({
    siteName: branding.siteName,
    metaDescription: branding.metaDescription,
    primaryColor: branding.primaryColor,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    setBrandingForm({
      siteName: branding.siteName,
      metaDescription: branding.metaDescription,
      primaryColor: branding.primaryColor,
    });
  }, [branding]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Settings
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your account and system preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <section.icon className="h-5 w-5" />
                  {section.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Branding Section */}
            {activeSection === "branding" && (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                    <Palette className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      Branding Settings
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Customize the appearance and branding of your portal
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={brandingForm.siteName}
                        onChange={(e) =>
                          setBrandingForm((prev) => ({
                            ...prev,
                            siteName: e.target.value,
                          }))
                        }
                        placeholder="My University Portal"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <Input
                        id="primaryColor"
                        type="color"
                        value={brandingForm.primaryColor}
                        onChange={(e) =>
                          setBrandingForm((prev) => ({
                            ...prev,
                            primaryColor: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Input
                      id="metaDescription"
                      value={brandingForm.metaDescription}
                      onChange={(e) =>
                        setBrandingForm((prev) => ({
                          ...prev,
                          metaDescription: e.target.value,
                        }))
                      }
                      placeholder="Manage your student records..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo</Label>
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    />
                    {branding.logoUrl && (
                      <div className="mt-2">
                        <img
                          src={branding.logoUrl}
                          alt="Current logo"
                          className="h-12 w-12 object-contain border rounded"
                        />
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={async () => {
                      setUploading(true);
                      let logoUrl = branding.logoUrl;
                      if (logoFile) {
                        const storage = getStorage();
                        const logoRef = ref(
                          storage,
                          `logos/${Date.now()}_${logoFile.name}`,
                        );
                        await uploadBytes(logoRef, logoFile);
                        logoUrl = await getDownloadURL(logoRef);
                      }
                      const success = await updateBranding({
                        ...brandingForm,
                        logoUrl,
                      });
                      if (success) {
                        setBrandingForm({
                          siteName: branding.siteName,
                          metaDescription: branding.metaDescription,
                          primaryColor: branding.primaryColor,
                        });
                        setLogoFile(null);
                      }
                      setUploading(false);
                    }}
                    disabled={uploading}
                  >
                    {uploading ? "Saving..." : "Save Branding Settings"}
                  </Button>
                </div>
              </div>
            )}

            {/* Profile Section */}
            {activeSection === "profile" && (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      Profile Settings
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Update your personal information
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@registrar.com"
                    />
                  </div>
                  <Button>Save Changes</Button>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === "notifications" && (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      Notification Preferences
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Configure how you receive notifications
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      label: "Email notifications for new enrollments",
                      checked: true,
                    },
                    {
                      label: "Email notifications for status changes",
                      checked: true,
                    },
                    { label: "Weekly summary reports", checked: false },
                    { label: "System maintenance alerts", checked: true },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-sm text-foreground">
                        {item.label}
                      </span>
                      <Switch defaultChecked={item.checked} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === "security" && (
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">Security</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your account security
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button variant="outline">Change Password</Button>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Two-Factor Authentication
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
