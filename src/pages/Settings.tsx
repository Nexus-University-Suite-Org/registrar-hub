import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Bell,
  Shield,
  FileText,
  Database,
  Mail,
  Palette,
  ArrowLeft
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { useBranding } from "@/hooks/useBranding";
import { updateExistingStudents } from "@/lib/studentMigration";
import { toast } from "sonner";

export default function SettingsPage() {
  const { branding } = useBranding();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("profile");

  const sectionRefs = {
    branding: useRef<HTMLDivElement>(null),
    profile: useRef<HTMLDivElement>(null),
    notifications: useRef<HTMLDivElement>(null),
    security: useRef<HTMLDivElement>(null),
    evaluations: useRef<HTMLDivElement>(null),
    database: useRef<HTMLDivElement>(null),
    email: useRef<HTMLDivElement>(null),
  };

  const scrollToSection = (section: string) => {
    sectionRefs[section as keyof typeof sectionRefs].current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const settingsSections = [
    { id: "branding", name: "Branding", icon: Palette },
    { id: "profile", name: "Profile", icon: User },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
    { id: "evaluations", name: "Evaluations", icon: FileText },
    { id: "database", name: "Database", icon: Database },
    { id: "email", name: "Email Templates", icon: Mail },
  ];

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 h-screen border-r p-4 space-y-2">
        {settingsSections.map((section) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="flex items-center gap-2 w-full p-2 rounded hover:bg-gray-100"
          >
            <section.icon size={18} />
            {section.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-20 overflow-y-auto h-screen">

        {/* Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 hover:bg-gray-100"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </div>

        {/* Branding */}
        <div ref={sectionRefs.branding}>
          <h2 className="text-xl font-bold mb-4">Branding</h2>
          <p>Primary Color: {branding?.primaryColor}</p>
        </div>

        {/* Profile */}
        <div ref={sectionRefs.profile}>
          <h2 className="text-xl font-bold mb-4">Profile</h2>
          <Input placeholder="First Name" />
          <Input placeholder="Last Name" className="mt-2" />
          <Button className="mt-3">Save</Button>
        </div>

        {/* Notifications */}
        <div ref={sectionRefs.notifications}>
          <h2 className="text-xl font-bold mb-4">Notifications</h2>
          <p>Notification settings go here</p>
        </div>

        {/* Security */}
        <div ref={sectionRefs.security}>
          <h2 className="text-xl font-bold mb-4">Security</h2>
          <Input type="password" placeholder="New Password" />
          <Button className="mt-3">Update Password</Button>
        </div>

        {/* Evaluations */}
        <div ref={sectionRefs.evaluations}>
          <h2 className="text-xl font-bold mb-4">Evaluations</h2>
          <p>Evaluation settings</p>
        </div>

        {/* Database */}
        <div ref={sectionRefs.database}>
          <h2 className="text-xl font-bold mb-4">Database</h2>
          <p className="mb-4">Database management tools</p>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Student Data Migration</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Update existing students that may be missing department and program information.
                This will set default values for students created before these fields were added.
              </p>
              <Button
                onClick={async () => {
                  try {
                    const updatedCount = await updateExistingStudents();
                    toast.success(`Successfully updated ${updatedCount} students with missing data`);
                  } catch (error) {
                    console.error("Migration failed:", error);
                    toast.error("Failed to update student data");
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Run Student Migration
              </Button>
            </div>
          </div>
        </div>

        {/* Email Templates */}
        <div ref={sectionRefs.email}>
          <h2 className="text-xl font-bold mb-4">Email Templates</h2>
          <p>Manage system emails</p>
        </div>

      </div>
    </div>
  );
}