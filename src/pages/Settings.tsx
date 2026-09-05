import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  User,
  Bell,
  Shield,
  FileText,
  Database,
  Mail,
  Palette,
  ArrowLeft,
  GraduationCap,
  Settings as SettingsIcon,
  ChevronRight,
} from "lucide-react";
import UniversityServicesSection from "./settings/UniversityServicesSection";
import BrandingSection from "@/components/settings/BrandingSection";
import ProfileSection from "@/components/settings/ProfileSection";
import NotificationsSection from "@/components/settings/NotificationsSection";
import SecuritySection from "@/components/settings/SecuritySection";
import EvaluationsSection from "@/components/settings/EvaluationsSection";
import DatabaseSection from "@/components/settings/DatabaseSection";
import EmailTemplatesSection from "@/components/settings/EmailTemplatesSection";
import { useBranding } from "@/hooks/useBranding";
import { cn } from "@/lib/utils";

interface SettingsSection {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

const SECTIONS: SettingsSection[] = [
  {
    id: "branding",
    name: "Branding",
    description: "Logo, colors and site identity",
    icon: Palette,
  },
  {
    id: "profile",
    name: "Profile",
    description: "Your registrar account details",
    icon: User,
  },
  {
    id: "notifications",
    name: "Notifications",
    description: "Alert preferences per activity",
    icon: Bell,
  },
  {
    id: "security",
    name: "Security",
    description: "Password and active sessions",
    icon: Shield,
  },
  {
    id: "evaluations",
    name: "Evaluations",
    description: "Course evaluation surveys",
    icon: FileText,
  },
  {
    id: "services",
    name: "University Services",
    description: "Service catalog, requests and offices",
    icon: GraduationCap,
  },
  {
    id: "database",
    name: "Database",
    description: "Storage statistics and maintenance",
    icon: Database,
  },
  {
    id: "email",
    name: "Email Templates",
    description: "Transactional email content",
    icon: Mail,
  },
];

export default function SettingsPage() {
  const { branding, updateBranding } = useBranding();
  const navigate = useNavigate();

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [active, setActive] = useState("branding");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );
    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    setActive(id);
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const activeSection = SECTIONS.find((s) => s.id === active);

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col border-r bg-card lg:flex">
        <div className="flex items-center gap-3 border-b p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <SettingsIcon size={18} />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">
              {branding.siteName || "Settings"}
            </div>
            <div className="text-xs text-muted-foreground">
              System configuration
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {SECTIONS.map((section) => {
            const isActive = section.id === active;
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary/30 bg-primary/10 text-primary shadow-sm"
                    : "border-transparent hover:bg-muted hover:text-foreground",
                )}
              >
                <section.icon
                  size={18}
                  className={isActive ? "text-primary" : "text-muted-foreground"}
                />
                <span className="flex-1">
                  <span className="block">{section.name}</span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">
                    {section.description}
                  </span>
                </span>
                <ChevronRight
                  size={16}
                  className={cn(
                    "shrink-0 transition-all",
                    isActive
                      ? "translate-x-0 text-primary"
                      : "-translate-x-1 opacity-0",
                  )}
                />
              </button>
            );
          })}
        </nav>

        <div className="border-t p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </div>
      </aside>

      {/* Mobile tab strip */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex gap-1.5 overflow-x-auto border-b bg-card p-2 lg:hidden">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium",
                section.id === active
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <section.icon size={14} />
              {section.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
            <header className="rounded-xl border bg-card p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <SettingsIcon size={16} />
                    Settings
                  </div>
                  <h1 className="mt-1 text-2xl font-bold">
                    {activeSection?.name}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activeSection?.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                  className="gap-2 lg:hidden"
                >
                  <ArrowLeft size={16} />
                  Dashboard
                </Button>
              </div>
            </header>

            <section
              id="branding"
              ref={(el) => {
                sectionRefs.current.branding = el;
              }}
            >
              <Card className="p-6 md:p-8">
                <BrandingSection
                  branding={branding}
                  updateBranding={updateBranding}
                />
              </Card>
            </section>

            <section
              id="profile"
              ref={(el) => {
                sectionRefs.current.profile = el;
              }}
            >
              <Card className="p-6 md:p-8">
                <ProfileSection />
              </Card>
            </section>

            <section
              id="notifications"
              ref={(el) => {
                sectionRefs.current.notifications = el;
              }}
            >
              <Card className="p-6 md:p-8">
                <NotificationsSection />
              </Card>
            </section>

            <section
              id="security"
              ref={(el) => {
                sectionRefs.current.security = el;
              }}
            >
              <Card className="p-6 md:p-8">
                <SecuritySection />
              </Card>
            </section>

            <section
              id="evaluations"
              ref={(el) => {
                sectionRefs.current.evaluations = el;
              }}
            >
              <Card className="p-6 md:p-8">
                <EvaluationsSection />
              </Card>
            </section>

            <section
              id="services"
              ref={(el) => {
                sectionRefs.current.services = el;
              }}
            >
              <Card className="p-6 md:p-8">
                <UniversityServicesSection />
              </Card>
            </section>

            <section
              id="database"
              ref={(el) => {
                sectionRefs.current.database = el;
              }}
            >
              <Card className="p-6 md:p-8">
                <DatabaseSection />
              </Card>
            </section>

            <section
              id="email"
              ref={(el) => {
                sectionRefs.current.email = el;
              }}
            >
              <Card className="p-6 md:p-8">
                <EmailTemplatesSection />
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}