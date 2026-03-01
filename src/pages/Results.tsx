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
import { Search, Filter, Download, FileText, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";

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

const getGradeColor = (grade: string | null | undefined) => {
  if (!grade) return "text-gray-700";
  const gradeUpper = grade.toUpperCase();
  if (gradeUpper.startsWith("A")) return "text-emerald-700";
  if (gradeUpper.startsWith("B")) return "text-blue-700";
  if (gradeUpper.startsWith("C")) return "text-amber-700";
  if (gradeUpper.startsWith("D")) return "text-orange-700";
  return "text-red-700";
};

const calculateSemesterRemark = (gp: number, grade: string | null): string => {
  if (!grade) return "—";
  if (gp >= 3.5) return "Excellent";
  if (gp >= 3.0) return "Very Good";
  if (gp >= 2.5) return "Good";
  if (gp >= 2.0) return "Satisfactory";
  if (gp >= 1.0) return "Pass";
  return "Fail";
};

export default function Results() {
  const navigate = useNavigate();
  const [results, setResults] = useState<StudentResults[]>([]);
  const [filteredResults, setFilteredResults] = useState<StudentResults[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  

  const fetchResults = async () => {
    try {
      setLoading(true);
      console.log(
        "🔍 FETCHING RESULTS - Starting fetchResults function via Firestore...",
      );

      // Get all students from Firestore
      const studentsSnapshot = await getDocs(
        query(collection(db, "students"), orderBy("last_name", "asc")),
      );
      const students = studentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      if (!students || students.length === 0) {
        setResults([]);
        setFilteredResults([]);
        toast.success("No students found");
        return;
      }

      console.log(`Found ${students.length} students`);

      // Get all student grades
      const gradesSnapshot = await getDocs(collection(db, "student_grades"));
      const studentGrades = gradesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      // Get all courses to map them to grades
      const coursesSnapshot = await getDocs(collection(db, "courses"));
      const coursesMap = new Map();
      coursesSnapshot.docs.forEach((doc) => {
        coursesMap.set(doc.id, { id: doc.id, ...doc.data() });
      });

      // Group transcripts by student and organize by academic year/semester
      const studentResultsMap = new Map<string, StudentResults>();

      students.forEach((student) => {
        const studentGradesData = studentGrades.filter(
          (g) => g.student_id === student.id,
        );

        console.log(
          `Student ${student.first_name} ${student.last_name} (${student.student_number}): ${studentGradesData.length} grades`,
        );

        // Group grades by academic year and semester
        const termsMap = new Map<string, TermResult>();

        studentGradesData.forEach((grade) => {
          const termKey = `${grade.academic_year} · ${grade.semester}`;
          const courseData = coursesMap.get(grade.course_id);

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
          const credits = courseData?.credits || 3;

          term.entries.push({
            id: grade.id,
            course_id: grade.course_id,
            academic_year: grade.academic_year,
            semester: grade.semester,
            marks: grade.total || 0,
            grade: grade.grade,
            grade_point: grade.gp || 0,
            courseTitle: courseData?.title || "Unknown Course",
            courseCode: courseData?.code || "N/A",
            credits: credits,
            student_id: grade.student_id,
            semester_remark: calculateSemesterRemark(
              grade.gp || 0,
              grade.grade,
            ),
          });

          term.totalCredits += credits;
        });

        // Calculate GPA for each term
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

        // Calculate overall CGPA
        const allEntries = Array.from(termsMap.values()).flatMap(
          (term) => term.entries,
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

        studentResultsMap.set(student.id, {
          studentId: student.id,
          studentName: `${student.first_name} ${student.last_name}`,
          studentNumber: student.student_number,
          cgpa: Math.round(cgpa * 100) / 100,
          totalCredits,
          terms: Array.from(termsMap.values()).sort((a, b) =>
            b.term.localeCompare(a.term),
          ),
        });
      });

      const resultsArray = Array.from(studentResultsMap.values());
      setResults(resultsArray);
      setFilteredResults(resultsArray);
      toast.success(`Loaded results for ${resultsArray.length} students`);
    } catch (error) {
      console.error("❌ FETCH ERROR:", error);
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔐 CHECKING AUTH - Starting authentication check...");

      const user = auth.currentUser;

      if (!user) {
        console.log("❌ NO USER - Redirecting to login");
        navigate("/");
        return;
      }

      console.log("✅ USER FOUND - Calling fetchResults");
      fetchResults();
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    let filtered = results;

    if (searchQuery) {
      filtered = filtered.filter(
        (result) =>
          result.studentName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          result.studentNumber
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      // Filter by CGPA range
      filtered = filtered.filter((result) => {
        const cgpa = result.cgpa;
        if (statusFilter === "excellent") return cgpa >= 4.5;
        if (statusFilter === "very-good") return cgpa >= 4.0 && cgpa < 4.5;
        if (statusFilter === "good") return cgpa >= 3.5 && cgpa < 4.0;
        if (statusFilter === "satisfactory") return cgpa >= 3.0 && cgpa < 3.5;
        return true;
      });
    }

    setFilteredResults(filtered);
  }, [results, searchQuery, statusFilter]);

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
              View and manage student academic results
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
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by CGPA" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              <SelectItem value="excellent">Excellent (4.5+)</SelectItem>
              <SelectItem value="very-good">Very Good (4.0-4.4)</SelectItem>
              <SelectItem value="good">Good (3.5-3.9)</SelectItem>
              <SelectItem value="satisfactory">
                Satisfactory (3.0-3.4)
              </SelectItem>
            </SelectContent>
          </Select>
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
                      <th className="text-left p-3 font-medium">CGPA</th>
                      <th className="text-left p-3 font-medium">
                        Total Credits
                      </th>
                      <th className="text-left p-3 font-medium">Performance</th>
                      <th className="text-left p-3 font-medium">Terms</th>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
