import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StudentTable } from "@/components/students/StudentTable";
import { StudentFormModal } from "@/components/students/StudentFormModal";
import { StudentViewModal } from "@/components/students/StudentViewModal";
import { DeleteConfirmModal } from "@/components/students/DeleteConfirmModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Student } from "@/types/student";
import { Plus, Search, Filter, Download, Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { post, put, del } from "@/lib/api";

const NAP_APPLICATIONS_URL =
  import.meta.env.VITE_NAP_APPLICATIONS_URL ||
  "http://localhost:8080/api/v1/applications";

const NAP_ORIGIN =
  import.meta.env.VITE_NAP_ORIGIN || "http://localhost:8080";

function toAbsoluteUrl(value?: string): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  return `${NAP_ORIGIN}${value.startsWith("/") ? value : `/${value}`}`;
}

interface NapApplication {
  id: number;
  prn?: string;
  firstName?: string;
  lastName?: string;
  otherNames?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  status?: string;
  reviewStatus?: string;
  [key: string]: any;
}

function mapNapApplication(a: NapApplication): Student {
  const first = a.firstName || "";
  const last = a.lastName || "";
  return {
    id: `nap-${a.id}`,
    student_number: a.prn || a.studentNumber || `NAP-${a.id}`,
    registration_number: a.registrationNumber || a.studentNumber || a.prn || "",
    first_name: first,
    last_name: last,
    email: a.email || "",
    department: a.department || a.faculty || "",
    program: a.assignedProgramme || a.programChoice1 || "",
    year_of_study: 1,
    status: (a.status || "SUBMITTED") as any,
    admission_date: a.createdAt ? a.createdAt.split("T")[0] : "",
    avatar_url: toAbsoluteUrl(a.passportPhotoUrl) || "",
    created_at: a.createdAt || "",
    updated_at: a.updatedAt || "",
    source: "nap",
    prn: a.prn,
    other_names: a.otherNames,
    phone_number: a.phoneNumber,
    gender: a.gender,
    date_of_birth: a.dateOfBirth,
    marital_status: a.maritalStatus,
    nationality: a.nationality,
    address: a.address,
    postal_address: a.postalAddress,
    city: a.city,
    postal_code: a.postalCode,
    country: a.country,
    district: a.district,
    subcounty: a.subcounty,
    village: a.village,
    has_national_id_or_passport: a.hasNationalIdOrPassport,
    birth_certificate_or_national_id_details:
      a.birthCertificateOrNationalIdDetails,
    passport_photo_uploaded: a.passportPhotoUploaded,
    passport_photo_url: a.passportPhotoUrl,
    guardian_name: a.guardianName,
    guardian_type: a.guardianType,
    guardian_phone: a.guardianPhone,
    next_of_kin_relationship: a.nextOfKinRelationship,
    is_ugandan: a.isUgandan,
    application_type: a.applicationType,
    entry_scheme: a.entryScheme,
    program_choice_1: a.programChoice1,
    program_choice_2: a.programChoice2,
    program_choice_3: a.programChoice3,
    program_choice_4: a.programChoice4,
    assigned_programme: a.assignedProgramme,
    total_weight_score: a.totalWeightScore,
    qualification_results: a.qualificationResults,
    start_date: a.startDate,
    previous_institution: a.previousInstitution,
    highest_qualification: a.highestQualification,
    academic_credential_level: a.academicCredentialLevel,
    academic_credentials_details: a.academicCredentialsDetails,
    study_mode: a.studyMode,
    academic_year: a.academicYear,
    semester: a.semester,
    email_verified: a.emailVerified,
    review_status: a.reviewStatus,
    submitted_at: a.submittedAt,
    reviewed_at: a.reviewedAt,
    reviewer_notes: a.reviewerNotes,
    uce_result: a.uceResult,
    uace_result: a.uaceResult,
    documents: a.documents,
    extras: a.extras,
    uce_index_number: a.uceIndexNumber,
    uce_year_of_sitting: a.uceYearOfSitting ? String(a.uceYearOfSitting) : "",
    uce_total_aggregates: a.uceTotalAggregates,
    uce_division: a.uceDivision,
    o_level_school_name: a.oLevelSchoolName,
    uace_index_number: a.uaceIndexNumber,
    uace_year_of_sitting: a.uaceYearOfSitting ? String(a.uaceYearOfSitting) : "",
    uace_total_points: a.uaceTotalPoints,
    uace_principal_subjects: a.uacePrincipalSubjects,
    uace_general_paper_grade: a.uaceGeneralPaperGrade,
    uace_ict_or_sub_math_subject: a.uaceIctOrSubMathSubject,
    uace_ict_or_sub_math_grade: a.uaceIctOrSubMathGrade,
    o_level_subjects: a.oLevelSubjects,
    certificate_subjects: a.certificateSubjects,
    gpa: a.gpa,
    personal_statement: a.personalStatement,
    how_did_you_hear: a.howDidYouHear,
    documents_confirmed: a.documentsConfirmed,
    application_fee_paid: a.applicationFeePaid,
    payment_method: a.paymentMethod,
    payment_reference: a.paymentReference,
    interview_preference: a.interviewPreference,
    terms_accepted: a.termsAccepted,
  };
}

async function fetchNapApplications(): Promise<Student[]> {
  try {
    const response = await fetch(NAP_APPLICATIONS_URL);
    if (!response.ok) {
      throw new Error(`NAP backend returned ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (a: NapApplication) =>
          String(a.status).toUpperCase() === "ADMITTED",
      )
      .map(mapNapApplication);
  } catch (error: any) {
    console.warn("[Students] Failed to fetch NAP applications:", error);
    return [];
  }
}

export default function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const napStudents = await fetchNapApplications();
      setStudents(napStudents);
      toast.success(
        napStudents.length > 0
          ? `Loaded ${napStudents.length} admitted applicants from NAP`
          : "No admitted applicants found in NAP",
      );
    } catch (error: any) {
      console.error("Error fetching NAP students:", error);
      toast.error(`Failed to load students: ${error.message}`);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication...");
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        console.log("No user found, redirecting to login");
        navigate("/");
        return;
      }

      console.log("User found:", localStorage.getItem("user_email"));
      await fetchStudents();
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    let filtered = students;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.first_name.toLowerCase().includes(query) ||
          s.last_name.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          s.student_number.toLowerCase().includes(query) ||
          s.department.toLowerCase().includes(query),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    setFilteredStudents(filtered);
  }, [students, searchQuery, statusFilter]);

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setFormMode("add");
    setIsFormOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleDeleteStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const handleExportStudents = () => {
    if (filteredStudents.length === 0) {
      toast.error("No student data available to export");
      return;
    }

    try {
      // Create CSV headers
      const headers = [
        "Student Number",
        "Registration Number",
        "First Name",
        "Last Name",
        "Email",
        "Department",
        "Program",
        "Year of Study",
        "Status",
        "Admission Date",
      ];

      // Convert students data to CSV rows
      const csvData = filteredStudents.map((s) => [
        `"${s.student_number}"`,
        `"${s.registration_number}"`,
        `"${s.first_name}"`,
        `"${s.last_name}"`,
        `"${s.email}"`,
        `"${s.department}"`,
        `"${s.program}"`,
        s.year_of_study,
        `"${s.status}"`,
        `"${s.admission_date}"`,
      ]);

      // Combine headers and rows
      const csvContent = [headers, ...csvData]
        .map((e) => e.join(","))
        .join("\n");

      // Create a Blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `students_export_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(
        `Successfully exported ${filteredStudents.length} students`,
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export student data");
    }
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsViewOpen(true);
  };

  const handleFormSubmit = async (data: Partial<Student>) => {
    try {
      if (formMode === "add") {
        const payload = {
          full_name: `${data.first_name || ""} ${data.last_name || ""}`,
          email: data.email || "",
          student_number: data.student_number || "",
          registration_number:
            data.registration_number || data.student_number || "",
          department: data.department || "",
          avatar_url: data.avatar_url || "",
          role: "student",
          program: data.program || "",
          year_of_study: data.year_of_study || 1,
          status: data.status || "Active",
          is_registered: true,
          admission_date:
            data.admission_date || new Date().toISOString().split("T")[0],
        };
        delete payload.first_name;
        delete payload.last_name;
        await post("/students/", payload);

        // Log activity
        await post("/activities/", {
          action: "student_added",
          entity: "student",
          entityName: `${data.first_name} ${data.last_name}`,
          details: `${data.department} - Year ${data.year_of_study}`,
          user_id: localStorage.getItem("user_id") || "",
          user_name: "Registrar",
        });

        const newStudent: Student = {
          id: "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          student_number: data.student_number || "",
          registration_number:
            data.registration_number || data.student_number || "",
          department: data.department || "",
          program: data.program || "",
          year_of_study: data.year_of_study || 1,
          status: data.status || "Active",
          admission_date:
            data.admission_date || new Date().toISOString().split("T")[0],
          avatar_url: data.avatar_url || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setStudents((prev) => [newStudent, ...prev]);
        toast.success("Student added successfully");
      } else {
        const payload = {
          full_name: `${data.first_name || ""} ${data.last_name || ""}`,
          email: data.email || "",
          student_number: data.student_number || "",
          registration_number:
            data.registration_number || data.student_number || "",
          department: data.department || "",
          avatar_url: data.avatar_url || "",
          program: data.program || "",
          year_of_study: data.year_of_study || 1,
          status: data.status || "Active",
          is_registered: true,
          admission_date:
            data.admission_date || new Date().toISOString().split("T")[0],
        };
        delete payload.first_name;
        delete payload.last_name;
        await put(`/students/${selectedStudent?.id}/`, payload);

        // Log activity
        await post("/activities/", {
          action: "student_updated",
          entity: "student",
          entityName: `${data.first_name} ${data.last_name}`,
          details: `${data.department} - Year ${data.year_of_study}`,
          user_id: localStorage.getItem("user_id") || "",
          user_name: "Registrar",
        });

        const updatedStudent: Student = {
          ...selectedStudent!,
          ...data,
          updated_at: new Date().toISOString(),
        } as Student;

        setStudents((prev) =>
          prev.map((s) => (s.id === selectedStudent?.id ? updatedStudent : s)),
        );
        toast.success("Student updated successfully");
      }

      setIsFormOpen(false);
    } catch (error: any) {
      console.error("Error saving student:", error);
      toast.error(`Failed to save student: ${error.message}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedStudent) return;

    try {
      await del(`/students/${selectedStudent.id}/`);

      setStudents((prev) => prev.filter((s) => s.id !== selectedStudent.id));
      toast.success("Student deleted successfully");
      setIsDeleteOpen(false);
    } catch (error: any) {
      console.error("Error deleting student:", error);
      toast.error(`Failed to delete student: ${error.message}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-400 shadow-primary">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
                Students
              </h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Manage student records and enrollment status
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 animate-slide-up stagger-1 opacity-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 w-full sm:w-auto"
              onClick={fetchStudents}
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              onClick={handleAddStudent}
              size="sm"
              className="gap-2 w-full sm:w-auto shadow-primary"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Add Student</span>
            </Button>
          </div>
        </div>

        {/* Filters Card */}
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm animate-scale-in opacity-0 stagger-2">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search students by name, email, or student number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base rounded-xl border-border/50 focus:border-primary bg-background"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v)}
            >
              <SelectTrigger className="w-full lg:w-[200px] h-12 rounded-xl border-border/50">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Graduated">Graduated</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
                {[
                  "SUBMITTED",
                  "ADMITTED",
                  "REJECTED",
                  "WAITLISTED",
                  "DRAFT",
                ].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleExportStudents}
              className="h-12 gap-2 rounded-xl w-full sm:w-auto"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Results info */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">
              {filteredStudents.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-foreground">
              {students.length}
            </span>{" "}
            students
          </p>
          {(searchQuery || statusFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="text-primary"
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Student Table or Empty State */}
        {filteredStudents.length > 0 ? (
          <div className="animate-fade-in">
            <StudentTable
              students={filteredStudents}
              onEdit={handleEditStudent}
              onDelete={handleDeleteStudent}
              onView={handleViewStudent}
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-border/50 bg-card p-16 text-center animate-scale-in">
            <div className="flex flex-col items-center max-w-sm mx-auto">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent to-muted mb-6">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground">
                No students found
              </h3>
              <p className="mt-2 text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by adding your first student to the system"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button
                  onClick={handleAddStudent}
                  className="mt-6 shadow-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <StudentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        student={selectedStudent}
        mode={formMode}
      />

      <StudentViewModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        student={selectedStudent}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        person={selectedStudent}
      />
    </DashboardLayout>
  );
}
