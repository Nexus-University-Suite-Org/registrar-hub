import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StudentTable } from "@/components/students/StudentTable";
import { StudentFormModal } from "@/components/students/StudentFormModal";
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
import { Student, StudentStatus } from "@/types/student";
import { Plus, Search, Filter, Download, Users, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { auth, db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy,
  serverTimestamp,
  getDoc
} from "firebase/firestore";

export default function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentStatus | "all">(
    "all"
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log("Fetching students from Firestore...");

      const studentsQuery = query(
        collection(db, "profiles"),
        where("role", "==", "student"),
        orderBy("created_at", "desc")
      );

      const querySnapshot = await getDocs(studentsQuery);
      
      const mappedStudents: Student[] = querySnapshot.docs.map(doc => {
        const profile = doc.data();
        return {
          id: doc.id,
          student_number: profile.student_number || "",
          registration_number: profile.registration_number || profile.student_number || "",
          first_name: profile.full_name?.split(" ")[0] || "",
          last_name: profile.full_name?.split(" ").slice(1).join(" ") || "",
          email: profile.email || "",
          department: profile.department || "",
          program: profile.program || "",
          year_of_study: profile.year_of_study || 1,
          status: profile.status || "Active",
          admission_date: profile.admission_date || new Date().toISOString().split("T")[0],
          avatar_url: profile.avatar_url,
          created_at: profile.created_at?.toDate?.()?.toISOString() || profile.created_at,
          updated_at: profile.updated_at?.toDate?.()?.toISOString() || profile.updated_at,
        };
      });

      setStudents(mappedStudents);
      toast.success(`Loaded ${mappedStudents.length} students from database`);
    } catch (error: any) {
      console.error("Error fetching students:", error);
      toast.error(`Failed to load students: ${error.message}`);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication...");
      const user = auth.currentUser;

      if (!user) {
        console.log("No user found, redirecting to login");
        navigate("/");
        return;
      }

      console.log("User found:", user.email);
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
          s.department.toLowerCase().includes(query)
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

  const handleViewStudent = (student: Student) => {
    console.log("Viewing student details:", student);
    toast.info(
      `Viewing ${student.first_name} ${student.last_name}'s profile - Student #: ${student.student_number}`
    );
  };

  const handleFormSubmit = async (data: Partial<Student>) => {
    try {
      if (formMode === "add") {
        // For add, create a new profile entry with only fields that exist in profiles table
        const newProfileData = {
          id: crypto.randomUUID(), // Generate a new UUID for the profile
          email: data.email,
          full_name: `${data.first_name} ${data.last_name}`,
          student_number: data.student_number,
          registration_number: data.registration_number,
          department: data.department,
          avatar_url: data.avatar_url,
          role: "student",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: insertedData, error } = await supabase
          .from("profiles")
          .insert([newProfileData])
          .select()
          .single();

        if (error) {
          console.error("Error adding student:", error);
          toast.error(`Failed to add student: ${error.message}`);
          return;
        }

        // Map back to Student format for local state
        const newStudent: Student = {
          id: insertedData.id,
          student_number: insertedData.student_number,
          registration_number: insertedData.registration_number,
          first_name: insertedData.full_name?.split(" ")[0] || "",
          last_name:
            insertedData.full_name?.split(" ").slice(1).join(" ") || "",
          email: insertedData.email,
          department: insertedData.department,
          program: "", // Not stored in profiles
          year_of_study: 1, // Not stored in profiles
          status: "Active", // Not stored in profiles
          admission_date: new Date().toISOString().split("T")[0], // Not stored in profiles
          avatar_url: insertedData.avatar_url,
          created_at: insertedData.created_at,
          updated_at: insertedData.updated_at,
        };

        setStudents((prev) => [newStudent, ...prev]);
        toast.success("Student added successfully");
      } else {
        // Edit existing profile - only update fields that exist in profiles table
        const updateData = {
          full_name: `${data.first_name} ${data.last_name}`,
          email: data.email,
          student_number: data.student_number,
          registration_number: data.registration_number,
          department: data.department,
          avatar_url: data.avatar_url,
          updated_at: new Date().toISOString(),
        };

        const { data: updatedData, error } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", selectedStudent?.id)
          .select()
          .single();

        if (error) {
          console.error("Error updating student:", error);
          toast.error(`Failed to update student: ${error.message}`);
          return;
        }

        // Map back to Student format for local state
        const updatedStudent: Student = {
          id: updatedData.id,
          student_number: updatedData.student_number,
          registration_number: updatedData.registration_number,
          first_name: updatedData.full_name?.split(" ")[0] || "",
          last_name: updatedData.full_name?.split(" ").slice(1).join(" ") || "",
          email: updatedData.email,
          department: updatedData.department,
          program: "", // Not stored in profiles
          year_of_study: 1, // Not stored in profiles
          status: "Active", // Not stored in profiles
          admission_date: new Date().toISOString().split("T")[0], // Not stored in profiles
          avatar_url: updatedData.avatar_url,
          created_at: updatedData.created_at,
          updated_at: updatedData.updated_at,
        };

        setStudents((prev) =>
          prev.map((s) => (s.id === selectedStudent?.id ? updatedStudent : s))
        );
        toast.success("Student updated successfully");
      }

      setIsFormOpen(false);
      fetchStudents(); // Refresh the list
    } catch (error) {
      console.error("Error saving student:", error);
      toast.error("Failed to save student");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedStudent) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", selectedStudent.id);

      if (error) {
        console.error("Error deleting student:", error);
        toast.error("Failed to delete student");
        return;
      }

      setStudents((prev) => prev.filter((s) => s.id !== selectedStudent.id));
      toast.success("Student deleted successfully");
      setIsDeleteOpen(false);
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
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
              onValueChange={(v) => setStatusFilter(v as StudentStatus | "all")}
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
              </SelectContent>
            </Select>
            <Button
              variant="outline"
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

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        student={selectedStudent}
      />
    </DashboardLayout>
  );
}
