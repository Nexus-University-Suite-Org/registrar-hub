import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useBranding } from "@/hooks/useBranding";
import {
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  UserMinus,
  FileText,
  BarChart3,
  Settings,
  Calendar,
  Bell,
  Activity,
  Award,
  BookOpen,
  ClipboardList,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
const allTools = [
  {
    name: "Manage Students",
    href: "/students",
    icon: Users,
    description:
      "View and manage student records, enrollment, and academic information",
    color: "from-primary to-orange-400",
    category: "Student Management",
  },
  {
    name: "Manage Lecturers",
    href: "/lecturers",
    icon: UserCheck,
    description:
      "Handle lecturer profiles, assignments, and course allocations",
    color: "from-green-500 to-emerald-500",
    category: "Academic Staff",
  },
  {
    name: "Course Management",
    href: "/courses",
    icon: BookOpen,
    description:
      "Create and manage course offerings, prerequisites, and curriculum",
    color: "from-blue-500 to-cyan-500",
    category: "Academic Management",
  },
  {
    name: "View Transcripts",
    href: "/transcripts",
    icon: FileText,
    description: "Access and generate student academic transcripts and records",
    color: "from-amber-500 to-orange-500",
    category: "Academic Records",
  },
  {
    name: "Generate Reports",
    href: "/reports",
    icon: BarChart3,
    description:
      "Create comprehensive reports on enrollment, performance, and analytics",
    color: "from-orange-500 to-red-400",
    category: "Analytics & Reporting",
  },
  {
    name: "Results Management",
    href: "/results",
    icon: Award,
    description:
      "Manage examination results, grades, and academic performance tracking",
    color: "from-purple-500 to-indigo-500",
    category: "Assessment",
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: Calendar,
    description:
      "View academic calendar, important dates, and schedule management",
    color: "from-pink-500 to-rose-500",
    category: "Scheduling",
  },
  {
    name: "Notifications",
    href: "/notifications",
    icon: Bell,
    description:
      "Manage system notifications, alerts, and communication preferences",
    color: "from-yellow-500 to-orange-500",
    category: "Communication",
  },
  {
    name: "System Settings",
    href: "/settings",
    icon: Settings,
    description:
      "Configure system preferences, user permissions, and administrative settings",
    color: "from-red-400 to-primary",
    category: "Administration",
  },
];

const categories = [...new Set(allTools.map((tool) => tool.category))];

export default function Tools() {
  const navigate = useNavigate();
  const { branding } = useBranding();

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      navigate("/");
      return;
    }
  }, [navigate]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-accent/20 border border-border/50 p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="animate-slide-up">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                  <Activity className="h-4 w-4" />
                  All Tools
                </div>
                <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-2">
                  {branding.siteName} Tools & Features
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  Access all available tools and features in the registrar
                  portal. Everything you need to manage academic operations
                  efficiently.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tools by Category */}
        {categories.map((category, categoryIndex) => (
          <div key={category} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-primary rounded-full"></div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                {category}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTools
                .filter((tool) => tool.category === category)
                .map((tool, index) => (
                  <button
                    key={tool.name}
                    onClick={() => navigate(tool.href)}
                    className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 text-left transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 hover:border-primary/30 animate-scale-in opacity-0"
                    style={{
                      animationDelay: `${(categoryIndex * 3 + index) * 0.1}s`,
                    }}
                  >
                    {/* Enhanced gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Decorative elements */}
                    <div
                      className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 rounded-full blur-2xl transition-opacity duration-500`}
                    />

                    <div className="relative flex items-start justify-between mb-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tool.color} shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}
                      >
                        <tool.icon className="h-6 w-6 text-white" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-primary" />
                    </div>

                    <div className="relative space-y-2">
                      <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}

        {/* Quick Stats */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-accent/20 border border-border/50 p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-400 shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  System Overview
                </h2>
                <p className="text-muted-foreground">
                  Quick access to key system information
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors">
                <p className="text-2xl font-bold text-primary mb-1">
                  {allTools.length}
                </p>
                <p className="text-sm text-primary/80 font-medium">
                  Available Tools
                </p>
              </div>
              <div className="text-center p-4 rounded-xl bg-success/10 border border-success/20 hover:bg-success/15 transition-colors">
                <p className="text-2xl font-bold text-success mb-1">
                  {categories.length}
                </p>
                <p className="text-sm text-success/80 font-medium">
                  Categories
                </p>
              </div>
              <div className="text-center p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/15 transition-colors">
                <p className="text-2xl font-bold text-orange-500 mb-1">24/7</p>
                <p className="text-sm text-orange-500/80 font-medium">Access</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/15 transition-colors">
                <p className="text-2xl font-bold text-purple-500 mb-1">100%</p>
                <p className="text-sm text-purple-500/80 font-medium">
                  Integrated
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
