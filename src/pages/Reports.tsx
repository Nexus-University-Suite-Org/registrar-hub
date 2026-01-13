import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const reportTypes = [
  {
    name: "Enrollment Report",
    description: "Overview of student enrollment by department and program",
    icon: Users,
  },
  {
    name: "Academic Performance",
    description: "Student performance metrics and GPA distributions",
    icon: TrendingUp,
  },
  {
    name: "Graduation Statistics",
    description: "Graduation rates and completion timelines",
    icon: Calendar,
  },
  {
    name: "Department Summary",
    description: "Detailed breakdown by academic department",
    icon: FileSpreadsheet,
  },
];

export default function Reports() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Reports
            </h1>
            <p className="mt-1 text-muted-foreground">
              Generate and view analytical reports
            </p>
          </div>
          <Button>
            <Download className="h-5 w-5 mr-2" />
            Export All Reports
          </Button>
        </div>

        {/* Report Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTypes.map((report) => (
            <div
              key={report.name}
              className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/20 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <report.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {report.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {report.description}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                    <Button size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Placeholder */}
        <div className="rounded-xl border border-border bg-card p-8">
          <h2 className="font-display text-xl font-semibold text-foreground mb-6">
            Enrollment Overview
          </h2>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              Charts and analytics will appear here
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Connect to the database to view real-time data
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
