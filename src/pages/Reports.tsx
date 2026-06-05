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
import { collection, getDocs, query, where } from "@/lib/firebase";

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

interface AcademicStats {
  totalStudentsWithGrades: number;
  gpaDistribution: { [key: string]: number };
  gradeDistribution: { [key: string]: number };
  averageGPA: number;
  topPerformers: Array<{
    studentId: string;
    studentNumber: string;
    name: string;
    cgpa: number;
    department: string;
    program: string;
  }>;
  atRiskStudents: Array<{
    studentId: string;
    studentNumber: string;
    name: string;
    cgpa: number;
    department: string;
    program: string;
  }>;
  departmentPerformance: Array<{
    department: string;
    averageGPA: number;
    studentCount: number;
    topGPA: number;
  }>;
  programPerformance: Array<{
    program: string;
    averageGPA: number;
    studentCount: number;
    department: string;
  }>;
}

interface AcademicData {
  stats: AcademicStats;
  studentGrades: Array<{
    studentId: string;
    studentNumber: string;
    name: string;
    department: string;
    program: string;
    cgpa: number;
    totalCredits: number;
    academicYear: string;
    semester: string;
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

interface DepartmentSummaryData {
  totalDepartments: number;
  totalStudents: number;
  totalPrograms: number;
  largestDepartment: {
    name: string;
    count: number;
  } | null;
  departments: Array<{
    department: string;
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    graduatedStudents: number;
    suspendedStudents: number;
    programs: Array<{
      program: string;
      count: number;
    }>;
    yearDistribution: { [key: string]: number };
    averageYear: number;
  }>;
}

interface StudentProfileRecord {
  id: string;
  student_number?: string;
  studentNumber?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  department?: string;
  program?: string;
}

interface CourseRecord {
  id: string;
  code?: string;
  name?: string;
  title?: string;
  credits?: number;
}

interface StudentGradeRecord {
  id: string;
  student_id?: string;
  course_id?: string;
  gp?: number;
  grade_point?: number;
  grade?: string;
  academic_year?: string;
  semester?: string | number;
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
  const [downloadingReport, setDownloadingReport] = useState<string | null>(
    null,
  );
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData | null>(
    null,
  );
  const [loadingEnrollment, setLoadingEnrollment] = useState(false);
  const [academicData, setAcademicData] = useState<AcademicData | null>(null);
  const [loadingAcademic, setLoadingAcademic] = useState(false);
  const [departmentSummaryData, setDepartmentSummaryData] =
    useState<DepartmentSummaryData | null>(null);
  const [loadingDepartmentSummary, setLoadingDepartmentSummary] =
    useState(false);

  const handleViewReport = async (reportName: string) => {
    if (reportName === "Enrollment Report") {
      await fetchEnrollmentData();
    } else if (reportName === "Academic Performance") {
      await fetchAcademicData();
    } else if (reportName === "Department Summary") {
      await fetchDepartmentSummaryData();
    }
    setViewingReport(reportName);
  };

  const fetchDepartmentSummaryData = async () => {
    try {
      setLoadingDepartmentSummary(true);

      const studentsQuery = query(
        collection(db, "profiles"),
        where("role", "==", "student"),
      );
      const snapshot = await getDocs(studentsQuery);

      const students = snapshot.docs.map((studentDoc) => {
        const data = studentDoc.data();
        return {
          department: data.department || "Not Assigned",
          program: data.program || "Not Assigned",
          year_of_study: Number(data.year_of_study || data.yearOfStudy || 1),
          status: data.status || "Active",
        };
      });

      const departmentMap = new Map<
        string,
        {
          totalStudents: number;
          activeStudents: number;
          inactiveStudents: number;
          graduatedStudents: number;
          suspendedStudents: number;
          programs: Map<string, number>;
          yearDistribution: Map<number, number>;
          yearTotal: number;
        }
      >();

      students.forEach((student) => {
        if (!departmentMap.has(student.department)) {
          departmentMap.set(student.department, {
            totalStudents: 0,
            activeStudents: 0,
            inactiveStudents: 0,
            graduatedStudents: 0,
            suspendedStudents: 0,
            programs: new Map<string, number>(),
            yearDistribution: new Map<number, number>(),
            yearTotal: 0,
          });
        }

        const summary = departmentMap.get(student.department)!;
        summary.totalStudents += 1;
        summary.yearTotal += student.year_of_study;

        if (student.status === "Active") summary.activeStudents += 1;
        if (student.status === "Inactive") summary.inactiveStudents += 1;
        if (student.status === "Graduated") summary.graduatedStudents += 1;
        if (student.status === "Suspended") summary.suspendedStudents += 1;

        summary.programs.set(
          student.program,
          (summary.programs.get(student.program) || 0) + 1,
        );
        summary.yearDistribution.set(
          student.year_of_study,
          (summary.yearDistribution.get(student.year_of_study) || 0) + 1,
        );
      });

      const departments = Array.from(departmentMap.entries())
        .map(([department, value]) => ({
          department,
          totalStudents: value.totalStudents,
          activeStudents: value.activeStudents,
          inactiveStudents: value.inactiveStudents,
          graduatedStudents: value.graduatedStudents,
          suspendedStudents: value.suspendedStudents,
          programs: Array.from(value.programs.entries())
            .map(([program, count]) => ({ program, count }))
            .sort((a, b) => b.count - a.count),
          yearDistribution: Object.fromEntries(
            Array.from(value.yearDistribution.entries()).map(
              ([year, count]) => [`Year ${year}`, count],
            ),
          ),
          averageYear:
            value.totalStudents > 0 ? value.yearTotal / value.totalStudents : 0,
        }))
        .sort((a, b) => b.totalStudents - a.totalStudents);

      const totalPrograms = new Set(students.map((student) => student.program))
        .size;

      setDepartmentSummaryData({
        totalDepartments: departments.length,
        totalStudents: students.length,
        totalPrograms,
        largestDepartment:
          departments.length > 0
            ? {
                name: departments[0].department,
                count: departments[0].totalStudents,
              }
            : null,
        departments,
      });
    } catch (error) {
      console.error("Error fetching department summary:", error);
      toast.error("Failed to load department summary");
    } finally {
      setLoadingDepartmentSummary(false);
    }
  };

  const fetchEnrollmentData = async () => {
    try {
      setLoadingEnrollment(true);

      // Fetch all students from profiles collection
      const studentsQuery = query(
        collection(db, "profiles"),
        where("role", "==", "student"),
      );

      const querySnapshot = await getDocs(studentsQuery);
      const students = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          student_number: data.student_number || data.studentNumber || "",
          first_name: data.full_name?.split(" ")[0] || data.firstName || "",
          last_name:
            data.full_name?.split(" ").slice(1).join(" ") ||
            data.lastName ||
            "",
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
        stats.byDepartment[student.department] =
          (stats.byDepartment[student.department] || 0) + 1;

        // Program stats
        stats.byProgram[student.program] =
          (stats.byProgram[student.program] || 0) + 1;

        // Year stats
        stats.byYear[student.year_of_study] =
          (stats.byYear[student.year_of_study] || 0) + 1;

        // Status stats
        stats.byStatus[student.status] =
          (stats.byStatus[student.status] || 0) + 1;
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

        yearMap.set(
          student.year_of_study,
          (yearMap.get(student.year_of_study) || 0) + 1,
        );
      });

      stats.departmentBreakdown = Array.from(departmentMap.entries()).map(
        ([department, programMap]) => ({
          department,
          total: Array.from(programMap.values()).reduce(
            (sum, yearMap) =>
              sum +
              Array.from(yearMap.values()).reduce(
                (yearSum, count) => yearSum + count,
                0,
              ),
            0,
          ),
          programs: Array.from(programMap.entries()).map(
            ([program, yearMap]) => ({
              program,
              count: Array.from(yearMap.values()).reduce(
                (sum, count) => sum + count,
                0,
              ),
              years: Object.fromEntries(yearMap.entries()),
            }),
          ),
        }),
      );

      setEnrollmentData({ stats, students });
    } catch (error) {
      console.error("Error fetching enrollment data:", error);
      toast.error("Failed to load enrollment data");
    } finally {
      setLoadingEnrollment(false);
    }
  };

  const fetchAcademicData = async () => {
    try {
      setLoadingAcademic(true);

      // Fetch all student grades
      const gradesQuery = query(collection(db, "student_grades"));
      const gradesSnap = await getDocs(gradesQuery);
      const grades: StudentGradeRecord[] = gradesSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<StudentGradeRecord, "id">),
      }));

      // Fetch all students
      const studentsQuery = query(
        collection(db, "profiles"),
        where("role", "==", "student"),
      );
      const studentsSnap = await getDocs(studentsQuery);
      const students: StudentProfileRecord[] = studentsSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<StudentProfileRecord, "id">),
      }));

      // Fetch courses for course information
      const coursesSnap = await getDocs(collection(db, "courses"));
      const courses: CourseRecord[] = coursesSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<CourseRecord, "id">),
      }));

      // Create maps for quick lookups
      const studentMap = new Map(students.map((s) => [s.id, s]));
      const courseMap = new Map(
        courses.map((c) => [
          c.id,
          {
            code: c.code || "N/A",
            title: c.name || c.title || "Unknown Course",
            credits: c.credits || 3,
          },
        ]),
      );

      // Group grades by student and calculate CGPA
      const studentGradesMap = new Map<
        string,
        {
          student: any;
          grades: any[];
          totalGradePoints: number;
          totalCredits: number;
          cgpa: number;
        }
      >();

      grades.forEach((grade) => {
        const studentId = grade.student_id;
        if (!studentId) return;
        const student = studentMap.get(studentId);
        if (!student) return;

        const course = grade.course_id
          ? courseMap.get(grade.course_id)
          : undefined;
        const credits = course?.credits || 3;
        const gradePoint = grade.gp || grade.grade_point || 0;

        if (!studentGradesMap.has(studentId)) {
          studentGradesMap.set(studentId, {
            student,
            grades: [],
            totalGradePoints: 0,
            totalCredits: 0,
            cgpa: 0,
          });
        }

        const studentData = studentGradesMap.get(studentId)!;
        studentData.grades.push(grade);
        studentData.totalGradePoints += gradePoint * credits;
        studentData.totalCredits += credits;
      });

      // Calculate CGPA for each student
      studentGradesMap.forEach((data) => {
        data.cgpa =
          data.totalCredits > 0 ? data.totalGradePoints / data.totalCredits : 0;
      });

      // Convert to array and sort by CGPA
      const studentGrades = Array.from(studentGradesMap.values())
        .filter((data) => data.grades.length > 0)
        .map((data) => ({
          studentId: data.student.id,
          studentNumber:
            data.student.student_number || data.student.studentNumber || "",
          name:
            data.student.full_name ||
            `${data.student.first_name || ""} ${data.student.last_name || ""}`.trim(),
          department: data.student.department || "Not Assigned",
          program: data.student.program || "Not Assigned",
          cgpa: data.cgpa,
          totalCredits: data.totalCredits,
          academicYear: data.grades[0]?.academic_year || "",
          semester: String(data.grades[0]?.semester || ""),
        }))
        .sort((a, b) => b.cgpa - a.cgpa);

      // Calculate statistics
      const stats: AcademicStats = {
        totalStudentsWithGrades: studentGrades.length,
        gpaDistribution: {},
        gradeDistribution: {},
        averageGPA: 0,
        topPerformers: [],
        atRiskStudents: [],
        departmentPerformance: [],
        programPerformance: [],
      };

      // GPA Distribution (buckets)
      const gpaBuckets = [
        "0-1.0",
        "1.1-2.0",
        "2.1-3.0",
        "3.1-3.5",
        "3.6-4.0",
        "4.1-5.0",
      ];
      gpaBuckets.forEach((bucket) => (stats.gpaDistribution[bucket] = 0));

      studentGrades.forEach((student) => {
        const cgpa = student.cgpa;
        if (cgpa >= 0 && cgpa <= 1.0) stats.gpaDistribution["0-1.0"]++;
        else if (cgpa <= 2.0) stats.gpaDistribution["1.1-2.0"]++;
        else if (cgpa <= 3.0) stats.gpaDistribution["2.1-3.0"]++;
        else if (cgpa <= 3.5) stats.gpaDistribution["3.1-3.5"]++;
        else if (cgpa <= 4.0) stats.gpaDistribution["3.6-4.0"]++;
        else stats.gpaDistribution["4.1-5.0"]++;
      });

      // Grade Distribution from individual grades
      grades.forEach((grade) => {
        const gradeLetter = grade.grade || "N/A";
        stats.gradeDistribution[gradeLetter] =
          (stats.gradeDistribution[gradeLetter] || 0) + 1;
      });

      // Average GPA
      stats.averageGPA =
        studentGrades.length > 0
          ? studentGrades.reduce((sum, s) => sum + s.cgpa, 0) /
            studentGrades.length
          : 0;

      // Top Performers (top 10)
      stats.topPerformers = studentGrades.slice(0, 10);

      // At Risk Students (CGPA < 2.0)
      stats.atRiskStudents = studentGrades.filter(
        (s) => s.cgpa < 2.0 && s.cgpa > 0,
      );

      // Department Performance
      const deptMap = new Map<
        string,
        { totalGPA: number; count: number; maxGPA: number }
      >();
      studentGrades.forEach((student) => {
        if (!deptMap.has(student.department)) {
          deptMap.set(student.department, { totalGPA: 0, count: 0, maxGPA: 0 });
        }
        const dept = deptMap.get(student.department)!;
        dept.totalGPA += student.cgpa;
        dept.count++;
        dept.maxGPA = Math.max(dept.maxGPA, student.cgpa);
      });

      stats.departmentPerformance = Array.from(deptMap.entries())
        .map(([dept, data]) => ({
          department: dept,
          averageGPA: data.count > 0 ? data.totalGPA / data.count : 0,
          studentCount: data.count,
          topGPA: data.maxGPA,
        }))
        .sort((a, b) => b.averageGPA - a.averageGPA);

      // Program Performance
      const progMap = new Map<
        string,
        { totalGPA: number; count: number; department: string }
      >();
      studentGrades.forEach((student) => {
        const key = `${student.program}|${student.department}`;
        if (!progMap.has(key)) {
          progMap.set(key, {
            totalGPA: 0,
            count: 0,
            department: student.department,
          });
        }
        const prog = progMap.get(key)!;
        prog.totalGPA += student.cgpa;
        prog.count++;
      });

      stats.programPerformance = Array.from(progMap.entries())
        .map(([key, data]) => {
          const [program, department] = key.split("|");
          return {
            program,
            department,
            averageGPA: data.count > 0 ? data.totalGPA / data.count : 0,
            studentCount: data.count,
          };
        })
        .sort((a, b) => b.averageGPA - a.averageGPA);

      setAcademicData({ stats, studentGrades });
    } catch (error) {
      console.error("Error fetching academic data:", error);
      toast.error("Failed to load academic performance data");
    } finally {
      setLoadingAcademic(false);
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
          "Admission Date",
        ];

        const csvRows = enrollmentData.students.map((student) => [
          student.student_number,
          student.first_name,
          student.last_name,
          student.department,
          student.program,
          student.year_of_study.toString(),
          student.status,
          student.admission_date,
        ]);

        // Add summary data at the top
        const summaryRows = [
          ["Enrollment Report Summary"],
          ["Generated on", new Date().toLocaleDateString()],
          [""],
          ["Total Students", enrollmentData.stats.totalStudents.toString()],
          [
            "Departments",
            Object.keys(enrollmentData.stats.byDepartment).length.toString(),
          ],
          [
            "Programs",
            Object.keys(enrollmentData.stats.byProgram).length.toString(),
          ],
          [""],
          ["Department Breakdown"],
          ...Object.entries(enrollmentData.stats.byDepartment).map(
            ([dept, count]) => [dept, count.toString()],
          ),
          [""],
          ["Program Breakdown"],
          ...Object.entries(enrollmentData.stats.byProgram).map(
            ([prog, count]) => [prog, count.toString()],
          ),
          [""],
          ["Year Distribution"],
          ...Object.entries(enrollmentData.stats.byYear).map(
            ([year, count]) => [`Year ${year}`, count.toString()],
          ),
          [""],
          ["Status Distribution"],
          ...Object.entries(enrollmentData.stats.byStatus).map(
            ([status, count]) => [status, count.toString()],
          ),
          [""],
          ["Student Details"],
          csvHeaders,
          ...csvRows.map((row) => row.map((cell) => `"${cell}"`)),
        ];

        // Convert to CSV
        const csvContent = summaryRows
          .map((row) =>
            row.map((cell) => cell.toString().replace(/"/g, '""')).join(","),
          )
          .join("\n");

        // Create and download file
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `enrollment_report_${new Date().toISOString().split("T")[0]}.csv`,
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("Enrollment report downloaded successfully");
      } else if (reportName === "Academic Performance" && academicData) {
        // Generate CSV content for academic performance
        const csvHeaders = [
          "Student Number",
          "Name",
          "Department",
          "Program",
          "CGPA",
          "Total Credits",
          "Academic Year",
          "Semester",
        ];

        const csvRows = academicData.studentGrades.map((student) => [
          student.studentNumber,
          student.name,
          student.department,
          student.program,
          student.cgpa.toFixed(2),
          student.totalCredits.toString(),
          student.academicYear,
          student.semester,
        ]);

        // Add summary data at the top
        const summaryRows = [
          ["Academic Performance Report"],
          ["Generated on", new Date().toLocaleDateString()],
          [""],
          [
            "Total Students with Grades",
            academicData.stats.totalStudentsWithGrades.toString(),
          ],
          ["Average GPA", academicData.stats.averageGPA.toFixed(2)],
          [""],
          ["GPA Distribution"],
          ...Object.entries(academicData.stats.gpaDistribution).map(
            ([range, count]) => [range, count.toString()],
          ),
          [""],
          ["Grade Distribution"],
          ...Object.entries(academicData.stats.gradeDistribution).map(
            ([grade, count]) => [grade, count.toString()],
          ),
          [""],
          ["Department Performance"],
          ["Department", "Average GPA", "Student Count", "Top GPA"],
          ...academicData.stats.departmentPerformance.map((dept) => [
            dept.department,
            dept.averageGPA.toFixed(2),
            dept.studentCount.toString(),
            dept.topGPA.toFixed(2),
          ]),
          [""],
          ["Top Performers"],
          ["Rank", "Student Number", "Name", "CGPA", "Department"],
          ...academicData.stats.topPerformers
            .slice(0, 20)
            .map((student, index) => [
              (index + 1).toString(),
              student.studentNumber,
              student.name,
              student.cgpa.toFixed(2),
              student.department,
            ]),
          [""],
          ["At Risk Students (CGPA < 2.0)"],
          ["Student Number", "Name", "CGPA", "Department", "Program"],
          ...academicData.stats.atRiskStudents.map((student) => [
            student.studentNumber,
            student.name,
            student.cgpa.toFixed(2),
            student.department,
            student.program,
          ]),
          [""],
          ["Detailed Student Performance"],
          csvHeaders,
          ...csvRows.map((row) => row.map((cell) => `"${cell}"`)),
        ];

        // Convert to CSV
        const csvContent = summaryRows
          .map((row) =>
            row.map((cell) => cell.toString().replace(/"/g, '""')).join(","),
          )
          .join("\n");

        // Create and download file
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `academic_performance_report_${new Date().toISOString().split("T")[0]}.csv`,
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("Academic performance report downloaded successfully");
      } else if (reportName === "Department Summary" && departmentSummaryData) {
        const rows: string[][] = [
          ["Department Summary Report"],
          ["Generated on", new Date().toLocaleDateString()],
          [""],
          [
            "Total Departments",
            departmentSummaryData.totalDepartments.toString(),
          ],
          ["Total Students", departmentSummaryData.totalStudents.toString()],
          ["Total Programs", departmentSummaryData.totalPrograms.toString()],
          [
            "Largest Department",
            departmentSummaryData.largestDepartment
              ? `${departmentSummaryData.largestDepartment.name} (${departmentSummaryData.largestDepartment.count})`
              : "N/A",
          ],
          [""],
          [
            "Department",
            "Total Students",
            "Active",
            "Inactive",
            "Graduated",
            "Suspended",
            "Average Year",
            "Top Programs",
            "Year Distribution",
          ],
        ];

        departmentSummaryData.departments.forEach((department) => {
          rows.push([
            department.department,
            department.totalStudents.toString(),
            department.activeStudents.toString(),
            department.inactiveStudents.toString(),
            department.graduatedStudents.toString(),
            department.suspendedStudents.toString(),
            department.averageYear.toFixed(2),
            department.programs
              .slice(0, 3)
              .map((program) => `${program.program} (${program.count})`)
              .join(" | "),
            Object.entries(department.yearDistribution)
              .map(([year, count]) => `${year}: ${count}`)
              .join(" | "),
          ]);
        });

        const csv = rows
          .map((row) =>
            row
              .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
              .join(","),
          )
          .join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `department_summary_${new Date().toISOString().split("T")[0]}.csv`,
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("Department summary downloaded successfully");
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
                      {downloadingReport === report.name
                        ? "Downloading..."
                        : "Download"}
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
        <Dialog
          open={!!viewingReport}
          onOpenChange={() => setViewingReport(null)}
        >
          <DialogContent className="w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {viewingReport}
              </DialogTitle>
              <DialogDescription>
                {viewingReport === "Enrollment Report"
                  ? "Comprehensive overview of student enrollment statistics"
                  : viewingReport === "Academic Performance"
                    ? "Student performance metrics, GPA distributions, and academic insights"
                    : viewingReport === "Department Summary"
                      ? "Department-level enrollment, status, and program distribution"
                      : "Report preview. Connect to your database to load live data."}
              </DialogDescription>
            </DialogHeader>

            {viewingReport === "Enrollment Report" ? (
              <div className="space-y-6">
                {loadingEnrollment ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">
                        Loading enrollment data...
                      </p>
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
                          <div className="text-2xl font-bold">
                            {enrollmentData.stats.totalStudents}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Departments
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {
                              Object.keys(enrollmentData.stats.byDepartment)
                                .length
                            }
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Programs
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {Object.keys(enrollmentData.stats.byProgram).length}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Active Students
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {enrollmentData.stats.byStatus.Active || 0}
                          </div>
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
                            {enrollmentData.stats.departmentBreakdown.map(
                              (dept) => (
                                <TableRow key={dept.department}>
                                  <TableCell className="font-medium">
                                    {dept.department}
                                  </TableCell>
                                  <TableCell>{dept.total}</TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      {dept.programs.map((prog) => (
                                        <div
                                          key={prog.program}
                                          className="text-sm"
                                        >
                                          {prog.program}: {prog.count}
                                        </div>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      {dept.programs.map((prog) => (
                                        <div
                                          key={prog.program}
                                          className="text-xs text-muted-foreground"
                                        >
                                          {Object.entries(prog.years).map(
                                            ([year, count]) => (
                                              <span key={year} className="mr-2">
                                                Y{year}: {count}
                                              </span>
                                            ),
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ),
                            )}
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
                            {enrollmentData.students
                              .slice(0, 50)
                              .map((student) => (
                                <TableRow key={student.id}>
                                  <TableCell className="font-mono text-sm">
                                    {student.student_number}
                                  </TableCell>
                                  <TableCell>
                                    {student.first_name} {student.last_name}
                                  </TableCell>
                                  <TableCell>{student.department}</TableCell>
                                  <TableCell>{student.program}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      Year {student.year_of_study}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        student.status === "Active"
                                          ? "default"
                                          : "secondary"
                                      }
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
                            Showing first 50 students. Download the full report
                            for complete data.
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setViewingReport(null)}
                      >
                        Close
                      </Button>
                      <Button
                        onClick={() =>
                          handleDownloadReport("Enrollment Report")
                        }
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Failed to load enrollment data
                    </p>
                  </div>
                )}
              </div>
            ) : viewingReport === "Academic Performance" ? (
              <div className="space-y-6">
                {loadingAcademic ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">
                        Loading academic performance data...
                      </p>
                    </div>
                  </div>
                ) : academicData ? (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Students with Grades
                          </CardTitle>
                          <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {academicData.stats.totalStudentsWithGrades}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Average GPA
                          </CardTitle>
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {academicData.stats.averageGPA.toFixed(2)}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            Top Performers
                          </CardTitle>
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {academicData.stats.topPerformers.length}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">
                            At Risk Students
                          </CardTitle>
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-red-600">
                            {academicData.stats.atRiskStudents.length}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* GPA Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle>GPA Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {Object.entries(
                            academicData.stats.gpaDistribution,
                          ).map(([range, count]) => (
                            <div
                              key={range}
                              className="text-center p-4 border rounded-lg"
                            >
                              <div className="text-2xl font-bold">{count}</div>
                              <div className="text-sm text-muted-foreground">
                                {range} GPA
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Top Performers */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Top Performers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Rank</TableHead>
                              <TableHead>Student Number</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>CGPA</TableHead>
                              <TableHead>Department</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {academicData.stats.topPerformers
                              .slice(0, 10)
                              .map((student, index) => (
                                <TableRow key={student.studentId}>
                                  <TableCell className="font-medium">
                                    #{index + 1}
                                  </TableCell>
                                  <TableCell className="font-mono text-sm">
                                    {student.studentNumber}
                                  </TableCell>
                                  <TableCell>{student.name}</TableCell>
                                  <TableCell>
                                    <Badge variant="default">
                                      {student.cgpa.toFixed(2)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{student.department}</TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    {/* Department Performance */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Department Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Department</TableHead>
                              <TableHead>Average GPA</TableHead>
                              <TableHead>Student Count</TableHead>
                              <TableHead>Top GPA</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {academicData.stats.departmentPerformance.map(
                              (dept) => (
                                <TableRow key={dept.department}>
                                  <TableCell className="font-medium">
                                    {dept.department}
                                  </TableCell>
                                  <TableCell>
                                    {dept.averageGPA.toFixed(2)}
                                  </TableCell>
                                  <TableCell>{dept.studentCount}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {dept.topGPA.toFixed(2)}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ),
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    {/* At Risk Students */}
                    {academicData.stats.atRiskStudents.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-red-600">
                            At Risk Students (CGPA &lt; 2.0)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Student Number</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>CGPA</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Program</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {academicData.stats.atRiskStudents.map(
                                (student) => (
                                  <TableRow key={student.studentId}>
                                    <TableCell className="font-mono text-sm">
                                      {student.studentNumber}
                                    </TableCell>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>
                                      <Badge variant="destructive">
                                        {student.cgpa.toFixed(2)}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>{student.department}</TableCell>
                                    <TableCell>{student.program}</TableCell>
                                  </TableRow>
                                ),
                              )}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setViewingReport(null)}
                      >
                        Close
                      </Button>
                      <Button
                        onClick={() =>
                          handleDownloadReport("Academic Performance")
                        }
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Failed to load academic performance data
                    </p>
                  </div>
                )}
              </div>
            ) : viewingReport === "Department Summary" ? (
              <div className="space-y-6">
                {loadingDepartmentSummary ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">
                        Loading department summary...
                      </p>
                    </div>
                  </div>
                ) : departmentSummaryData ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Departments
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {departmentSummaryData.totalDepartments}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Students Covered
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {departmentSummaryData.totalStudents}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Programs
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {departmentSummaryData.totalPrograms}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Largest Department
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-base font-semibold leading-tight">
                            {departmentSummaryData.largestDepartment?.name ||
                              "N/A"}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {departmentSummaryData.largestDepartment
                              ? `${departmentSummaryData.largestDepartment.count} students`
                              : "No data"}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Department Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Department</TableHead>
                              <TableHead>Total</TableHead>
                              <TableHead>Status Mix</TableHead>
                              <TableHead>Top Programs</TableHead>
                              <TableHead>Year Distribution</TableHead>
                              <TableHead>Avg Year</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {departmentSummaryData.departments.map(
                              (department) => (
                                <TableRow key={department.department}>
                                  <TableCell className="font-medium">
                                    {department.department}
                                  </TableCell>
                                  <TableCell>
                                    {department.totalStudents}
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1 text-xs">
                                      <div>
                                        Active: {department.activeStudents}
                                      </div>
                                      <div>
                                        Inactive: {department.inactiveStudents}
                                      </div>
                                      <div>
                                        Graduated:{" "}
                                        {department.graduatedStudents}
                                      </div>
                                      <div>
                                        Suspended:{" "}
                                        {department.suspendedStudents}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1 text-xs">
                                      {department.programs
                                        .slice(0, 3)
                                        .map((program) => (
                                          <div key={program.program}>
                                            {program.program}: {program.count}
                                          </div>
                                        ))}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="space-y-1 text-xs text-muted-foreground">
                                      {Object.entries(
                                        department.yearDistribution,
                                      ).map(([year, count]) => (
                                        <div key={year}>
                                          {year}: {count}
                                        </div>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {department.averageYear.toFixed(2)}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ),
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setViewingReport(null)}
                      >
                        Close
                      </Button>
                      <Button
                        onClick={() =>
                          handleDownloadReport("Department Summary")
                        }
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Failed to load department summary
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="rounded-lg border border-border bg-muted/50 p-6">
                  <div className="flex items-center justify-center gap-3 text-muted-foreground mb-4">
                    <BarChart3 className="h-8 w-8" />
                    <span className="font-medium">
                      Sample data for {viewingReport}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    This report would show {viewingReport?.toLowerCase()} data
                    once connected to your backend.
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
