import { FormEvent, useEffect, useRef, useState } from "react";
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
  Palette
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { useBranding } from "@/hooks/useBranding";

export default function SettingsPage() {
  const { branding } = useBranding();

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
          <p>Database management tools</p>
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