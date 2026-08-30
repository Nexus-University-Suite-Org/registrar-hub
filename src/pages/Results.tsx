import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Download,
  FileText,
  RefreshCw,
  Printer,
  Edit,
  Save,
  X,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import { get, put, post } from "@/lib/api";

interface ResultCourse {
  title: string;
  code: string;
  credits: number | null;
}

interface ExamResultRow {
  id: string;
  course_id: string;
  academic_year: string;
  semester: string;
  marks: number;
  grade: string | null;
  grade_point: number | null;
  semester_remark?: string;
  remarks?: string | null;
  courses?: ResultCourse;
  student_id: string;
  profiles?: {
    full_name: string;
    student_number: string;
  };
}

interface StudentResults {
  studentId: string;
  studentName: string;
  studentNumber: string;
  program: string;
  yearOfStudy: number;
  cgpa: number;
  totalCredits: number;
  terms: TermResult[];
}

interface TermResult {
  term: string;
  gpa: number;
  totalCredits: number;
  remark?: string;
  entries: Array<
    ExamResultRow & { courseTitle: string; courseCode: string; credits: number }
  >;
}

interface QuizAttemptResult {
  id: string;
  quiz_id: string;
  quiz_title: string;
  score: number;
  total_points: number;
  percentage: number;
  completed_at: string;
  time_taken: number;
  status: string;
  semester: string;
  academic_year: string;
  year_of_study: number;
  course_code: string;
  course_title: string;
  student_number: string;
  student_name: string;
  program: string;
}

const getGradeColor = (grade: string | null | undefined) => {
  if (!grade) return "text-gray-700";
  const gradeUpper = grade.toUpperCase();
  if (gradeUpper.startsWith("A")) return "text-emerald-700";
  if (gradeUpper.startsWith("B")) return "text-blue-700";
  if (gradeUpper.startsWith("C")) return "text-amber-700";
  if (gradeUpper.startsWith("D")) return "text-orange-700";
  return "text-red-700";
};

const calculateSemesterRemark = (gp: number, _grade: string | null): string => {
  if (gp >= 3.5) return "Excellent";
  if (gp >= 3.0) return "Very Good";
  if (gp >= 2.5) return "Good";
  if (gp >= 2.0) return "Satisfactory";
  if (gp >= 1.0) return "Pass";
  return "Fail";
};

const ACADEMIC_YEARS = ["2025/2026", "2024/2025", "2023/2024", "2022/2023"];

export default function Results() {
  const navigate = useNavigate();
  const [results, setResults] = useState<StudentResults[]>([]);
  const [filteredResults, setFilteredResults] = useState<StudentResults[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [academicYearFilter, setAcademicYearFilter] = useState<string>("all");
  const [semesterFilter, setSemesterFilter] = useState<string>("all");
  const [courseUnitFilter, setCourseUnitFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [printScope, setPrintScope] = useState<
    "filtered" | "student" | "semester" | "course"
  >("filtered");
  const [printStudentId, setPrintStudentId] = useState("");
  const [printYearSem, setPrintYearSem] = useState({ year: "", semester: "" });
  const [printCourseId, setPrintCourseId] = useState("");
  const [courseUnitOptions, setCourseUnitOptions] = useState<
    { id: string; label: string }[]
  >([]);
  const [classOptions, setClassOptions] = useState<string[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentResults | null>(
    null,
  );
  const [editingResults, setEditingResults] = useState<
    Array<
      ExamResultRow & {
        courseTitle: string;
        courseCode: string;
        credits: number;
        isModified?: boolean;
      }
    >
  >([]);
  const [saving, setSaving] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizAttemptResult[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizProgramFilter, setQuizProgramFilter] = useState("all");
  const [quizYearFilter, setQuizYearFilter] = useState("all");
  const [quizSemesterFilter, setQuizSemesterFilter] = useState("all");

  const fetchResults = async () => {
    try {
      setLoading(true);
      let students: any[] = [];
      try {
        students = await get<any[]>("/profiles/?role=student");
        if (students.length > 0) {
          students = students.map((p: any) => {
            const full = p.full_name || "";
            const parts = full.split(" ");
            return {
              id: p.id,
              first_name: parts[0] || p.firstName || "",
              last_name: parts.slice(1).join(" ") || p.lastName || "",
              student_number: p.student_number || p.studentNumber || "",
              program: p.program || "",
              year_of_study: p.year_of_study ?? p.yearOfStudy ?? 1,
            };
          });
        }
      } catch {}
      if (!students.length) {
        try {
          const raw = await get<any[]>("/students/");
          students = raw.map((s: any) => ({
            id: s.id,
            first_name: s.first_name || s.firstName || "",
            last_name: s.last_name || s.lastName || "",
            student_number: s.student_number || s.studentNumber || "",
            program: s.program || "",
            year_of_study: s.year_of_study ?? s.yearOfStudy ?? 1,
          }));
        } catch {}
      }

      if (!students.length) {
        setResults([]);
        setFilteredResults([]);
        setCourseUnitOptions([]);
        setClassOptions([]);
        toast.info("No students found");
        return;
      }

      const studentGrades = await get<any[]>("/student-grades/");

      const courses = await get<any[]>("/courses/");
      const courseUnits = await get<any[]>("/course-units/");
      const coursesMap = new Map<
        string,
        { title?: string; name?: string; code: string; credits?: number }
      >();
      courses.forEach((o: any) => {
        coursesMap.set(o.id, {
          title: o.title || o.name,
          name: o.name || o.title,
          code: o.code || "N/A",
          credits: o.credits ?? 3,
        });
      });
      courseUnits.forEach((o: any) => {
        coursesMap.set(o.id, {
          title: o.name || o.title,
          name: o.name || o.title,
          code: o.code || "N/A",
          credits: o.credits ?? 3,
        });
      });

      const studentResultsMap = new Map<string, StudentResults>();
      const courseIdsSeen = new Set<string>();
      const classSet = new Set<string>();

      students.forEach((student) => {
        const studentGradesData = studentGrades.filter(
          (g) => g.student_id === student.id,
        );
        const termsMap = new Map<string, TermResult>();

        studentGradesData.forEach((grade) => {
          const termKey = `${grade.academic_year} · ${grade.semester}`;
          const courseData = coursesMap.get(grade.course_id);
          const title =
            courseData?.title || courseData?.name || "Unknown Course";
          const code = courseData?.code || "N/A";
          const credits = courseData?.credits ?? 3;
          courseIdsSeen.add(grade.course_id);

          if (!termsMap.has(termKey)) {
            termsMap.set(termKey, {
              term: termKey,
              gpa: 0,
              totalCredits: 0,
              remark: "",
              entries: [],
            });
          }
          const term = termsMap.get(termKey)!;
          term.entries.push({
            id: grade.id,
            course_id: grade.course_id,
            academic_year: grade.academic_year,
            semester: grade.semester,
            marks: grade.total || 0,
            grade: grade.grade,
            grade_point: grade.gp || 0,
            courseTitle: title,
            courseCode: code,
            credits,
            student_id: grade.student_id,
            semester_remark: calculateSemesterRemark(
              grade.gp || 0,
              grade.grade,
            ),
          });
          term.totalCredits += credits;
        });

        termsMap.forEach((term) => {
          if (term.entries.length > 0) {
            const totalGradePoints = term.entries.reduce(
              (sum, entry) => sum + (entry.grade_point || 0) * entry.credits,
              0,
            );
            term.gpa =
              term.totalCredits > 0 ? totalGradePoints / term.totalCredits : 0;
            term.remark = calculateSemesterRemark(term.gpa, null);
          }
        });

        const allEntries = Array.from(termsMap.values()).flatMap(
          (t) => t.entries,
        );
        const totalGradePoints = allEntries.reduce(
          (sum, entry) => sum + (entry.grade_point || 0) * entry.credits,
          0,
        );
        const totalCredits = allEntries.reduce(
          (sum, entry) => sum + entry.credits,
          0,
        );
        const cgpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
        const program = student.program || "Not Assigned";
        const yearOfStudy = student.year_of_study ?? 1;
        classSet.add(`${program} - Year ${yearOfStudy}`);

        studentResultsMap.set(student.id, {
          studentId: student.id,
          studentName:
            `${student.first_name} ${student.last_name}`.trim() ||
            student.student_number,
          studentNumber: student.student_number || "",
          program,
          yearOfStudy,
          cgpa: Math.round(cgpa * 100) / 100,
          totalCredits,
          terms: Array.from(termsMap.values()).sort((a, b) =>
            b.term.localeCompare(a.term),
          ),
        });
      });

      const resultsArray = Array.from(studentResultsMap.values());
      setResults(resultsArray);
      setCourseUnitOptions(
        Array.from(courseIdsSeen).map((id) => ({
          id,
          label:
            coursesMap.get(id)?.code +
            " - " +
            (coursesMap.get(id)?.title || coursesMap.get(id)?.name || id),
        })),
      );
      setClassOptions(Array.from(classSet).sort());
      toast.success(
        `Loaded results for ${resultsArray.length} students (lecturer-submitted)`,
      );
    } catch (error) {
      console.error("Fetch results error:", error);
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizResults = async () => {
    try {
      setQuizLoading(true);
      const lecturerApi = "http://localhost:8084";
      const quizzesRes = await fetch(`${lecturerApi}/api/quizzes/`);
      if (!quizzesRes.ok) return;
      const quizzesData = await quizzesRes.json();
      const quizzes = Array.isArray(quizzesData) ? quizzesData : (quizzesData.data || []);
      if (!Array.isArray(quizzes) || quizzes.length === 0) return;

      const studentProfiles = await get<any[]>("/profiles/?role=student");
      const studentMap = new Map<string, { program: string; yearOfStudy: number; student_number: string; full_name: string }>();
      if (studentProfiles.length > 0) {
        studentProfiles.forEach((p: any) => {
          const fullName = p.full_name || `${p.firstName || ""} ${p.lastName || ""}`.trim();
          const studentNumber = p.student_number || p.studentNumber || "";
          studentMap.set(String(p.id), {
            program: p.program || "",
            yearOfStudy: p.year_of_study ?? p.yearOfStudy ?? 1,
            student_number: studentNumber,
            full_name: fullName,
          });
        });
      } else {
        try {
          const raw = await get<any[]>("/students/");
          raw.forEach((s: any) => {
            const fullName = s.first_name || s.last_name ? `${s.first_name || ""} ${s.last_name || ""}`.trim() : (s.full_name || "");
            studentMap.set(String(s.id), {
              program: s.program || "",
              yearOfStudy: s.year_of_study ?? s.yearOfStudy ?? 1,
              student_number: s.student_number || s.studentNumber || "",
              full_name: fullName,
            });
          });
        } catch {}
      }

      const allAttempts: QuizAttemptResult[] = [];
      const quizMap = new Map<number, any>();
      quizzes.forEach((q: any) => { if (q.id) quizMap.set(q.id, q); });

      const attemptsRes = await fetch(`${lecturerApi}/api/quiz-attempts/`);
      if (!attemptsRes.ok) return;
      const attemptsData = await attemptsRes.json();
      const attempts = Array.isArray(attemptsData) ? attemptsData : (attemptsData.data || []);
      if (!Array.isArray(attempts)) return;

      attempts.forEach((a: any) => {
        const quiz = quizMap.get(a.quiz_id) || {};
        const student = studentMap.get(String(a.student_id));
        if (student) {
          allAttempts.push({
            id: String(a.id),
            quiz_id: String(a.quiz_id),
            quiz_title: quiz.title || "Quiz",
            score: a.score,
            total_points: a.total_points,
            percentage: a.percentage,
            completed_at: a.completed_at,
            time_taken: a.time_taken,
            status: a.status,
            semester: quiz.semester || "",
            academic_year: quiz.academic_year || "",
            year_of_study: quiz.year_of_study || student.yearOfStudy,
            course_code: quiz.course_code || "",
            course_title: quiz.course_title || "",
            student_number: student.student_number,
            student_name: student.full_name,
            program: student.program,
          });
        }
      });

      setQuizResults(allAttempts);
    } catch (error) {
      console.error("Failed to fetch quiz results:", error);
    } finally {
      setQuizLoading(false);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      navigate("/");
      return;
    }
    fetchResults();
    fetchQuizResults();
  }, [navigate]);

  useEffect(() => {
    let filtered = results;

    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => {
        const cgpa = r.cgpa;
        if (statusFilter === "excellent") return cgpa >= 4.5;
        if (statusFilter === "very-good") return cgpa >= 4.0 && cgpa < 4.5;
        if (statusFilter === "good") return cgpa >= 3.5 && cgpa < 4.0;
        if (statusFilter === "satisfactory") return cgpa >= 3.0 && cgpa < 3.5;
        return true;
      });
    }
    if (academicYearFilter !== "all") {
      filtered = filtered.filter((r) =>
        r.terms.some((t) => t.term.startsWith(academicYearFilter)),
      );
    }
    if (semesterFilter !== "all") {
      filtered = filtered.filter((r) =>
        r.terms.some((t) => t.term.endsWith("· " + semesterFilter)),
      );
    }
    if (courseUnitFilter !== "all") {
      filtered = filtered.filter((r) =>
        r.terms.some((t) =>
          t.entries.some((e) => e.course_id === courseUnitFilter),
        ),
      );
    }
    if (classFilter !== "all") {
      filtered = filtered.filter(
        (r) => `${r.program} - Year ${r.yearOfStudy}` === classFilter,
      );
    }

    setFilteredResults(filtered);
  }, [
    results,
    searchQuery,
    statusFilter,
    academicYearFilter,
    semesterFilter,
    courseUnitFilter,
    classFilter,
  ]);

  const getPrintData = (): StudentResults[] => {
    if (printScope === "filtered") return filteredResults;
    if (printScope === "student" && printStudentId)
      return results.filter((r) => r.studentId === printStudentId);
    if (
      printScope === "semester" &&
      printYearSem.year &&
      printYearSem.semester
    ) {
      return results.filter((r) =>
        r.terms.some(
          (t) =>
            t.term.startsWith(printYearSem.year) &&
            t.term.endsWith("· " + printYearSem.semester),
        ),
      );
    }
    if (printScope === "course" && printCourseId) {
      return results.filter((r) =>
        r.terms.some((t) =>
          t.entries.some((e) => e.course_id === printCourseId),
        ),
      );
    }
    return filteredResults;
  };

  const buildPrintHtml = (data: StudentResults[]) => {
    let html = "";
    data.forEach((result) => {
      html += `<div class="student-block" style="margin-bottom: 28px; page-break-inside: avoid;">`;
      html += `<table style="width:100%; border-collapse: collapse; margin-bottom: 12px;"><tr><td colspan="4" style="font-weight: 700; padding: 8px 0;">${result.studentName} · ${result.studentNumber} · ${result.program} · Year ${result.yearOfStudy}</td></tr>`;
      html += `<tr><th style="border:1px solid #ddd; padding: 8px; text-align:left;">Course</th><th style="border:1px solid #ddd; padding: 8px;">Year/Sem</th><th style="border:1px solid #ddd; padding: 8px;">Marks</th><th style="border:1px solid #ddd; padding: 8px;">Grade</th></tr>`;
      result.terms.forEach((term) => {
        term.entries.forEach((e) => {
          html += `<tr><td style="border:1px solid #ddd; padding: 8px;">${e.courseCode} - ${e.courseTitle}</td><td style="border:1px solid #ddd; padding: 8px;">${e.academic_year} · Sem ${e.semester}</td><td style="border:1px solid #ddd; padding: 8px;">${e.marks}</td><td style="border:1px solid #ddd; padding: 8px;">${e.grade ?? "—"}</td></tr>`;
        });
      });
      html += `<tr><td colspan="2" style="border:1px solid #ddd; padding: 8px; font-weight: 600;">CGPA</td><td colspan="2" style="border:1px solid #ddd; padding: 8px;">${result.cgpa.toFixed(2)}</td></tr></table></div>`;
    });
    return html;
  };

  const handlePrint = () => {
    const data = getPrintData();
    if (!data.length) {
      toast.error("No results to print for the selected scope.");
      return;
    }
    setPrintDialogOpen(false);
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`
        <!DOCTYPE html><html><head>
          <title>Results - Registrar</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 24px; }
            table { width: 100%; border-collapse: collapse; }
            .print-header { margin-bottom: 20px; }
            .print-header h1 { margin: 0; font-size: 1.5rem; }
          </style>
        </head><body>
          <div class="print-header">
            <h1>Academic Results</h1>
            <p>Generated by Registrar · ${new Date().toLocaleDateString()}</p>
          </div>
          ${buildPrintHtml(data)}
        </body></html>
      `);
      win.document.close();
      win.focus();
      win.print();
      win.close();
    }
  };

  const handleExportCsv = () => {
    if (filteredResults.length === 0) {
      toast.error("No results to export. Adjust your filters first.");
      return;
    }

    const rows: string[] = [];
    const header = [
      "Student Number",
      "Student Name",
      "Program",
      "Year Of Study",
      "CGPA",
      "Total Credits",
      "Academic Year",
      "Semester",
      "Course Code",
      "Course Title",
      "Marks",
      "Grade",
    ];
    rows.push(header.join(","));

    filteredResults.forEach((result) => {
      result.terms.forEach((term) => {
        term.entries.forEach((e) => {
          const record = [
            result.studentNumber,
            `"${result.studentName.replace(/"/g, '""')}"`,
            `"${result.program.replace(/"/g, '""')}"`,
            String(result.yearOfStudy),
            result.cgpa.toFixed(2),
            String(result.totalCredits),
            e.academic_year,
            String(e.semester),
            e.courseCode,
            `"${e.courseTitle.replace(/"/g, '""')}"`,
            String(e.marks),
            e.grade ?? "",
          ];
          rows.push(record.join(","));
        });
      });
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `results-export-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Results exported as CSV for the current filters.");
  };

  const handleEditResults = (student: StudentResults) => {
    setEditingStudent(student);
    // Flatten all entries from all terms for editing
    const allEntries = student.terms.flatMap((term) =>
      term.entries.map((entry) => ({
        ...entry,
        isModified: false,
      })),
    );
    setEditingResults(allEntries);
    setEditDialogOpen(true);
  };

  const handleUpdateResult = (
    index: number,
    field: "marks" | "grade" | "grade_point",
    value: string | number,
  ) => {
    setEditingResults((prev) =>
      prev.map((entry, i) =>
        i === index
          ? {
              ...entry,
              [field]: value,
              isModified: true,
            }
          : entry,
      ),
    );
  };

  const handleSaveResults = async () => {
    if (!editingStudent) return;

    setSaving(true);
    try {
      const modifiedEntries = editingResults.filter(
        (entry) => entry.isModified,
      );

      for (const entry of modifiedEntries) {
        await put(`/student-grades/${entry.id}/`, {
          total: entry.marks,
          grade: entry.grade,
          gp: entry.grade_point,
        });
      }

      // Log activity
      await post("/activities/", {
        action: "results_updated",
        entity: "student_results",
        entityId: editingStudent.studentId,
        entityName: editingStudent.studentName,
        details: `Updated ${modifiedEntries.length} result entries`,
        userId: localStorage.getItem("user_id") || "",
        userName: "Registrar",
      });

      toast.success(
        `Successfully updated ${modifiedEntries.length} result entries`,
      );
      setEditDialogOpen(false);
      setEditingStudent(null);
      setEditingResults([]);

      // Refresh the results
      await fetchResults();
    } catch (error: any) {
      console.error("Error saving results:", error);
      toast.error(`Failed to save results: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const calculateGradeFromMarks = (
    marks: number,
  ): { grade: string; gp: number } => {
    if (marks >= 80) return { grade: "A", gp: 4.0 };
    if (marks >= 75) return { grade: "A-", gp: 3.7 };
    if (marks >= 70) return { grade: "B+", gp: 3.3 };
    if (marks >= 65) return { grade: "B", gp: 3.0 };
    if (marks >= 60) return { grade: "B-", gp: 2.7 };
    if (marks >= 55) return { grade: "C+", gp: 2.3 };
    if (marks >= 50) return { grade: "C", gp: 2.0 };
    if (marks >= 45) return { grade: "C-", gp: 1.7 };
    if (marks >= 40) return { grade: "D+", gp: 1.3 };
    if (marks >= 35) return { grade: "D", gp: 1.0 };
    return { grade: "F", gp: 0.0 };
  };

  const handleAutoCalculate = (index: number) => {
    const entry = editingResults[index];
    if (entry.marks >= 0 && entry.marks <= 100) {
      const { grade, gp } = calculateGradeFromMarks(entry.marks);
      handleUpdateResult(index, "grade", grade);
      handleUpdateResult(index, "grade_point", gp);
    }
  };

  const filteredQuizResults = quizResults.filter((qr) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !qr.student_name.toLowerCase().includes(q) &&
        !qr.student_number.toLowerCase().includes(q)
      )
        return false;
    }
    if (quizProgramFilter !== "all" && qr.program !== quizProgramFilter)
      return false;
    if (quizYearFilter !== "all" && String(qr.year_of_study) !== quizYearFilter)
      return false;
    if (quizSemesterFilter !== "all" && qr.semester !== quizSemesterFilter)
      return false;
    return true;
  });

  const quizPrograms = [...new Set(quizResults.map((q) => q.program).filter(Boolean))].sort();
  const quizYears = [...new Set(quizResults.map((q) => String(q.year_of_study)))].sort();

  type QuizGroup = {
    program: string;
    yearOfStudy: number;
    semesters: Record<string, QuizAttemptResult[]>;
  };
  const quizGrouped: QuizGroup[] = [];
  const quizGroupMap = new Map<string, QuizGroup>();
  filteredQuizResults.forEach((qr) => {
    const key = `${qr.program}|${qr.year_of_study}`;
    if (!quizGroupMap.has(key)) {
      const g: QuizGroup = { program: qr.program, yearOfStudy: qr.year_of_study, semesters: {} };
      quizGroupMap.set(key, g);
      quizGrouped.push(g);
    }
    const g = quizGroupMap.get(key)!;
    const semKey = `${qr.academic_year} · Semester ${qr.semester}`;
    if (!g.semesters[semKey]) g.semesters[semKey] = [];
    g.semesters[semKey].push(qr);
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Student Results
            </h1>
            <p className="text-muted-foreground">
              View lecturer-submitted results; filter and print by student,
              year, semester, or course unit
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchResults}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setPrintDialogOpen(true)}
              disabled={loading || filteredResults.length === 0}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Results
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={loading || filteredResults.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="CGPA" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All performance</SelectItem>
                <SelectItem value="excellent">Excellent (4.5+)</SelectItem>
                <SelectItem value="very-good">Very Good (4.0-4.4)</SelectItem>
                <SelectItem value="good">Good (3.5-3.9)</SelectItem>
                <SelectItem value="satisfactory">
                  Satisfactory (3.0-3.4)
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={academicYearFilter}
              onValueChange={setAcademicYearFilter}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Academic year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {ACADEMIC_YEARS.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={semesterFilter} onValueChange={setSemesterFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="1">Semester 1</SelectItem>
                <SelectItem value="2">Semester 2</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={courseUnitFilter}
              onValueChange={setCourseUnitFilter}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Course unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All units</SelectItem>
                {courseUnitOptions.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All classes</SelectItem>
                {classOptions.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-card rounded-lg border">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Results Overview</h2>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading results...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No results found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">
                        Student Number
                      </th>
                      <th className="text-left p-3 font-medium">
                        Student Name
                      </th>
                      <th className="text-left p-3 font-medium">
                        Program / Class
                      </th>
                      <th className="text-left p-3 font-medium">CGPA</th>
                      <th className="text-left p-3 font-medium">
                        Total Credits
                      </th>
                      <th className="text-left p-3 font-medium">Performance</th>
                      <th className="text-left p-3 font-medium">Terms</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((result) => (
                      <tr
                        key={result.studentId}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="p-3 font-mono">
                          {result.studentNumber}
                        </td>
                        <td className="p-3">{result.studentName}</td>
                        <td className="p-3 text-muted-foreground">
                          {result.program} · Y{result.yearOfStudy}
                        </td>
                        <td className="p-3 font-bold text-lg">
                          {result.cgpa.toFixed(2)}
                        </td>
                        <td className="p-3">{result.totalCredits}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              result.cgpa >= 4.5
                                ? "bg-green-100 text-green-800"
                                : result.cgpa >= 4.0
                                  ? "bg-blue-100 text-blue-800"
                                  : result.cgpa >= 3.5
                                    ? "bg-cyan-100 text-cyan-800"
                                    : result.cgpa >= 3.0
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                            }`}
                          >
                            {result.cgpa >= 4.5
                              ? "Excellent"
                              : result.cgpa >= 4.0
                                ? "Very Good"
                                : result.cgpa >= 3.5
                                  ? "Good"
                                  : result.cgpa >= 3.0
                                    ? "Satisfactory"
                                    : "Needs Improvement"}
                          </span>
                        </td>
                        <td className="p-3">{result.terms.length}</td>
                        <td className="p-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditResults(result)}
                            className="h-8"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quiz Results Section */}
        <div className="bg-card rounded-lg border">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Quiz Results</h2>
                {quizLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary ml-2"></div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchQuizResults}
                disabled={quizLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${quizLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {/* Quiz Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Select value={quizProgramFilter} onValueChange={setQuizProgramFilter}>
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Programme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All programmes</SelectItem>
                  {quizPrograms.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={quizYearFilter} onValueChange={setQuizYearFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  {quizYears.map((y) => (
                    <SelectItem key={y} value={y}>Year {y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={quizSemesterFilter} onValueChange={setQuizSemesterFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All semesters</SelectItem>
                  <SelectItem value="1">Semester 1</SelectItem>
                  <SelectItem value="2">Semester 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {quizLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading quiz results...</p>
              </div>
            ) : filteredQuizResults.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No quiz results found</p>
              </div>
            ) : (
              <div className="space-y-6">
                {quizGrouped.map((group) => (
                  <div key={`${group.program}-${group.yearOfStudy}`} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-base mb-3 text-foreground">
                      {group.program} — Year {group.yearOfStudy}
                    </h3>
                    {Object.entries(group.semesters).sort(([a], [b]) => a.localeCompare(b)).map(([semKey, attempts]) => (
                      <div key={semKey} className="mb-4 last:mb-0">
                        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">
                          {semKey}
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b text-left text-muted-foreground">
                                <th className="p-2 font-medium">Student</th>
                                <th className="p-2 font-medium">Quiz</th>
                                <th className="p-2 font-medium">Course</th>
                                <th className="p-2 font-medium">Score</th>
                                <th className="p-2 font-medium">%</th>
                                <th className="p-2 font-medium">Status</th>
                                <th className="p-2 font-medium">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {attempts.map((a) => (
                                <tr key={a.id} className="border-b hover:bg-muted/30">
                                  <td className="p-2">
                                    <p className="font-medium">{a.student_name}</p>
                                    <p className="text-xs text-muted-foreground">{a.student_number}</p>
                                  </td>
                                  <td className="p-2">{a.quiz_title}</td>
                                  <td className="p-2 text-muted-foreground">{a.course_code}</td>
                                  <td className="p-2 font-medium">{a.score}/{a.total_points}</td>
                                  <td className="p-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                      a.percentage >= 70
                                        ? "bg-emerald-100 text-emerald-700"
                                        : a.percentage >= 50
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-red-100 text-red-700"
                                    }`}>
                                      {a.percentage}%
                                    </span>
                                  </td>
                                  <td className="p-2">
                                    <span className={`text-xs font-medium ${
                                      a.percentage >= 70 ? "text-emerald-600" : a.percentage >= 50 ? "text-amber-600" : "text-red-600"
                                    }`}>
                                      {a.percentage >= 70 ? "Passed" : a.percentage >= 50 ? "Average" : "Failed"}
                                    </span>
                                  </td>
                                  <td className="p-2 text-muted-foreground text-xs">
                                    {a.completed_at ? new Date(a.completed_at).toLocaleDateString() : "N/A"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Print dialog */}
        <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Print Results</DialogTitle>
              <DialogDescription>
                Choose what to print: current filtered list, a specific student,
                all results for a semester, or for a course unit.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Print scope</label>
                <Select
                  value={printScope}
                  onValueChange={(
                    v: "filtered" | "student" | "semester" | "course",
                  ) => setPrintScope(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="filtered">
                      Currently filtered results ({filteredResults.length})
                    </SelectItem>
                    <SelectItem value="student">Specific student</SelectItem>
                    <SelectItem value="semester">
                      All results for semester
                    </SelectItem>
                    <SelectItem value="course">
                      All results for course unit
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {printScope === "student" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Student</label>
                  <Select
                    value={printStudentId}
                    onValueChange={setPrintStudentId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {results.map((r) => (
                        <SelectItem key={r.studentId} value={r.studentId}>
                          {r.studentNumber} - {r.studentName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {printScope === "semester" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Academic year</label>
                    <Select
                      value={printYearSem.year}
                      onValueChange={(v) =>
                        setPrintYearSem((p) => ({ ...p, year: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACADEMIC_YEARS.map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Semester</label>
                    <Select
                      value={printYearSem.semester}
                      onValueChange={(v) =>
                        setPrintYearSem((p) => ({ ...p, semester: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {printScope === "course" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Course unit</label>
                  <Select
                    value={printCourseId}
                    onValueChange={setPrintCourseId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {courseUnitOptions.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPrintDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Results Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Edit Results - {editingStudent?.studentName} (
                {editingStudent?.studentNumber})
              </DialogTitle>
              <DialogDescription>
                Modify marks, grades, and grade points. Changes will be saved to
                the database.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {editingResults.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No results to edit</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Academic Year</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Grade Point</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editingResults.map((entry, index) => (
                      <TableRow
                        key={entry.id}
                        className={entry.isModified ? "bg-blue-50" : ""}
                      >
                        <TableCell className="font-medium">
                          {entry.courseCode} - {entry.courseTitle}
                        </TableCell>
                        <TableCell>{entry.academic_year}</TableCell>
                        <TableCell>Semester {entry.semester}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={entry.marks}
                            onChange={(e) =>
                              handleUpdateResult(
                                index,
                                "marks",
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={entry.grade || ""}
                            onValueChange={(value) =>
                              handleUpdateResult(index, "grade", value)
                            }
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="A-">A-</SelectItem>
                              <SelectItem value="B+">B+</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="B-">B-</SelectItem>
                              <SelectItem value="C+">C+</SelectItem>
                              <SelectItem value="C">C</SelectItem>
                              <SelectItem value="C-">C-</SelectItem>
                              <SelectItem value="D+">D+</SelectItem>
                              <SelectItem value="D">D</SelectItem>
                              <SelectItem value="F">F</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="4.0"
                            value={entry.grade_point}
                            onChange={(e) =>
                              handleUpdateResult(
                                index,
                                "grade_point",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAutoCalculate(index)}
                            className="h-8"
                          >
                            Auto Calc
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveResults} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
