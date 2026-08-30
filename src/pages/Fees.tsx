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
import { get, post, put, del } from "@/lib/api";
import { toast } from "sonner";
import { FeeAssignment } from "@/types/fee";

const ACADEMIC_YEARS = ["2025/2026", "2024/2025", "2023/2024", "2022/2023"];

const YEAR_LEVELS = [1, 2, 3, 4, 5];
const SEMESTERS = [1, 2];

const COMMON_FEE_ITEMS = [
  "Development Fee",
  "Registration",
  "Examination",
  "Internship",
  "Technology",
  "Medical Fee",
  "University ID",
  "Library",
  "Research",
  "Academic Gown",
  "Sports Contribution",
  "Endowment Fee",
  "Guild",
  "SCR",
  "Rules Booklet",
  "Caution",
  "Tuition",
];

const COMMON_CATEGORIES = [
  "Functional Fees",
  "Tuition Fees",
  "Administrative Fees",
  "Academic Fees",
  "Other",
];

const FEE_TEMPLATES = [
  {
    label: "Tuition",
    item_name: "Bachelor of Science in Computer Science",
    category: "Tuition Fees",
    amount: "1900000",
  },
  {
    label: "Registration",
    item_name: "Registration",
    category: "Functional Fees",
    amount: "132250",
  },
  {
    label: "Examination",
    item_name: "Examination",
    category: "Functional Fees",
    amount: "132250",
  },
  {
    label: "Technology",
    item_name: "Technology",
    category: "Functional Fees",
    amount: "66125",
  },
];

export default function Fees() {
  const navigate = useNavigate();
  const [feeAssignments, setFeeAssignments] = useState<FeeAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrarCollege, setRegistrarCollege] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedFee, setSelectedFee] = useState<FeeAssignment | null>(null);

  const [feeForm, setFeeForm] = useState({
    item_name: "",
    category: COMMON_CATEGORIES[0],
    custom_category: "",
    year_level: 1,
    semester: 1,
    academic_year: ACADEMIC_YEARS[0],
    amount: "",
    currency: "UGX",
  });

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      navigate("/");
      return;
    }
    fetchRegistrarData();
  }, [navigate]);

  const fetchRegistrarData = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      const registrar = await get<any>(`/registrars/${userId}/`);
      if (registrar?.college) {
        setRegistrarCollege(registrar.college);
        await fetchData(registrar.college);
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
      const feesData = await get<FeeAssignment[]>(
        `/fee-assignments/?college=${encodeURIComponent(college)}`,
      );
      feesData.sort((a, b) => {
        if (a.year_level !== b.year_level) return a.year_level - b.year_level;
        if (a.semester !== b.semester) return a.semester - b.semester;
        if (a.academic_year !== b.academic_year)
          return b.academic_year.localeCompare(a.academic_year);
        if (a.category !== b.category)
          return a.category.localeCompare(b.category);
        return a.item_name.localeCompare(b.item_name);
      });
      setFeeAssignments(Array.isArray(feesData) ? feesData : []);
    } catch (error) {
      console.error("Error fetching fees:", error);
      toast.error("Failed to load fee assignments");
    }
  };

  const openAddModal = async () => {
    setModalMode("add");
    setSelectedFee(null);
    setFeeForm({
      item_name: "",
      category: COMMON_CATEGORIES[0],
      custom_category: "",
      year_level: 1,
      semester: 1,
      academic_year: ACADEMIC_YEARS[0],
      amount: "",
      currency: "UGX",
    });
    setIsModalOpen(true);
  };

  const openEditModal = async (fee: FeeAssignment) => {
    setModalMode("edit");
    setSelectedFee(fee);
    setFeeForm({
      item_name: fee.item_name,
      category: fee.category,
      custom_category: COMMON_CATEGORIES.includes(fee.category)
        ? ""
        : fee.category,
      year_level: fee.year_level,
      semester: fee.semester,
      academic_year: fee.academic_year,
      amount: String(fee.amount),
      currency: fee.currency || "UGX",
    });
    setIsModalOpen(true);
  };

  const getStructureTotalForForm = () => {
    return feeAssignments
      .filter(
        (fee) =>
          fee.academic_year === feeForm.academic_year &&
          fee.year_level === feeForm.year_level &&
          fee.semester === feeForm.semester,
      )
      .reduce((sum, fee) => {
        if (modalMode === "edit" && selectedFee?.id === fee.id) {
          return sum;
        }
        return sum + Number(fee.amount || 0);
      }, 0);
  };

  const handleSaveFee = async (keepOpen = false) => {
    const amountNum = parseFloat(feeForm.amount);
    const normalizedCategory = (feeForm.custom_category || feeForm.category)
      .trim()
      .toLowerCase();

    if (
      !feeForm.item_name ||
      !(feeForm.category || feeForm.custom_category) ||
      !feeForm.academic_year ||
      isNaN(amountNum) ||
      amountNum < 0
    ) {
      toast.error("Please fill all fields with valid values.");
      return;
    }

    const duplicateCategoryExists = feeAssignments.some(
      (fee) =>
        fee.academic_year === feeForm.academic_year &&
        fee.year_level === feeForm.year_level &&
        fee.semester === feeForm.semester &&
        fee.category.trim().toLowerCase() === normalizedCategory &&
        fee.id !== selectedFee?.id,
    );

    if (duplicateCategoryExists) {
      toast.error(
        "This category already exists for the selected year/semester. Edit that row instead of adding another one.",
      );
      return;
    }

    try {
      const payload = {
        item_name: feeForm.item_name.trim(),
        category: (feeForm.custom_category || feeForm.category).trim(),
        year_level: feeForm.year_level,
        semester: feeForm.semester,
        academic_year: feeForm.academic_year,
        amount: amountNum,
        currency: feeForm.currency || "UGX",
        college: registrarCollege,
        notes: "",
      };

      if (modalMode === "add") {
        await post("/fee-assignments/", payload);
        toast.success("Fee assigned successfully");
      } else if (selectedFee) {
        await put(`/fee-assignments/${selectedFee.id}/`, payload);
        toast.success("Fee updated successfully");
      }

      if (keepOpen && modalMode === "add") {
        setFeeForm((current) => ({
          ...current,
          item_name: "",
          amount: "",
          currency: "UGX",
        }));
      } else {
        setIsModalOpen(false);
      }
      if (registrarCollege) await fetchData(registrarCollege);
    } catch (error) {
      console.error("Error saving fee:", error);
      toast.error("Failed to save fee assignment");
    }
  };

  const handleDeleteFee = async (id: string) => {
    if (!confirm("Delete this fee assignment?")) return;
    try {
      await del(`/fee-assignments/${id}/`);
      toast.success("Fee assignment deleted");
      if (registrarCollege) await fetchData(registrarCollege);
    } catch (error) {
      console.error("Error deleting fee:", error);
      toast.error("Failed to delete");
    }
  };

  const filteredFees = feeAssignments.filter(
    (f) =>
      f.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.academic_year.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(f.year_level).includes(searchTerm.toLowerCase()) ||
      String(f.semester).includes(searchTerm.toLowerCase()),
  );

  const grandTotal = filteredFees.reduce(
    (sum, fee) => sum + Number(fee.amount || 0),
    0,
  );

  const structureGroups = Object.values(
    filteredFees.reduce(
      (groups, fee) => {
        const key = `${fee.academic_year}|${fee.year_level}|${fee.semester}`;
        if (!groups[key]) {
          groups[key] = {
            academic_year: fee.academic_year,
            year_level: fee.year_level,
            semester: fee.semester,
            items: [] as FeeAssignment[],
            total: 0,
          };
        }
        groups[key].items.push(fee);
        groups[key].total += Number(fee.amount || 0);
        return groups;
      },
      {} as Record<
        string,
        {
          academic_year: string;
          year_level: number;
          semester: number;
          items: FeeAssignment[];
          total: number;
        }
      >,
    ),
  ).sort((a, b) => {
    if (a.year_level !== b.year_level) return a.year_level - b.year_level;
    if (a.semester !== b.semester) return a.semester - b.semester;
    return b.academic_year.localeCompare(a.academic_year);
  });

  const categoryGroups = Object.values(
    filteredFees.reduce(
      (groups, fee) => {
        const key = `${fee.academic_year}|${fee.year_level}|${fee.semester}|${fee.category}`;
        if (!groups[key]) {
          groups[key] = {
            academic_year: fee.academic_year,
            year_level: fee.year_level,
            semester: fee.semester,
            category: fee.category,
            items: [] as FeeAssignment[],
            total: 0,
          };
        }
        groups[key].items.push(fee);
        groups[key].total += Number(fee.amount || 0);
        return groups;
      },
      {} as Record<
        string,
        {
          academic_year: string;
          year_level: number;
          semester: number;
          category: string;
          items: FeeAssignment[];
          total: number;
        }
      >,
    ),
  ).sort((a, b) => {
    if (a.year_level !== b.year_level) return a.year_level - b.year_level;
    if (a.semester !== b.semester) return a.semester - b.semester;
    if (a.academic_year !== b.academic_year) {
      return b.academic_year.localeCompare(a.academic_year);
    }
    return a.category.localeCompare(b.category);
  });

  const activeFormStructureTotal = getStructureTotalForForm();
  const activeFormAmount = Number.parseFloat(feeForm.amount || "0");
  const projectedStructureTotal =
    activeFormStructureTotal +
    (Number.isNaN(activeFormAmount) ? 0 : activeFormAmount);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Fee Structure
            </h1>
            <p className="mt-1 text-muted-foreground">
              Add manual fee items by year, semester, and category, then review
              the total for each structure
            </p>
          </div>
          <Button onClick={openAddModal}>
            <Plus className="h-5 w-5 mr-2" />
            Add Fee Item
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Fee Items</p>
            <div className="mt-2 text-2xl font-bold">{filteredFees.length}</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Grand Total</p>
            <div className="mt-2 text-2xl font-bold">
              UGX {grandTotal.toLocaleString()}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Year/Semester Groups
            </p>
            <div className="mt-2 text-2xl font-bold">
              {structureGroups.length}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {structureGroups.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              No grouped totals yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {structureGroups.map((group) => (
                  <TableRow
                    key={`${group.academic_year}-${group.year_level}-${group.semester}`}
                  >
                    <TableCell>{group.academic_year}</TableCell>
                    <TableCell>Year {group.year_level}</TableCell>
                    <TableCell>Semester {group.semester}</TableCell>
                    <TableCell>{group.items.length}</TableCell>
                    <TableCell className="text-right font-medium">
                      UGX {group.total.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {categoryGroups.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              No category breakdown yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Category Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryGroups.map((group) => (
                  <TableRow
                    key={`${group.academic_year}-${group.year_level}-${group.semester}-${group.category}`}
                  >
                    <TableCell>{group.academic_year}</TableCell>
                    <TableCell>Year {group.year_level}</TableCell>
                    <TableCell>Semester {group.semester}</TableCell>
                    <TableCell>{group.category}</TableCell>
                    <TableCell>{group.items.length}</TableCell>
                    <TableCell className="text-right font-medium">
                      UGX {group.total.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by item, category, year, semester, or academic year..."
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
                No fee items yet
              </h3>
              <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                Add multiple items under the same semester and category. The
                system will calculate the category subtotal and overall total
                automatically.
              </p>
              <Button className="mt-6" onClick={openAddModal}>
                <Plus className="h-5 w-5 mr-2" />
                Add Fee Item
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Year</TableHead>
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
                        <span className="font-medium">{fee.item_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{fee.category}</TableCell>
                    <TableCell>Year {fee.year_level}</TableCell>
                    <TableCell>Semester {fee.semester}</TableCell>
                    <TableCell>{fee.academic_year}</TableCell>
                    <TableCell className="text-right font-medium">
                      {fee.currency || "UGX"}{" "}
                      {Number(fee.amount).toLocaleString()}
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
          <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {modalMode === "add" ? "Add Fee Item" : "Edit Fee Item"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Current semester total
                  </span>
                  <span className="font-semibold">
                    UGX {activeFormStructureTotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Projected total after this item
                  </span>
                  <span className="font-semibold text-primary">
                    UGX {projectedStructureTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {FEE_TEMPLATES.map((template) => (
                  <Button
                    key={template.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFeeForm((current) => ({
                        ...current,
                        item_name: template.item_name,
                        category: template.category,
                        custom_category: "",
                        amount: template.amount,
                      }))
                    }
                  >
                    {template.label}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="item_name">Fee Item</Label>
                <Input
                  id="item_name"
                  list="fee-item-options"
                  placeholder="Type or select a fee item"
                  value={feeForm.item_name}
                  onChange={(e) =>
                    setFeeForm({ ...feeForm, item_name: e.target.value })
                  }
                  required
                />
                <datalist id="fee-item-options">
                  {COMMON_FEE_ITEMS.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={
                    feeForm.custom_category ? "__custom__" : feeForm.category
                  }
                  onValueChange={(value) => {
                    if (value === "__custom__") {
                      setFeeForm({
                        ...feeForm,
                        category: "",
                        custom_category: feeForm.custom_category || "",
                      });
                      return;
                    }

                    setFeeForm({
                      ...feeForm,
                      category: value,
                      custom_category: "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="__custom__">Custom category</SelectItem>
                  </SelectContent>
                </Select>
                {(feeForm.custom_category || feeForm.category === "") && (
                  <Input
                    className="mt-2"
                    placeholder="Type a custom category"
                    value={feeForm.custom_category}
                    onChange={(e) =>
                      setFeeForm({
                        ...feeForm,
                        custom_category: e.target.value,
                      })
                    }
                  />
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select
                    value={String(feeForm.year_level)}
                    onValueChange={(v) =>
                      setFeeForm({ ...feeForm, year_level: parseInt(v, 10) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEAR_LEVELS.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          Year {year}
                        </SelectItem>
                      ))}
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
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEMESTERS.map((semester) => (
                        <SelectItem key={semester} value={String(semester)}>
                          Semester {semester}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                <Label>Currency</Label>
                <Input
                  value={feeForm.currency}
                  onChange={(e) =>
                    setFeeForm({ ...feeForm, currency: e.target.value })
                  }
                  placeholder="UGX"
                />
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
              {modalMode === "add" && (
                <Button variant="secondary" onClick={() => handleSaveFee(true)}>
                  Save & Add Another
                </Button>
              )}
              <Button onClick={() => handleSaveFee()}>
                {modalMode === "add" ? "Add Item" : "Save changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
