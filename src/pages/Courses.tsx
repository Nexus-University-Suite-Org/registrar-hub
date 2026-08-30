import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  BookOpen,
  Edit,
  Trash2,
  GraduationCap,
  Building,
  Filter,
  DollarSign,
} from "lucide-react";
import { get, post, put, del } from "@/lib/api";
import { toast } from "sonner";
import { Course, CourseUnit, CourseFeeEntry } from "@/types/course";

const ACADEMIC_YEARS = ["2025/2026", "2024/2025", "2023/2024", "2022/2023"];

const emptyFeeEntry = (): CourseFeeEntry => ({
  academic_year: ACADEMIC_YEARS[0],
  semester_1_tuition: null,
  semester_2_tuition: null,
  recess: null,
  semester_1_functional: null,
  semester_2_functional: null,
});

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseUnits, setCourseUnits] = useState<CourseUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrarCollege, setRegistrarCollege] = useState<string | null>(
    () => localStorage.getItem("registrar_college"),
  );

  // Modals state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isCUModalOpen, setIsCUModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedCU, setSelectedCU] = useState<CourseUnit | null>(null);

  // Form states
  const [courseForm, setCourseForm] = useState({
    code: "",
    name: "",
    department: "",
    duration_years: 3,
  });

  const [cuForm, setCuForm] = useState({
    code: "",
    name: "",
    course_id: 0,
    semester: 1,
    year: 1,
    credits: 3,
  });

  const [selectedCourseForUnits, setSelectedCourseForUnits] =
    useState<Course | null>(null);

  const [activeTab, setActiveTab] = useState<"courses" | "units">("courses");
  const [searchTerm, setSearchTerm] = useState("");
  const [feeEntries, setFeeEntries] = useState<CourseFeeEntry[]>([]);
  const [showCollegeSetup, setShowCollegeSetup] = useState(false);
  const [collegeInput, setCollegeInput] = useState("");

  useEffect(() => {
    fetchRegistrarData();
  }, []);

  const fetchRegistrarData = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      const stored = localStorage.getItem("registrar_college");
      if (stored) {
        setRegistrarCollege(stored);
        fetchData(stored);
        return;
      }

      try {
        const registrar = await get<any>(`/registrars/${userId}/`);
        if (registrar?.college) {
          localStorage.setItem("registrar_college", registrar.college);
          setRegistrarCollege(registrar.college);
          fetchData(registrar.college);
          return;
        }
      } catch {
        console.warn("Registrar not found in the platform database");
      }

      setShowCollegeSetup(true);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching registrar data:", error);
    }
  };

  const handleSetCollege = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId || !collegeInput.trim()) return;

    try {
      await post(`/registrars/${userId}/`, {
        user_id: userId,
        email: localStorage.getItem("user_email") || "",
        college: collegeInput.trim(),
      });
      localStorage.setItem("registrar_college", collegeInput.trim());
      setRegistrarCollege(collegeInput.trim());
      setShowCollegeSetup(false);
      fetchData(collegeInput.trim());
      toast.success("College set successfully");
    } catch (error) {
      toast.error("Failed to save college. Is the backend running?");
    }
  };

  const fetchData = async (college: string) => {
    setLoading(true);
    try {
      const coursesData = await get<Course[]>(
        `/courses/?college=${encodeURIComponent(college)}`,
      );
      const sorted = Array.isArray(coursesData) ? coursesData : [];
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      setCourses(sorted);

      const allUnits = await get<CourseUnit[]>("/course-units/");
      const unitsData = (Array.isArray(allUnits) ? allUnits : [])
        .map((unit) => {
          const course = coursesData.find((c) => c.id === unit.course_id);
          return { ...unit, course_name: course?.name || "Unknown Course" };
        })
        .filter((unit) => coursesData.some((c) => c.id === unit.course_id))
        .sort((a, b) => {
          if (a.course_name !== b.course_name) {
            return a.course_name!.localeCompare(b.course_name!);
          }
          if (a.year !== b.year) return a.year - b.year;
          if (a.semester !== b.semester) return a.semester - b.semester;
          return a.name.localeCompare(b.name);
        });

      setCourseUnits(unitsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  const updateFeeEntry = (
    index: number,
    field: keyof CourseFeeEntry,
    value: string | number,
  ) => {
    const next = feeEntries.map((entry, i) =>
      i === index ? { ...entry, [field]: value } : entry,
    );
    setFeeEntries(next);
  };

  const addFeeEntry = () => {
    const usedYears = feeEntries.map((e) => e.academic_year);
    const nextYear =
      ACADEMIC_YEARS.find((y) => !usedYears.includes(y)) || ACADEMIC_YEARS[0];
    setFeeEntries([
      ...feeEntries,
      { ...emptyFeeEntry(), academic_year: nextYear },
    ]);
  };

  const removeFeeEntry = (index: number) => {
    setFeeEntries(feeEntries.filter((_, i) => i !== index));
  };

  // Course Actions
  const handleSaveCourse = async () => {
    if (!registrarCollege) {
      toast.error("No college assigned to your account. Please contact admin.");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...courseForm,
        college: registrarCollege,
        fee_structure: JSON.stringify(feeEntries.filter(
          (e) =>
            e.academic_year &&
            (e.semester_1_tuition != null && e.semester_1_tuition > 0 ||
              e.semester_2_tuition != null && e.semester_2_tuition > 0 ||
              e.recess != null && e.recess > 0 ||
              e.semester_1_functional != null && e.semester_1_functional > 0 ||
              e.semester_2_functional != null && e.semester_2_functional > 0),
        )),
      };
      if (modalMode === "add") {
        await post("/courses/", payload);
        toast.success("Course added successfully");
      } else if (selectedCourse) {
        await put(`/courses/${selectedCourse.id}/`, payload);
        toast.success("Course updated successfully");
      }
      setIsCourseModalOpen(false);
      fetchData(registrarCollege);
    } catch (error) {
      console.error("Error saving course:", error);
      toast.error(`Error saving course: ${error instanceof Error ? error.message : error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure? This will not delete associated course units."))
      return;
    try {
      await del(`/courses/${id}/`);
      toast.success("Course deleted");
      if (registrarCollege) fetchData(registrarCollege);
    } catch (error) {
      toast.error("Error deleting course");
    }
  };

  // Course Unit Actions
  const handleSaveCU = async () => {
    try {
      if (modalMode === "add") {
        await post("/course-units/", cuForm);
        toast.success("Course Unit added");
      } else if (selectedCU) {
        await put(`/course-units/${selectedCU.id}/`, cuForm);
        toast.success("Course Unit updated");
      }
      setIsCUModalOpen(false);
      if (registrarCollege) fetchData(registrarCollege);
    } catch (error) {
      toast.error("Error saving unit");
    }
  };

  const handleDeleteCU = async (id: string) => {
    if (!confirm("Delete this course unit?")) return;
    try {
      await del(`/course-units/${id}/`);
      toast.success("Unit deleted");
      if (registrarCollege) fetchData(registrarCollege);
    } catch (error) {
      toast.error("Error deleting unit");
    }
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredUnits = courseUnits.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold font-display">
                Academic Programs
              </h1>
            </div>
            <p className="text-muted-foreground">
              Managing records for {registrarCollege || "Loading..."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeTab === "courses" ? "default" : "outline"}
              onClick={() => setActiveTab("courses")}
              className="rounded-xl"
            >
              Courses
            </Button>
            <Button
              variant={activeTab === "units" ? "default" : "outline"}
              onClick={() => setActiveTab("units")}
              className="rounded-xl"
            >
              Course Units
            </Button>
          </div>
        </div>

        {/* Search and Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 rounded-xl border-border/40"
            />
          </div>
          <Button
            onClick={() => {
              setModalMode("add");
              if (activeTab === "courses") {
                setCourseForm({
                  code: "",
                  name: "",
                  department: "",
                  duration_years: 3,
                });
                setFeeEntries([]);
                setIsCourseModalOpen(true);
              } else {
                setSelectedCourseForUnits(null);
                setCuForm({
                  code: "",
                  name: "",
                  course_id: "",
                  semester: 1,
                  year: 1,
                  credits: 3,
                });
                setIsCUModalOpen(true);
              }
            }}
            className="gap-2 h-11 px-6 rounded-xl shadow-primary w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add {activeTab === "courses" ? "Course" : "Unit"}
          </Button>
        </div>

        {/* College Setup */}
        {showCollegeSetup && (
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-8 text-center space-y-4">
            <Building className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">Set Your College</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your account needs a college assignment to manage courses. Enter your college name below.
            </p>
            <div className="flex gap-2 max-w-sm mx-auto">
              <Input
                placeholder="e.g., Nexus University"
                value={collegeInput}
                onChange={(e) => setCollegeInput(e.target.value)}
              />
              <Button onClick={handleSetCollege}>Set College</Button>
            </div>
          </div>
        )}

        {!showCollegeSetup && (
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          {activeTab === "courses" ? (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((c) => (
                    <TableRow
                      key={c.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="font-mono font-medium">
                        {c.code}
                      </TableCell>
                      <TableCell className="font-semibold">{c.name}</TableCell>
                      <TableCell>{c.department}</TableCell>
                      <TableCell>{c.duration_years} Years</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedCourse(c);
                              setCourseForm({
                                code: c.code,
                                name: c.name,
                                department: c.department,
                                duration_years: c.duration_years,
                              });
                              setFeeEntries(typeof c.fee_structure === 'string' ? JSON.parse(c.fee_structure || '[]') : (c.fee_structure || []));
                              setModalMode("edit");
                              setIsCourseModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCourse(c.id)}
                          >
                            <Trash2 className="h-4 w-4 text-rose-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No courses found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Unit Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Sem/Year</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.length > 0 ? (
                  filteredUnits.map((u) => (
                    <TableRow
                      key={u.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="font-mono font-medium">
                        {u.code}
                      </TableCell>
                      <TableCell className="font-semibold">{u.name}</TableCell>
                      <TableCell className="text-xs">{u.course_name}</TableCell>
                      <TableCell>
                        Y{u.year} S{u.semester}
                      </TableCell>
                      <TableCell>{u.credits}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedCU(u);
                              const course = courses.find(
                                (c) => c.id === u.course_id,
                              );
                              setSelectedCourseForUnits(course || null);
                              setCuForm({
                                code: u.code,
                                name: u.name,
                                course_id: u.course_id,
                                semester: u.semester,
                                year: u.year,
                                credits: u.credits,
                              });
                              setModalMode("edit");
                              setIsCUModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCU(u.id)}
                          >
                            <Trash2 className="h-4 w-4 text-rose-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No course units found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
        )}

        {/* Course Modal */}
        <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
          <DialogContent className="w-[95vw] sm:max-w-2xl rounded-2xl border-none shadow-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                {modalMode === "add" ? "Add New Course" : "Edit Course"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Course Code</Label>
                  <Input
                    value={courseForm.code}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, code: e.target.value })
                    }
                    placeholder="e.g., BSCS"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (Years)</Label>
                  <Input
                    type="number"
                    value={courseForm.duration_years}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        duration_years: Number.isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Course Name</Label>
                <Input
                  value={courseForm.name}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, name: e.target.value })
                  }
                  placeholder="e.g., Bachelor of Computer Science"
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={courseForm.department}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, department: e.target.value })
                  }
                  placeholder="e.g., Computing"
                />
              </div>

              {/* Fee Structure Section */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2 text-base font-semibold">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Fee Structure (Tuition, Recess, Functional Fees per
                    Semester)
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFeeEntry}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add for Academic Year
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Define tuition, recess (if any), and functional fees for each
                  academic year and semester.
                </p>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                  {feeEntries.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                      No fee structure added. Click &quot;Add for Academic
                      Year&quot; to set tuition and functional fees.
                    </p>
                  ) : (
                    feeEntries.map((entry, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-border bg-muted/30 p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <Select
                            value={entry.academic_year}
                            onValueChange={(v) =>
                              updateFeeEntry(idx, "academic_year", v)
                            }
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue placeholder="Academic Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {ACADEMIC_YEARS.map((y) => (
                                <SelectItem
                                  key={y}
                                  value={y}
                                  disabled={feeEntries.some(
                                    (e, i) =>
                                      i !== idx && e.academic_year === y,
                                  )}
                                >
                                  {y}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFeeEntry(idx)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Sem 1 Tuition</Label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={entry.semester_1_tuition ?? ""}
                              onChange={(e) =>
                                updateFeeEntry(
                                  idx,
                                  "semester_1_tuition",
                                  Number.isNaN(e.target.valueAsNumber) ? null : e.target.valueAsNumber,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Sem 2 Tuition</Label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={entry.semester_2_tuition ?? ""}
                              onChange={(e) =>
                                updateFeeEntry(
                                  idx,
                                  "semester_2_tuition",
                                  Number.isNaN(e.target.valueAsNumber) ? null : e.target.valueAsNumber,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Recess (if any)</Label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={entry.recess ?? ""}
                              onChange={(e) =>
                                updateFeeEntry(
                                  idx,
                                  "recess",
                                  Number.isNaN(e.target.valueAsNumber) ? null : e.target.valueAsNumber,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Sem 1 Functional</Label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={entry.semester_1_functional ?? ""}
                              onChange={(e) =>
                                updateFeeEntry(
                                  idx,
                                  "semester_1_functional",
                                  Number.isNaN(e.target.valueAsNumber) ? null : e.target.valueAsNumber,
                                )
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Sem 2 Functional</Label>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={entry.semester_2_functional ?? ""}
                              onChange={(e) =>
                                updateFeeEntry(
                                  idx,
                                  "semester_2_functional",
                                  Number.isNaN(e.target.valueAsNumber) ? null : e.target.valueAsNumber,
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCourseModalOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCourse}
                className="shadow-primary px-8"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Course"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Course Unit Modal */}
        <Dialog open={isCUModalOpen} onOpenChange={setIsCUModalOpen}>
          <DialogContent className="rounded-2xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {modalMode === "add" ? "Add Course Unit" : "Edit Course Unit"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Unit Code</Label>
                  <Input
                    value={cuForm.code}
                    onChange={(e) =>
                      setCuForm({ ...cuForm, code: e.target.value })
                    }
                    placeholder="e.g., CSC1101"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Credits</Label>
                  <Input
                    type="number"
                    value={cuForm.credits}
                    onChange={(e) =>
                      setCuForm({
                        ...cuForm,
                        credits: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Unit Name</Label>
                <Input
                  value={cuForm.name}
                  onChange={(e) =>
                    setCuForm({ ...cuForm, name: e.target.value })
                  }
                  placeholder="e.g., Introduction to Programming"
                />
              </div>
              <div className="space-y-2">
                <Label>Belongs to Course</Label>
                <Select
                  value={cuForm.course_id ? String(cuForm.course_id) : ""}
                  onValueChange={(val) => {
                    const course = courses.find((c) => c.id === Number(val));
                    setSelectedCourseForUnits(course || null);
                    setCuForm({ ...cuForm, course_id: Number(val) });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select
                    value={cuForm.year.toString()}
                    onValueChange={(val) =>
                      setCuForm({ ...cuForm, year: parseInt(val) })
                    }
                    disabled={!selectedCourseForUnits}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCourseForUnits ? (
                        Array.from(
                          { length: selectedCourseForUnits.duration_years },
                          (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              Year {i + 1}
                            </SelectItem>
                          ),
                        )
                      ) : (
                        <SelectItem value="1">Year 1</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Select
                    value={cuForm.semester.toString()}
                    onValueChange={(val) =>
                      setCuForm({ ...cuForm, semester: parseInt(val) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semester 1</SelectItem>
                      <SelectItem value="2">Semester 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCUModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCU} className="shadow-primary px-8">
                Save Unit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
