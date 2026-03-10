import { useEffect, useState, useMemo } from "react";
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
import { auth, db } from "@/lib/firebase";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const reportTypes = [
  {
    name: "Enrollment Report",
    description: "Overview of student enrollment by department and program",
    icon: Users,
    chartType: "bar",
    dataKey: "enrollment"
  },
  {
    name: "Academic Performance",
    description: "Student performance metrics and GPA distributions",
    icon: TrendingUp,
    chartType: "pie",
    dataKey: "performance"
  },
  {
    name: "Graduation Statistics",
    description: "Graduation rates and completion timelines",
    icon: Calendar,
    chartType: "bar",
    dataKey: "graduation"
  },
  {
    name: "Department Summary",
    description: "Detailed breakdown by academic department",
    icon: FileSpreadsheet,
    chartType: "bar",
    dataKey: "department"
  },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Reports() {
  const navigate = useNavigate();
  const [viewingReport, setViewingReport] = useState<string | null>(null);
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);
  const [isExportingAll, setIsExportingAll] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/");
        return;
      }
      fetchData();
    };
    checkAuth();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch students
      let studentsData: any[] = [];
      try {
        const profilesSnap = await getDocs(
          query(collection(db, "profiles"), where("role", "==", "student"))
        );
        studentsData = profilesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch {
        const studentsSnap = await getDocs(collection(db, "students"));
        studentsData = studentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      setStudents(studentsData);

      // Fetch grades
      const gradesSnap = await getDocs(collection(db, "student_grades"));
      const gradesData = gradesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setGrades(gradesData);

      // Fetch courses (to map credits and calculate realistic CGPA if needed)
      const coursesSnap = await getDocs(collection(db, "courses"));
      const courseUnitsSnap = await getDocs(collection(db, "course_units"));
      const coursesData = [
        ...coursesSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        ...courseUnitsSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      ];
      setCourses(coursesData);
      
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  // Memoized Report Data
  const reportData = useMemo(() => {
    // 1. Enrollment by Program
    const programCounts = students.reduce((acc, s) => {
      const prog = s.program || "Unknown Core";
      acc[prog] = (acc[prog] || 0) + 1;
      return acc;
    }, {});
    const enrollment = Object.keys(programCounts).map(k => ({ name: k, value: programCounts[k] }))
      .sort((a: any, b: any) => b.value - a.value);

    // 2. Academic Performance (CGPA bands)
    const cgpas = students.map(student => {
      const studentGrades = grades.filter(g => g.student_id === student.id);
      let totalPoints = 0;
      let totalCredits = 0;
      studentGrades.forEach(g => {
        const c = courses.find(cr => cr.id === g.course_id);
        const credits = c?.credits ?? 3;
        totalPoints += (g.gp || 0) * credits;
        totalCredits += credits;
      });
      return totalCredits > 0 ? totalPoints / totalCredits : 0;
    });

    const bands: { [key: string]: number } = { "Excellent (4.5+)": 0, "Very Good (4.0-4.4)": 0, "Good (3.5-3.9)": 0, "Satisfactory (3.0-3.4)": 0, "Needs Improvement (<3.0)": 0 };
    cgpas.forEach(cgpa => {
      if (cgpa >= 4.5) bands["Excellent (4.5+)"]++;
      else if (cgpa >= 4.0) bands["Very Good (4.0-4.4)"]++;
      else if (cgpa >= 3.5) bands["Good (3.5-3.9)"]++;
      else if (cgpa >= 3.0) bands["Satisfactory (3.0-3.4)"]++;
      else if (cgpa > 0) bands["Needs Improvement (<3.0)"]++; // Only count if they have grades
    });
    const performance = Object.keys(bands).map(k => ({ name: k, value: bands[k] })).filter(b => b.value > 0);

    // 3. Graduation Statistics (By Year of Study)
    const yearCounts = students.reduce((acc, s) => {
      const yr = `Year ${s.year_of_study || s.yearOfStudy || 1}`;
      acc[yr] = (acc[yr] || 0) + 1;
      return acc;
    }, {});
    const graduation = Object.keys(yearCounts).map(k => ({ name: k, value: yearCounts[k] }))
      .sort((a: any, b: any) => a.name.localeCompare(b.name));

    // 4. Department Summary (Grouping programs roughly by "Department" if they contain keywords, otherwise just top programs)
    const departmentMap: Record<string, number> = {};
    students.forEach(s => {
      const p = (s.program || "").toLowerCase();
      let dept = "Other";
      if (p.includes("computer") || p.includes("software") || p.includes("it")) dept = "Computing & IT";
      else if (p.includes("business") || p.includes("accounting") || p.includes("finance")) dept = "Business School";
      else if (p.includes("engineer") || p.includes("civil") || p.includes("electrical")) dept = "Engineering";
      else if (p.includes("law") || p.includes("legal")) dept = "Law School";
      else if (p.includes("medicine") || p.includes("nursing") || p.includes("health")) dept = "Health Sciences";
      
      departmentMap[dept] = (departmentMap[dept] || 0) + 1;
    });
    const department = Object.keys(departmentMap).map(k => ({ name: k, value: departmentMap[k] }))
      .sort((a: any, b: any) => b.value - a.value);

    return { enrollment, performance, graduation, department };
  }, [students, grades, courses]);

  const generateCSVContent = (reportName: string) => {
    let reportConf = reportTypes.find(r => r.name === reportName);
    if (!reportConf) return "";
    
    const data = reportData[reportConf.dataKey as keyof typeof reportData];
    if (!data.length) return "Category,Count\nNo Data,0";

    const rows: string[] = ["Category,Count"];
    data.forEach((d: any) => {
      rows.push(`"${d.name}",${d.value}`);
    });
    return rows.join("\n");
  };

  const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadReport = async (reportName: string) => {
    setDownloadingReport(reportName);
    try {
      if (students.length === 0) throw new Error("No data available");
      const csvContent = generateCSVContent(reportName);
      downloadCSV(`${reportName.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
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
      if (students.length === 0) throw new Error("No data available");
      
      reportTypes.forEach((report, idx) => {
        setTimeout(() => {
          const csvContent = generateCSVContent(report.name);
          downloadCSV(`${report.name.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
        }, idx * 500); // Stagger downloads slightly
      });
      
      setTimeout(() => {
        toast.success("All reports exported successfully.");
        setIsExportingAll(false);
      }, reportTypes.length * 500);
      
    } catch {
      toast.error("Failed to export all reports.");
      setIsExportingAll(false);
    }
  };

  const renderChart = (dataKey: string, chartType: string) => {
    const data = reportData[dataKey as keyof typeof reportData];
    if (!data || data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center h-full">
           <BarChart3 className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
           <p className="text-muted-foreground">No data available for this report.</p>
        </div>
      );
    }

    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} students`, "Count"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            height={80} 
            interval={0}
            tick={{fontSize: 12}}
          />
          <YAxis allowDecimals={false} />
          <Tooltip cursor={{fill: 'transparent'}} formatter={(value) => [`${value} students`, "Count"]} />
          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
             {data.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const activeReportConfig = reportTypes.find(r => r.name === viewingReport);

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
              Generate and view analytical reports from real-time data
            </p>
          </div>
          <Button onClick={handleExportAllReports} disabled={isExportingAll || loading || students.length === 0}>
            <Download className="h-5 w-5 mr-2" />
            {isExportingAll ? "Exporting..." : "Export All (CSV)"}
          </Button>
        </div>

        {/* Report Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTypes.map((report) => (
            <div
              key={report.name}
              className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/20 cursor-pointer"
              onClick={() => setViewingReport(report.name)}
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
                        setViewingReport(report.name);
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
                      disabled={downloadingReport === report.name || loading || students.length === 0}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {downloadingReport === report.name ? "Downloading..." : "Export CSV"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Chart Overview */}
        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Enrollment Overview
            </h2>
          </div>
          <div className="w-full h-[350px]">
            {loading ? (
               <div className="flex flex-col items-center justify-center h-full">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                 <p className="text-muted-foreground">Loading school data...</p>
               </div>
            ) : (
               renderChart("enrollment", "bar")
            )}
          </div>
        </div>

        {/* View Report Dialog */}
        <Dialog open={!!viewingReport} onOpenChange={() => setViewingReport(null)}>
          <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {viewingReport}
              </DialogTitle>
              <DialogDescription>
                {activeReportConfig?.description}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-border bg-card p-4 sm:p-6 w-full h-[400px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  activeReportConfig && renderChart(activeReportConfig.dataKey, activeReportConfig.chartType)
                )}
              </div>
              <Button
                onClick={() => {
                  if (loading) return;
                  if (viewingReport) handleDownloadReport(viewingReport);
                  setViewingReport(null);
                }}
                disabled={loading || students.length === 0}
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
