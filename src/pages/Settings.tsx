import { FormEvent, useEffect, useRef, useState } from "react";
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
import { toast } from "sonner";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [isProcessingDatabase, setIsProcessingDatabase] = useState(false);

  const [isManagingTemplates, setIsManagingTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("enrollment");
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");

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

  const handleChangePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
      toast.error("No authenticated user found.");
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast.success("Password updated successfully.");
      setIsChangePasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      console.error("Error updating password:", err);
      toast.error(err?.message || "Failed to update password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleExportDatabase = async () => {
    try {
      setIsProcessingDatabase(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(
        "Database export started. Connect your backend to generate the actual export file.",
      );
    } catch (err: any) {
      console.error("Database export error:", err);
      toast.error("Failed to start database export.");
    } finally {
      setIsProcessingDatabase(false);
    }
  };

  const handleRunBackup = async () => {
    try {
      setIsProcessingDatabase(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success(
        "Database backup started. Connect your backend to run the actual backup.",
      );
    } catch (err: any) {
      console.error("Database backup error:", err);
      toast.error("Failed to start database backup.");
    } finally {
      setIsProcessingDatabase(false);
    }
  };

  const handleSaveTemplate = (e: FormEvent) => {
    e.preventDefault();
    // In a full implementation, you'd persist these values to your backend.
    toast.success("Template settings saved. (Demo only, not persisted.)");
    setIsManagingTemplates(false);
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
        <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm pb-4">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Settings
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your account and system preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 self-start">
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
            <div
              ref={profileRef}
              className="rounded-xl border border-border bg-card p-6 scroll-mt-24"
              data-section="profile"
            >
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
                <Button
                  variant="outline"
                  onClick={() => setIsChangePasswordOpen(true)}
                >
                  Change Password
                </Button>
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
                <Button
                  variant="outline"
                  onClick={handleExportDatabase}
                  disabled={isProcessingDatabase}
                >
                  {isProcessingDatabase ? "Exporting..." : "Export Database"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRunBackup}
                  disabled={isProcessingDatabase}
                >
                  {isProcessingDatabase ? "Running..." : "Run Backup"}
                </Button>
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
                <Button
                  variant="outline"
                  onClick={() => setIsManagingTemplates(true)}
                >
                  Manage Templates
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Modals */}
        <Dialog
          open={isChangePasswordOpen}
          onOpenChange={setIsChangePasswordOpen}
        >
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Update your account password. You will need to enter your
                current password for security.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={handleChangePasswordSubmit}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm new password</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsChangePasswordOpen(false)}
                  disabled={isUpdatingPassword}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdatingPassword}>
                  {isUpdatingPassword ? "Updating..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isManagingTemplates}
          onOpenChange={setIsManagingTemplates}
        >
          <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage Email Templates</DialogTitle>
              <DialogDescription>
                Configure the content used for system emails.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="templateType">Template</Label>
                <select
                  id="templateType"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  <option value="enrollment">Enrollment confirmation</option>
                  <option value="password-reset">Password reset</option>
                  <option value="notification">General notification</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="templateSubject">Subject</Label>
                <Input
                  id="templateSubject"
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  placeholder="Subject line"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="templateBody">Body</Label>
                <textarea
                  id="templateBody"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[140px]"
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  placeholder="Write the email content..."
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsManagingTemplates(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
