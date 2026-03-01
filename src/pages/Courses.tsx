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
} from "lucide-react";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { toast } from "sonner";

interface Course {
  id: string;
  code: string;
  name: string;
  college: string;
  department: string;
  duration_years: number;
}

interface CourseUnit {
  id: string;
  code: string;
  name: string;
  course_id: string;
  course_name?: string;
  semester: number;
  year: number;
  credits: number;
}

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseUnits, setCourseUnits] = useState<CourseUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrarCollege, setRegistrarCollege] = useState<string | null>(null);

  // Modals state
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isCUModalOpen, setIsCUModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
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
    course_id: "",
    semester: 1,
    year: 1,
    credits: 3,
  });

  const [selectedCourseForUnits, setSelectedCourseForUnits] =
    useState<Course | null>(null);

  const [activeTab, setActiveTab] = useState<"courses" | "units">("courses");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchRegistrarData();
  }, []);

  const fetchRegistrarData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const registrarDoc = await getDoc(doc(db, "registrars", user.uid));
      if (registrarDoc.exists()) {
        const data = registrarDoc.data();
        setRegistrarCollege(data.college);
        fetchData(data.college);
      }
    } catch (error) {
      console.error("Error fetching registrar data:", error);
    }
  };

  const fetchData = async (college: string) => {
    setLoading(true);
    try {
      // Fetch Courses for this college
      const coursesQuery = query(
        collection(db, "courses"),
        where("college", "==", college),
      );
      const coursesSnap = await getDocs(coursesQuery);
      const coursesData = coursesSnap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as Course)
        .sort((a, b) => a.name.localeCompare(b.name));
      setCourses(coursesData);

      // Fetch Course Units for these courses
      const unitsSnap = await getDocs(collection(db, "course_units"));
      const unitsData = unitsSnap.docs
        .map((doc) => {
          const data = doc.data();
          const course = coursesData.find((c) => c.id === data.course_id);
          return {
            id: doc.id,
            ...data,
            course_name: course?.name || "Unknown Course",
          } as CourseUnit;
        })
        .filter((unit) => coursesData.some((c) => c.id === unit.course_id)) // Only show units belonging to college's courses
        .sort((a, b) => {
          // Sort by Course Name, then Year, then Semester, then Unit Name
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

  // Course Actions
  const handleSaveCourse = async () => {
    if (!registrarCollege) return;
    try {
      if (modalMode === "add") {
        await addDoc(collection(db, "courses"), {
          ...courseForm,
          college: registrarCollege,
        });
        toast.success("Course added successfully");
      } else if (selectedCourse) {
        await updateDoc(doc(db, "courses", selectedCourse.id), courseForm);
        toast.success("Course updated successfully");
      }
      setIsCourseModalOpen(false);
      fetchData(registrarCollege);
    } catch (error) {
      toast.error("Error saving course");
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure? This will not delete associated course units."))
      return;
    try {
      await deleteDoc(doc(db, "courses", id));
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
        await addDoc(collection(db, "course_units"), cuForm);
        toast.success("Course Unit added");
      } else if (selectedCU) {
        await updateDoc(doc(db, "course_units", selectedCU.id), cuForm);
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
      await deleteDoc(doc(db, "course_units", id));
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

        {/* Content Table */}
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

        {/* Course Modal */}
        <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
          <DialogContent className="rounded-2xl border-none shadow-2xl">
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
                        duration_years: parseInt(e.target.value),
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
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCourseModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveCourse}
                className="shadow-primary px-8"
              >
                Save Course
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
                  value={cuForm.course_id}
                  onValueChange={(val) => {
                    const course = courses.find((c) => c.id === val);
                    setSelectedCourseForUnits(course || null);
                    setCuForm({ ...cuForm, course_id: val });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
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
