import { useEffect, useState } from "react";
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
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  const [viewingReport, setViewingReport] = useState<string | null>(null);
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);
  const [isExportingAll, setIsExportingAll] = useState(false);

  const handleViewReport = (reportName: string) => {
    setViewingReport(reportName);
  };

  const handleDownloadReport = async (reportName: string) => {
    setDownloadingReport(reportName);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      toast.success(`${reportName} downloaded successfully.`);
    } catch {
      toast.error(`Failed to download ${reportName}.`);
    } finally {
      setDownloadingReport(null);
    }
  };

  const handleExportAllReports = async () => {
    setIsExportingAll(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("All reports exported successfully.");
    } catch {
      toast.error("Failed to export all reports.");
    } finally {
      setIsExportingAll(false);
    }
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Reports
            </h1>
            <p className="mt-1 text-muted-foreground">
              Generate and view analytical reports
            </p>
          </div>
          <Button onClick={handleExportAllReports} disabled={isExportingAll}>
            <Download className="h-5 w-5 mr-2" />
            {isExportingAll ? "Exporting..." : "Export All Reports"}
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewReport(report.name);
                      }}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadReport(report.name);
                      }}
                      disabled={downloadingReport === report.name}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {downloadingReport === report.name ? "Downloading..." : "Download"}
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

        {/* View Report Dialog */}
        <Dialog open={!!viewingReport} onOpenChange={() => setViewingReport(null)}>
          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {viewingReport}
              </DialogTitle>
              <DialogDescription>
                Report preview. Connect to your database to load live data.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-border bg-muted/50 p-6">
                <div className="flex items-center justify-center gap-3 text-muted-foreground mb-4">
                  <BarChart3 className="h-8 w-8" />
                  <span className="font-medium">Sample data for {viewingReport}</span>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  This report would show {viewingReport?.toLowerCase()} data once connected to your backend.
                </p>
              </div>
              <Button
                onClick={() => {
                  if (viewingReport) handleDownloadReport(viewingReport);
                  setViewingReport(null);
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download this report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
