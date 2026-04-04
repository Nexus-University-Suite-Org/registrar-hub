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
  PieChart,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

interface EnrollmentStats {
  totalStudents: number;
  byDepartment: { [key: string]: number };
  byProgram: { [key: string]: number };
  byYear: { [key: string]: number };
  byStatus: { [key: string]: number };
  departmentBreakdown: Array<{
    department: string;
    total: number;
    programs: Array<{
      program: string;
      count: number;
      years: { [key: number]: number };
    }>;
  }>;
}

interface EnrollmentData {
  stats: EnrollmentStats;
  students: Array<{
    id: string;
    student_number: string;
    first_name: string;
    last_name: string;
    department: string;
    program: string;
    year_of_study: number;
    status: string;
    admission_date: string;
  }>;
}

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
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(null);
  const [loadingEnrollment, setLoadingEnrollment] = useState(false);

  const handleViewReport = async (reportName: string) => {
    if (reportName === "Enrollment Report") {
      await fetchEnrollmentData();
    }
    setViewingReport(reportName);
  };

  const fetchEnrollmentData = async () => {
    try {
      setLoadingEnrollment(true);

      // Fetch all students from profiles collection
      const studentsQuery = query(
        collection(db, "profiles"),
        where("role", "==", "student")
      );

      const querySnapshot = await getDocs(studentsQuery);
      const students = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          student_number: data.student_number || data.studentNumber || "",
          first_name: data.full_name?.split(" ")[0] || data.firstName || "",
          last_name: data.full_name?.split(" ").slice(1).join(" ") || data.lastName || "",
          department: data.department || "Not Assigned",
          program: data.program || "Not Assigned",
          year_of_study: data.year_of_study || data.yearOfStudy || 1,
          status: data.status || "Active",
          admission_date: data.admission_date || data.admissionDate || "",
        };
      });

      // Calculate statistics
      const stats: EnrollmentStats = {
        totalStudents: students.length,
        byDepartment: {},
        byProgram: {},
        byYear: {},
        byStatus: {},
        departmentBreakdown: [],
      };

      // Group by department, program, year, and status
      students.forEach((student) => {
        // Department stats
        stats.byDepartment[student.department] = (stats.byDepartment[student.department] || 0) + 1;

        // Program stats
        stats.byProgram[student.program] = (stats.byProgram[student.program] || 0) + 1;

        // Year stats
        stats.byYear[student.year_of_study] = (stats.byYear[student.year_of_study] || 0) + 1;

        // Status stats
        stats.byStatus[student.status] = (stats.byStatus[student.status] || 0) + 1;
      });

      // Create department breakdown with programs and years
      const departmentMap = new Map<string, Map<string, Map<number, number>>>();

      students.forEach((student) => {
        if (!departmentMap.has(student.department)) {
          departmentMap.set(student.department, new Map());
        }
        const programMap = departmentMap.get(student.department)!;

        if (!programMap.has(student.program)) {
          programMap.set(student.program, new Map());
        }
        const yearMap = programMap.get(student.program)!;

        yearMap.set(student.year_of_study, (yearMap.get(student.year_of_study) || 0) + 1);
      });

      stats.departmentBreakdown = Array.from(departmentMap.entries()).map(([department, programMap]) => ({
        department,
        total: Array.from(programMap.values()).reduce((sum, yearMap) =>
          sum + Array.from(yearMap.values()).reduce((yearSum, count) => yearSum + count, 0), 0),
        programs: Array.from(programMap.entries()).map(([program, yearMap]) => ({
          program,
          count: Array.from(yearMap.values()).reduce((sum, count) => sum + count, 0),
          years: Object.fromEntries(yearMap.entries()),
        })),
      }));

      setEnrollmentData({ stats, students });
    } catch (error) {
      console.error("Error fetching enrollment data:", error);
      toast.error("Failed to load enrollment data");
    } finally {
      setLoadingEnrollment(false);
    }
  };

  const handleDownloadReport = async (reportName: string) => {
    setDownloadingReport(reportName);
    try {
      if (reportName === "Enrollment Report" && enrollmentData) {
        // Generate CSV content
        const csvHeaders = [
          "Student Number",
          "First Name",
          "Last Name",
          "Department",
          "Program",
          "Year of Study",
          "Status",
          "Admission Date"
        ];

        const csvRows = enrollmentData.students.map(student => [
          student.student_number,
          student.first_name,
          student.last_name,
          student.department,
          student.program,
          student.year_of_study.toString(),
          student.status,
          student.admission_date
        ]);

        // Add summary data at the top
        const summaryRows = [
          ["Enrollment Report Summary"],
          ["Generated on", new Date().toLocaleDateString()],
          [""],
          ["Total Students", enrollmentData.stats.totalStudents.toString()],
          ["Departments", Object.keys(enrollmentData.stats.byDepartment).length.toString()],
          ["Programs", Object.keys(enrollmentData.stats.byProgram).length.toString()],
          [""],
          ["Department Breakdown"],
          ...Object.entries(enrollmentData.stats.byDepartment).map(([dept, count]) => [dept, count.toString()]),
          [""],
          ["Program Breakdown"],
          ...Object.entries(enrollmentData.stats.byProgram).map(([prog, count]) => [prog, count.toString()]),
          [""],
          ["Year Distribution"],
          ...Object.entries(enrollmentData.stats.byYear).map(([year, count]) => [`Year ${year}`, count.toString()]),
          [""],
          ["Status Distribution"],
          ...Object.entries(enrollmentData.stats.byStatus).map(([status, count]) => [status, count.toString()]),
          [""],
          ["Student Details"],
          csvHeaders,
          ...csvRows.map(row => row.map(cell => `"${cell}"`))
        ];

        // Convert to CSV
        const csvContent = summaryRows.map(row =>
          row.map(cell => cell.toString().replace(/"/g, '""')).join(",")
        ).join("\n");

        // Create and download file
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `enrollment_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("Enrollment report downloaded successfully");
      } else {
        // Mock download for other reports
        await new Promise((resolve) => setTimeout(resolve, 1200));
        toast.success(`${reportName} downloaded successfully.`);
      }
    } catch (error) {
      console.error("Error downloading report:", error);
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
          <DialogContent className="w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {viewingReport}
              </DialogTitle>
              <DialogDescription>
                {viewingReport === "Enrollment Report"
                  ? "Comprehensive overview of student enrollment statistics"
                  : "Report preview. Connect to your database to load live data."}
              </DialogDescription>
            </DialogHeader>

            {viewingReport === "Enrollment Report" ? (
              <div className="space-y-6">
                {loadingEnrollment ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading enrollment data...</p>
                    </div>
                  </div>
                ) : enrollmentData ? (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Students
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{enrollmentData.stats.totalStudents}</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Departments
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{Object.keys(enrollmentData.stats.byDepartment).length}</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Programs
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{Object.keys(enrollmentData.stats.byProgram).length}</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Students
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{enrollmentData.stats.byStatus.Active || 0}</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Department Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Enrollment by Department</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Department</TableHead>
                              <TableHead>Total Students</TableHead>
                              <TableHead>Programs</TableHead>
                              <TableHead>Year Distribution</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {enrollmentData.stats.departmentBreakdown.map((dept) => (
                              <TableRow key={dept.department}>
                                <TableCell className="font-medium">{dept.department}</TableCell>
                                <TableCell>{dept.total}</TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    {dept.programs.map((prog) => (
                                      <div key={prog.program} className="text-sm">
                                        {prog.program}: {prog.count}
                                      </div>
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    {dept.programs.map((prog) => (
                                      <div key={prog.program} className="text-xs text-muted-foreground">
                                        {Object.entries(prog.years).map(([year, count]) => (
                                          <span key={year} className="mr-2">
                                            Y{year}: {count}
                                          </span>
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    {/* Student List */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Student Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Student Number</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Department</TableHead>
                              <TableHead>Program</TableHead>
                              <TableHead>Year</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {enrollmentData.students.slice(0, 50).map((student) => (
                              <TableRow key={student.id}>
                                <TableCell className="font-mono text-sm">{student.student_number}</TableCell>
                                <TableCell>{student.first_name} {student.last_name}</TableCell>
                                <TableCell>{student.department}</TableCell>
                                <TableCell>{student.program}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">Year {student.year_of_study}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={student.status === "Active" ? "default" : "secondary"}
                                  >
                                    {student.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                        {enrollmentData.students.length > 50 && (
                          <p className="text-sm text-muted-foreground mt-4 text-center">
                            Showing first 50 students. Download the full report for complete data.
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setViewingReport(null)}>
                        Close
                      </Button>
                      <Button onClick={() => handleDownloadReport("Enrollment Report")}>
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Failed to load enrollment data</p>
                  </div>
                )}
              </div>
            ) : (
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
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
