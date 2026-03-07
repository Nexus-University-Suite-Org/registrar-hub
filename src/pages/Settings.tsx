import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Database,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { auth } from "@/lib/firebase";

const settingsSections = [
  { id: "profile", name: "Profile", icon: User },
  { id: "notifications", name: "Notifications", icon: Bell },
  { id: "security", name: "Security", icon: Shield },
  { id: "database", name: "Database", icon: Database },
  { id: "email", name: "Email Templates", icon: Mail },
];

export default function Settings() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("profile");
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const securityRef = useRef<HTMLDivElement>(null);
  const databaseRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);

  const sectionRefs: Record<string, React.RefObject<HTMLDivElement | null>> = {
    profile: profileRef,
    notifications: notificationsRef,
    security: securityRef,
    database: databaseRef,
    email: emailRef,
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    // Use setTimeout to ensure state update and re-render complete before scrolling
    setTimeout(() => {
      const el = sectionRefs[sectionId]?.current;
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }, 50);
  };

  useEffect(() => {
    const checkAuth = () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

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
                  onClick={() => scrollToSection(section.id)}
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
            {/* Profile Section */}
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

            {/* Notifications Section */}
            <div ref={notificationsRef} className="rounded-xl border border-border bg-card p-6 scroll-mt-24" data-section="notifications">
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

            {/* Security Section */}
            <div ref={securityRef} className="rounded-xl border border-border bg-card p-6 scroll-mt-24" data-section="security">
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

            {/* Database Section */}
            <div ref={databaseRef} className="rounded-xl border border-border bg-card p-6 scroll-mt-24" data-section="database">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Database</h2>
                  <p className="text-sm text-muted-foreground">
                    Database configuration and backups
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <Button variant="outline">Export Database</Button>
                <Button variant="outline">Run Backup</Button>
              </div>
            </div>

            {/* Email Templates Section */}
            <div ref={emailRef} className="rounded-xl border border-border bg-card p-6 scroll-mt-24" data-section="email">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Email Templates</h2>
                  <p className="text-sm text-muted-foreground">
                    Customize email notifications sent to users
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Manage templates for enrollment confirmations, password resets, and other notifications.
                </p>
                <Button variant="outline">Manage Templates</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
