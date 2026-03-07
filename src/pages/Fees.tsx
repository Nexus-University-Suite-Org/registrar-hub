import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Search, DollarSign, Edit, Trash2 } from "lucide-react";
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
import { Course } from "@/types/course";
import { FeeAssignment } from "@/types/fee";

const ACADEMIC_YEARS = [
  "2025/2026",
  "2024/2025",
  "2023/2024",
  "2022/2023",
];

export default function Fees() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [feeAssignments, setFeeAssignments] = useState<FeeAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrarCollege, setRegistrarCollege] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedFee, setSelectedFee] = useState<FeeAssignment | null>(null);

  const [feeForm, setFeeForm] = useState({
    course_id: "",
    semester: 1,
    academic_year: ACADEMIC_YEARS[0],
    amount: "",
  });

  useEffect(() => {
    const checkAuth = () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/");
        return;
      }
    };
    checkAuth();
    fetchRegistrarData();
  }, [navigate]);

  const fetchRegistrarData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const registrarDoc = await getDoc(doc(db, "registrars", user.uid));
      if (registrarDoc.exists()) {
        const data = registrarDoc.data();
        const college = data.college;
        setRegistrarCollege(college);
        await fetchData(college);
      }
    } catch (error) {
      console.error("Error fetching registrar data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (college: string) => {
    try {
      const coursesQuery = query(
        collection(db, "courses"),
        where("college", "==", college),
      );
      const coursesSnap = await getDocs(coursesQuery);
      const coursesData = coursesSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Course)
        .sort((a, b) => a.name.localeCompare(b.name));
      setCourses(coursesData);

      const feesQuery = query(
        collection(db, "fee_assignments"),
        where("college", "==", college),
      );
      const feesSnap = await getDocs(feesQuery);
      const feesData = feesSnap.docs
        .map((d) => {
          const data = d.data();
          const course = coursesData.find((c) => c.id === data.course_id);
          return {
            id: d.id,
            ...data,
            course_code: course?.code || data.course_code,
            course_name: course?.name || data.course_name,
          } as FeeAssignment;
        })
        .sort((a, b) => {
          if (a.academic_year !== b.academic_year)
            return b.academic_year.localeCompare(a.academic_year);
          if (a.semester !== b.semester) return a.semester - b.semester;
          return (a.course_name || "").localeCompare(b.course_name || "");
        });
      setFeeAssignments(feesData);
    } catch (error) {
      console.error("Error fetching fees:", error);
      toast.error("Failed to load fee assignments");
    }
  };

  const openAddModal = async () => {
    setModalMode("add");
    setSelectedFee(null);
    setFeeForm({
      course_id: "",
      semester: 1,
      academic_year: ACADEMIC_YEARS[0],
      amount: "",
    });
    setIsModalOpen(true);
    if (registrarCollege) {
      try {
        const coursesQuery = query(
          collection(db, "courses"),
          where("college", "==", registrarCollege),
        );
        const coursesSnap = await getDocs(coursesQuery);
        const coursesData = coursesSnap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Course))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCourses(coursesData);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    }
  };

  const openEditModal = async (fee: FeeAssignment) => {
    setModalMode("edit");
    setSelectedFee(fee);
    setFeeForm({
      course_id: fee.course_id,
      semester: fee.semester,
      academic_year: fee.academic_year,
      amount: String(fee.amount),
    });
    setIsModalOpen(true);
    if (registrarCollege) {
      try {
        const coursesQuery = query(
          collection(db, "courses"),
          where("college", "==", registrarCollege),
        );
        const coursesSnap = await getDocs(coursesQuery);
        const coursesData = coursesSnap.docs
          .map((d) => ({ id: d.id, ...d.data() } as Course))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCourses(coursesData);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    }
  };

  const handleSaveFee = async () => {
    const amountNum = parseFloat(feeForm.amount);
    if (!feeForm.course_id || !feeForm.academic_year || isNaN(amountNum) || amountNum < 0) {
      toast.error("Please fill all fields with valid values.");
      return;
    }

    try {
      const payload = {
        course_id: feeForm.course_id,
        semester: feeForm.semester,
        academic_year: feeForm.academic_year,
        amount: amountNum,
        currency: "UGX",
        college: registrarCollege,
        course_code: courses.find((c) => c.id === feeForm.course_id)?.code,
        course_name: courses.find((c) => c.id === feeForm.course_id)?.name,
      };

      if (modalMode === "add") {
        await addDoc(collection(db, "fee_assignments"), payload);
        toast.success("Fee assigned successfully");
      } else if (selectedFee) {
        await updateDoc(doc(db, "fee_assignments", selectedFee.id), payload);
        toast.success("Fee updated successfully");
      }

      setIsModalOpen(false);
      if (registrarCollege) await fetchData(registrarCollege);
    } catch (error) {
      console.error("Error saving fee:", error);
      toast.error("Failed to save fee assignment");
    }
  };

  const handleDeleteFee = async (id: string) => {
    if (!confirm("Delete this fee assignment?")) return;
    try {
      await deleteDoc(doc(db, "fee_assignments", id));
      toast.success("Fee assignment deleted");
      if (registrarCollege) await fetchData(registrarCollege);
    } catch (error) {
      console.error("Error deleting fee:", error);
      toast.error("Failed to delete");
    }
  };

  const filteredFees = feeAssignments.filter(
    (f) =>
      (f.course_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (f.course_code?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      f.academic_year.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Fee Assignment
            </h1>
            <p className="mt-1 text-muted-foreground">
              Assign fees for each course and semester
            </p>
          </div>
          <Button onClick={openAddModal}>
            <Plus className="h-5 w-5 mr-2" />
            Assign Fee
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by course, code, or academic year..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">
              Loading...
            </div>
          ) : filteredFees.length === 0 ? (
            <div className="p-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent mx-auto mb-6">
                <DollarSign className="h-10 w-10 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                No fee assignments yet
              </h3>
              <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                Assign fees for each course and semester to enable students to
                pay per course and per term.
              </p>
              <Button className="mt-6" onClick={openAddModal}>
                <Plus className="h-5 w-5 mr-2" />
                Assign Fee
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">
                          {fee.course_code} - {fee.course_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>Semester {fee.semester}</TableCell>
                    <TableCell>{fee.academic_year}</TableCell>
                    <TableCell className="text-right font-medium">
                      {fee.currency || "UGX"} {Number(fee.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(fee)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteFee(fee.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {modalMode === "add" ? "Assign Fee" : "Edit Fee"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Course</Label>
                <Select
                  value={feeForm.course_id}
                  onValueChange={(v) =>
                    setFeeForm({ ...feeForm, course_id: v })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.length === 0 ? (
                      <div className="py-6 px-4 text-center text-sm text-muted-foreground">
                        No courses found. Add courses in the Courses page first.
                      </div>
                    ) : (
                      courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.code} - {c.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select
                  value={String(feeForm.semester)}
                  onValueChange={(v) =>
                    setFeeForm({ ...feeForm, semester: parseInt(v, 10) })
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
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Select
                  value={feeForm.academic_year}
                  onValueChange={(v) =>
                    setFeeForm({ ...feeForm, academic_year: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
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
                <Label>Amount (UGX)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="e.g. 1500000"
                  value={feeForm.amount}
                  onChange={(e) =>
                    setFeeForm({ ...feeForm, amount: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveFee}>
                {modalMode === "add" ? "Assign" : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
