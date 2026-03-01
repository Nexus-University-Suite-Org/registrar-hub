import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Lecturer } from "@/types/lecturer";
import { LecturerTable } from "@/components/lecturers/LecturerTable";
import { LecturerFormModal } from "@/components/lecturers/LecturerFormModal";
import { LecturerViewModal } from "@/components/lecturers/LecturerViewModal";
import { DeleteConfirmModal } from "@/components/students/DeleteConfirmModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Search,
  Users,
  UserCheck,
  GraduationCap,
  BookOpen,
  Award,
  RefreshCw,
} from "lucide-react";
import { db } from "@/lib/firebase";
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
} from "firebase/firestore";
import { toast } from "sonner";

export default function Lecturers() {
  const navigate = useNavigate();
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(
    null,
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingLecturer, setViewingLecturer] = useState<Lecturer | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");

  const fetchLecturers = async () => {
    try {
      const q = query(
        collection(db, "profiles"),
        where("role", "==", "lecturer"),
        orderBy("created_at", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const lecturersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Lecturer[];

      setLecturers(lecturersData);
    } catch (error) {
      console.error("Error fetching lecturers from Firestore:", error);
      toast.error("Failed to fetch lecturers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLecturers();
  }, []);

  const handleViewLecturer = (lecturer: Lecturer) => {
    setViewingLecturer(lecturer);
    setIsViewModalOpen(true);
  };

  const handleAddLecturer = () => {
    setSelectedLecturer(null);
    setModalMode("add");
    setIsFormModalOpen(true);
  };

  const handleEditLecturer = (lecturer: Lecturer) => {
    setSelectedLecturer(lecturer);
    setModalMode("edit");
    setIsFormModalOpen(true);
  };

  const handleDeleteLecturer = (lecturer: Lecturer) => {
    setSelectedLecturer(lecturer);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (lecturerData: Partial<Lecturer>) => {
    try {
      if (modalMode === "add") {
        const docRef = await addDoc(collection(db, "profiles"), {
          ...lecturerData,
          role: "lecturer",
          created_at: serverTimestamp(),
        });

        const newLecturer = {
          id: docRef.id,
          ...lecturerData,
          role: "lecturer",
        } as Lecturer;

        setLecturers([newLecturer, ...lecturers]);
        toast.success("Lecturer added successfully");
      } else if (selectedLecturer) {
        const docRef = doc(db, "profiles", selectedLecturer.id);
        await updateDoc(docRef, {
          ...lecturerData,
          updated_at: serverTimestamp(),
        });

        setLecturers(
          lecturers.map((lecturer) =>
            lecturer.id === selectedLecturer.id
              ? { ...lecturer, ...lecturerData }
              : lecturer,
          ),
        );
        toast.success("Lecturer updated successfully");
      }

      setIsFormModalOpen(false);
    } catch (error) {
      console.error("Error saving lecturer to Firestore:", error);
      toast.error("Failed to save lecturer");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLecturer) return;

    try {
      await deleteDoc(doc(db, "profiles", selectedLecturer.id));

      setLecturers(
        lecturers.filter((lecturer) => lecturer.id !== selectedLecturer.id),
      );
      toast.success("Lecturer deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedLecturer(null);
    } catch (error) {
      console.error("Error deleting lecturer from Firestore:", error);
      toast.error("Failed to delete lecturer");
    }
  };

  const filteredLecturers = lecturers.filter(
    (lecturer) =>
      `${lecturer.first_name} ${lecturer.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      lecturer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecturer.lecturer_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      lecturer.department?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const activeLecturers = lecturers.filter(
    (lecturer) => lecturer.status === "Active",
  ).length;
  const totalLecturers = lecturers.length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-orange-400/10 animate-pulse"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-orange-400 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="animate-slide-up">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
                  <UserCheck className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="font-display text-4xl lg:text-5xl font-bold mb-2">
                    Academic Faculty
                  </h1>
                  <p className="text-white/90 text-lg font-medium">
                    Excellence in Education • Innovation in Teaching
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up stagger-1">
              <Button
                variant="secondary"
                size="sm"
                className="gap-3 bg-white/10 hover:bg-white/20 border-white/20 backdrop-blur-sm text-white shadow-lg w-full sm:w-auto"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-5 w-5" />
                <span className="hidden sm:inline">Refresh Data</span>
              </Button>
              <Button
                onClick={handleAddLecturer}
                size="sm"
                className="gap-3 bg-white text-primary hover:bg-white/90 shadow-xl transform hover:scale-105 transition-all duration-200 w-full sm:w-auto"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline">Add Lecturer</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Total Faculty
              </CardTitle>
              <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {totalLecturers}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Academic staff members
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                Active Lecturers
              </CardTitle>
              <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                {activeLecturers}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Currently teaching
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Departments
              </CardTitle>
              <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {
                  new Set(lecturers.map((l) => l.department).filter(Boolean))
                    .size
                }
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Academic departments
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Specializations
              </CardTitle>
              <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                <Award className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                {
                  new Set(
                    lecturers.map((l) => l.specialization).filter(Boolean),
                  ).size
                }
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Research areas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <CardTitle className="text-2xl font-display font-bold flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  Faculty Directory
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  Comprehensive lecturer profiles and academic information
                </p>
              </div>

              <div className="relative w-full lg:w-96">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <Input
                  placeholder="Search lecturers by name, email, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-2 border-gray-200 dark:border-gray-700 focus:border-primary rounded-xl shadow-sm"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-inner">
              <LecturerTable
                lecturers={filteredLecturers}
                onEdit={handleEditLecturer}
                onDelete={handleDeleteLecturer}
                onView={handleViewLecturer}
              />
            </div>

            {filteredLecturers.length === 0 && (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No lecturers found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Get started by adding your first lecturer"}
                </p>
                {!searchTerm && (
                  <Button onClick={handleAddLecturer} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add First Lecturer
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <LecturerFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          lecturer={selectedLecturer}
          mode={modalMode}
        />

        <LecturerViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          lecturer={viewingLecturer}
        />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm} student={undefined}        />
      </div>
    </DashboardLayout>
  );
}
