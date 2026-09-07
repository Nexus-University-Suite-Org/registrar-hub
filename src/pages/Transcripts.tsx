import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FileText, Search, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { get } from "@/lib/api";

interface StudentRecord {
  id: number | string;
  student_number?: string;
  registration_number?: string;
  full_name?: string;
  email?: string;
  department?: string;
  program?: string;
  year_of_study?: number;
  status?: string;
}

interface TranscriptGrade {
  student_id: number | string;
  course_id?: number | string;
  course_code?: string;
  course_title?: string;
  credits?: number;
  academic_year?: string;
  semester?: number | string;
  gp?: number | string;
  grade_point?: number | string;
  grade?: string | null;
  total?: number | string;
  marks?: number | string;
}

interface CourseRecord {
  id: number | string;
  code?: string;
  name?: string;
  title?: string;
  credits?: number;
}

interface TranscriptEntry {
  courseCode: string;
  courseTitle: string;
  academicYear: string;
  semester: string;
  credits: number;
  marks: number;
  grade: string | null;
  gradePoint: number | null;
}

interface TermSummary {
  termKey: string;
  academicYear: string;
  semester: string;
  entries: TranscriptEntry[];
  gpa: number;
  totalCredits: number;
}

const calculateRemark = (gpa: number): string => {
  if (gpa >= 4.5) return "First Class";
  if (gpa >= 4.0) return "Second Class (Upper)";
  if (gpa >= 3.5) return "Second Class (Lower)";
  if (gpa >= 2.0) return "Pass";
  if (gpa === 0) return "No results";
  return "Probation";
};

export default function Transcripts() {
  const navigate = useNavigate();

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [studentNumber, setStudentNumber] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StudentRecord[] | null>(
    null,
  );
  const [searchLoading, setSearchLoading] = useState(true);
  const [searchError, setSearchError] = useState(false);
  const [allGrades, setAllGrades] = useState<TranscriptGrade[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError(false);
      try {
        const query = searchQuery.trim();
        const result = await get<StudentRecord[]>(
          query
            ? `/students?search=${encodeURIComponent(query)}`
            : "/students",
        );
        if (!cancelled) setSearchResults(result);
      } catch (err) {
        console.error("Student search error:", err);
        if (!cancelled) setSearchError(true);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;
    get<TranscriptGrade[]>("/student-grades")
      .then((grades) => {
        if (!cancelled) setAllGrades(grades);
      })
      .catch(() => {
        // Grade counts are best-effort only.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const gradeCountByStudent = useMemo(() => {
    const map = new Map<string, number>();
    allGrades.forEach((grade) => {
      const key = String(grade.student_id);
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [allGrades]);

  const generateForStudent = async (student: StudentRecord) => {
    setGeneratingId(String(student.id));
    try {
      const grades = await get<TranscriptGrade[]>("/student-grades");
      const studentGrades = grades.filter(
        (grade) => String(grade.student_id) === String(student.id),
      );
      const yearFilter = academicYear.trim();
      const filtered = yearFilter
        ? studentGrades.filter((grade) => grade.academic_year === yearFilter)
        : studentGrades;

      if (!filtered.length) {
        toast.error(
          yearFilter
            ? "No results found for this student and academic year."
            : "No academic records found for this student yet.",
        );
        return;
      }

      let courseMap = new Map<
        string,
        { code: string; title: string; credits: number }
      >();
      try {
        const courses = await get<CourseRecord[]>("/courses/");
        courseMap = new Map(
          courses.map((course) => [
            String(course.id),
            {
              code: course.code || "N/A",
              title: course.name || course.title || "Unknown Course",
              credits: course.credits ?? 3,
            },
          ]),
        );
      } catch {
        // Grades are already enriched by the registrar backend.
      }

      const termMap = new Map<string, TermSummary>();
      filtered.forEach((grade) => {
        const termKey = `${grade.academic_year || "Unknown"} · Sem ${
          grade.semester ?? "—"
        }`;
        const courseInfo = courseMap.get(String(grade.course_id ?? ""));
        const code = grade.course_code || courseInfo?.code || "N/A";
        const title =
          grade.course_title || courseInfo?.title || "Unknown Course";
        const credits = Number(grade.credits ?? courseInfo?.credits ?? 3);

        if (!termMap.has(termKey)) {
          termMap.set(termKey, {
            termKey,
            academicYear: grade.academic_year || "Unknown",
            semester: String(grade.semester ?? ""),
            entries: [],
            gpa: 0,
            totalCredits: 0,
          });
        }
        const term = termMap.get(termKey)!;
        term.entries.push({
          courseCode: code,
          courseTitle: title,
          academicYear: grade.academic_year || "Unknown",
          semester: String(grade.semester ?? ""),
          credits,
          marks: Number(grade.total ?? grade.marks ?? 0),
          grade: grade.grade ?? null,
          gradePoint: Number(grade.gp ?? grade.grade_point ?? 0),
        });
        term.totalCredits += credits;
      });

      termMap.forEach((term) => {
        if (!term.entries.length || term.totalCredits <= 0) return;
        const totalGradePoints = term.entries.reduce(
          (sum, entry) => sum + (entry.gradePoint || 0) * entry.credits,
          0,
        );
        term.gpa = totalGradePoints / term.totalCredits;
      });

      const terms = Array.from(termMap.values()).sort(
        (a, b) =>
          a.academicYear.localeCompare(b.academicYear) ||
          Number(a.semester) - Number(b.semester),
      );

      const allEntries = terms.flatMap((term) => term.entries);
      const overallCredits = allEntries.reduce(
        (sum, entry) => sum + entry.credits,
        0,
      );
      const overallGradePoints = allEntries.reduce(
        (sum, entry) => sum + (entry.gradePoint || 0) * entry.credits,
        0,
      );
      const cgpa = overallCredits > 0 ? overallGradePoints / overallCredits : 0;
      const remark = calculateRemark(cgpa);

      const fullName = student.full_name || "Student";
      const program = student.program || "—";
      const yearOfStudy = student.year_of_study ?? 1;
      const registrationNumber =
        student.registration_number || student.student_number || "—";
      const displayedNumber = student.student_number || registrationNumber;

      const buildHtml = () => {
        let html = "";
        html += '<div style="margin-bottom: 24px;">';
        html += `<h2 style="margin:0 0 8px 0; font-size:1.25rem; font-weight:600;">${fullName} (${displayedNumber})</h2>`;
        html += `<p style="margin:0; font-size:0.9rem;">Program: ${program} · Year of Study: ${yearOfStudy}</p>`;
        html += `<p style="margin:4px 0 0 0; font-size:0.9rem;">Registration No.: ${registrationNumber}</p>`;
        html += `</div>`;

        terms.forEach((term) => {
          html += '<div style="margin-top:16px; page-break-inside:avoid;">';
          html += `<h3 style="margin:0 0 4px 0; font-size:1rem; font-weight:600;">${term.academicYear} · Semester ${term.semester}</h3>`;
          html +=
            '<table style="width:100%; border-collapse:collapse; margin-top:4px;">';
          html += "<thead><tr>";
          html +=
            '<th style="border:1px solid #ddd; padding:6px 8px; text-align:left;">Course</th>';
          html +=
            '<th style="border:1px solid #ddd; padding:6px 8px; text-align:left;">Credits</th>';
          html +=
            '<th style="border:1px solid #ddd; padding:6px 8px; text-align:left;">Marks</th>';
          html +=
            '<th style="border:1px solid #ddd; padding:6px 8px; text-align:left;">Grade</th>';
          html += "</tr></thead><tbody>";
          term.entries.forEach((entry) => {
            html += "<tr>";
            html += `<td style="border:1px solid #ddd; padding:6px 8px;">${entry.courseCode} - ${entry.courseTitle}</td>`;
            html += `<td style="border:1px solid #ddd; padding:6px 8px;">${entry.credits}</td>`;
            html += `<td style="border:1px solid #ddd; padding:6px 8px;">${entry.marks}</td>`;
            html += `<td style="border:1px solid #ddd; padding:6px 8px;">${entry.grade ?? "—"}</td>`;
            html += "</tr>";
          });
          html += "</tbody>";
          html += "<tfoot>";
          html += `<tr><td colspan="2" style="border:1px solid #ddd; padding:6px 8px; font-weight:600;">GPA</td>`;
          html += `<td colspan="2" style="border:1px solid #ddd; padding:6px 8px;">${term.gpa.toFixed(
            2,
          )}</td></tr>`;
          html += "</tfoot></table>";
          html += "</div>";
        });

        html += '<div style="margin-top:24px; font-size:0.95rem;">';
        html += `<p style="margin:0 0 4px 0; font-weight:600;">Cumulative GPA: ${cgpa.toFixed(
          2,
        )}</p>`;
        html += `<p style="margin:0;">Overall Remark: ${remark}</p>`;
        html += "</div>";
        return html;
      };

      const win = window.open("", "_blank");
      if (!win) {
        toast.error(
          "Popup blocked. Please allow pop-ups for this site and try again.",
        );
        return;
      }
      win.document.write(`
        <!DOCTYPE html><html><head>
          <title>Transcript - ${fullName}</title>
          <style>
            body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 24px; }
            h1 { font-size: 1.5rem; margin-bottom: 4px; }
            h2 { font-size: 1.25rem; }
            h3 { font-size: 1rem; }
            table { width: 100%; border-collapse: collapse; }
            @media print {
              body { padding: 0 16px; }
            }
          </style>
        </head><body>
          <h1>Official Academic Transcript</h1>
          <p style="margin:0 0 16px 0; font-size:0.9rem;">Generated by Registrar · ${new Date().toLocaleDateString()}</p>
          ${buildHtml()}
        </body></html>
      `);
      win.document.close();
      win.focus();
      win.print();

      if (isGenerateOpen) {
        setIsGenerateOpen(false);
        setStudentNumber("");
        setAcademicYear("");
      }
    } catch (err) {
      console.error("Transcript generation error:", err);
      toast.error("Failed to generate transcript.");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleGenerateTranscript = async (e: FormEvent) => {
    e.preventDefault();

    if (!studentNumber.trim()) {
      toast.error("Please enter a student number.");
      return;
    }

    setGeneratingId("manual");
    try {
      const matches = await get<StudentRecord[]>(
        `/students?search=${encodeURIComponent(studentNumber.trim())}`,
      );
      if (!matches.length) {
        toast.error("Student not found. Please check the student number.");
        return;
      }

      const lowered = studentNumber.trim().toLowerCase();
      const exact = matches.filter(
        (student) =>
          String(student.student_number || "").toLowerCase() === lowered ||
          String(student.registration_number || "").toLowerCase() === lowered,
      );

      if (exact.length === 1) {
        await generateForStudent(exact[0]);
      } else if (matches.length === 1) {
        await generateForStudent(matches[0]);
      } else {
        toast.error(
          "Multiple students match. Please refine the student number.",
        );
      }
    } catch (err) {
      console.error("Transcript lookup error:", err);
      toast.error("Failed to generate transcript.");
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Transcripts
            </h1>
            <p className="mt-1 text-muted-foreground">
              Access and manage student academic transcripts
            </p>
          </div>
          <Button onClick={() => setIsGenerateOpen(true)}>
            <Download className="h-5 w-5 mr-2" />
            Generate Transcript
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by student name or number..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" type="button" disabled>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {searchLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading students...</p>
            </div>
          </div>
        ) : searchError ? (
          <div className="rounded-xl border border-border bg-card p-16 text-center">
            <div className="flex flex-col items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent mb-6">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Could not load students
              </h3>
              <p className="mt-2 text-muted-foreground max-w-md">
                An error occurred while searching. Please try again.
              </p>
            </div>
          </div>
        ) : searchResults && searchResults.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-16 text-center">
            <div className="flex flex-col items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent mb-6">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                No students found
              </h3>
              <p className="mt-2 text-muted-foreground max-w-md">
                No students matched your search. Try a different name or
                student number.
              </p>
            </div>
          </div>
        ) : searchResults ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((student) => {
                const gradeCount =
                  gradeCountByStudent.get(String(student.id)) || 0;
                return (
                  <Card key={String(student.id)}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-base">
                            {student.full_name || "Student"}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {student.student_number || "No number"} ·{" "}
                            {student.program || "—"} ·{" "}
                            {student.department || "—"}
                          </p>
                        </div>
                        <Badge variant={gradeCount > 0 ? "default" : "secondary"}>
                          {gradeCount} record{gradeCount === 1 ? "" : "s"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">
                          Year {student.year_of_study ?? "—"} ·{" "}
                          {student.status || "—"}
                        </span>
                        <Button
                          size="sm"
                          type="button"
                          onClick={() => generateForStudent(student)}
                          disabled={generatingId !== null}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {generatingId === String(student.id)
                            ? "Generating..."
                            : "Generate transcript"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : null}

        <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Generate Transcript</DialogTitle>
              <DialogDescription>
                Enter the student details to generate an academic transcript.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={handleGenerateTranscript}
              className="space-y-4 mt-2"
            >
              <div className="space-y-2">
                <Label htmlFor="studentNumber">Student number</Label>
                <Input
                  id="studentNumber"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  placeholder="e.g. 21/U/12345/PS"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic year (optional)</Label>
                <Input
                  id="academicYear"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="e.g. 2023/2024"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsGenerateOpen(false)}
                  disabled={generatingId !== null}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={generatingId !== null}>
                  {generatingId === "manual"
                    ? "Generating..."
                    : "Generate"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}