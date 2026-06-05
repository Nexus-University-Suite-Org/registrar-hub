import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FileText, Search, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, db } from "@/lib/firebase";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { collection, getDocs, query, where } from "@/lib/firebase";

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
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleGenerateTranscript = async (e: FormEvent) => {
    e.preventDefault();

    if (!studentNumber.trim()) {
      toast.error("Please enter a student number.");
      return;
    }

    try {
      setIsGenerating(true);

      // 1. Find student profile (from profiles, fallback to students)
      let studentProfile: any | null = null;
      const profilesSnap = await getDocs(
        query(
          collection(db, "profiles"),
          where("role", "==", "student"),
          where("student_number", "==", studentNumber.trim()),
        ),
      );
      if (!profilesSnap.empty) {
        const d = profilesSnap.docs[0];
        studentProfile = { id: d.id, ...d.data() };
      } else {
        const studentsSnap = await getDocs(
          query(
            collection(db, "students"),
            where("student_number", "==", studentNumber.trim()),
          ),
        );
        if (!studentsSnap.empty) {
          const d = studentsSnap.docs[0];
          studentProfile = { id: d.id, ...d.data() };
        }
      }

      if (!studentProfile) {
        toast.error("Student not found. Please check the student number.");
        return;
      }

      const studentId = studentProfile.id as string;

      // 2. Fetch grades for student (optionally filtered by academic year)
      let gradesQuery = query(
        collection(db, "student_grades"),
        where("student_id", "==", studentId),
      );
      if (academicYear.trim()) {
        gradesQuery = query(
          collection(db, "student_grades"),
          where("student_id", "==", studentId),
          where("academic_year", "==", academicYear.trim()),
        );
      }
      const gradesSnap = await getDocs(gradesQuery);
      const grades = gradesSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

      if (!grades.length) {
        toast.error(
          "No results found for this student (and academic year, if specified).",
        );
        return;
      }

      // 3. Load course and course unit metadata
      const coursesSnap = await getDocs(collection(db, "courses"));
      const unitsSnap = await getDocs(collection(db, "course_units"));
      const courseMap = new Map<string, { code: string; title: string; credits: number }>();
      coursesSnap.docs.forEach((d) => {
        const data = d.data() as any;
        courseMap.set(d.id, {
          code: data.code || "N/A",
          title: data.name || data.title || "Unknown Course",
          credits: data.credits ?? 3,
        });
      });
      unitsSnap.docs.forEach((d) => {
        const data = d.data() as any;
        courseMap.set(d.id, {
          code: data.code || "N/A",
          title: data.name || data.title || "Unknown Course",
          credits: data.credits ?? 3,
        });
      });

      // 4. Group by academic year / semester and compute GPA per term
      const termMap = new Map<string, TermSummary>();
      grades.forEach((g) => {
        const termKey = `${g.academic_year} · Sem ${g.semester}`;
        const courseInfo = courseMap.get(g.course_id) || {
          code: "N/A",
          title: "Unknown Course",
          credits: 3,
        };
        if (!termMap.has(termKey)) {
          termMap.set(termKey, {
            termKey,
            academicYear: g.academic_year,
            semester: String(g.semester),
            entries: [],
            gpa: 0,
            totalCredits: 0,
          });
        }
        const term = termMap.get(termKey)!;
        const credits = courseInfo.credits ?? 3;
        const gradePoint = g.gp ?? g.grade_point ?? 0;
        const entry: TranscriptEntry = {
          courseCode: courseInfo.code,
          courseTitle: courseInfo.title,
          academicYear: g.academic_year,
          semester: String(g.semester),
          credits,
          marks: g.total ?? g.marks ?? 0,
          grade: g.grade ?? null,
          gradePoint,
        };
        term.entries.push(entry);
        term.totalCredits += credits;
      });

      termMap.forEach((term) => {
        if (!term.entries.length || term.totalCredits <= 0) return;
        const totalGradePoints = term.entries.reduce(
          (sum, e) => sum + (e.gradePoint || 0) * e.credits,
          0,
        );
        term.gpa = totalGradePoints / term.totalCredits;
      });

      const terms = Array.from(termMap.values()).sort(
        (a, b) =>
          a.academicYear.localeCompare(b.academicYear) ||
          Number(a.semester) - Number(b.semester),
      );

      // 5. Compute overall CGPA
      const allEntries = terms.flatMap((t) => t.entries);
      const overallCredits = allEntries.reduce(
        (sum, e) => sum + e.credits,
        0,
      );
      const overallGradePoints = allEntries.reduce(
        (sum, e) => sum + (e.gradePoint || 0) * e.credits,
        0,
      );
      const cgpa = overallCredits > 0 ? overallGradePoints / overallCredits : 0;
      const remark = calculateRemark(cgpa);

      // 6. Build printable HTML and trigger browser print (user can save as PDF)
      const fullName =
        studentProfile.full_name ||
        `${studentProfile.first_name || ""} ${
          studentProfile.last_name || ""
        }`.trim();
      const program = studentProfile.program || "—";
      const yearOfStudy = studentProfile.year_of_study ?? 1;
      const registrationNumber =
        studentProfile.registration_number ||
        studentProfile.registrationNumber ||
        "—";

      const buildHtml = () => {
        let html = "";
        html += '<div style="margin-bottom: 24px;">';
        html += `<h2 style="margin:0 0 8px 0; font-size:1.25rem; font-weight:600;">${fullName} (${studentNumber})</h2>`;
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
          term.entries.forEach((e) => {
            html += "<tr>";
            html += `<td style="border:1px solid #ddd; padding:6px 8px;">${e.courseCode} - ${e.courseTitle}</td>`;
            html += `<td style="border:1px solid #ddd; padding:6px 8px;">${e.credits}</td>`;
            html += `<td style="border:1px solid #ddd; padding:6px 8px;">${e.marks}</td>`;
            html += `<td style="border:1px solid #ddd; padding:6px 8px;">${e.grade ?? "—"}</td>`;
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
      if (win) {
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
      }

      setIsGenerateOpen(false);
      setStudentNumber("");
      setAcademicYear("");
    } catch (err: any) {
      console.error("Transcript generation error:", err);
      toast.error("Failed to generate transcript.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
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

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by student name or number..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Empty State */}
        <div className="rounded-xl border border-border bg-card p-16 text-center">
          <div className="flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent mb-6">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground">
              Transcript Management
            </h3>
            <p className="mt-2 text-muted-foreground max-w-md">
              Search for a student to view or generate their academic
              transcript. Transcripts include all courses, grades, and GPA
              calculations.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => navigate("/students")}>
                View Students
              </Button>
              <Button onClick={() => setIsGenerateOpen(true)}>
                Generate New Transcript
              </Button>
            </div>
          </div>
        </div>

        {/* Generate transcript modal */}
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
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isGenerating}>
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

