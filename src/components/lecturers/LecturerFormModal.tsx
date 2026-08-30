import { useState, useEffect } from "react";
import { Lecturer, LecturerStatus } from "@/types/lecturer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Upload, UserCheck, Plus } from "lucide-react";
import { toast } from "sonner";
import { uploadFile, get, post } from "@/lib/api";

interface LecturerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lecturer: Partial<Lecturer>) => void;
  lecturer?: Lecturer | null;
  mode: "add" | "edit";
}

const statuses: LecturerStatus[] = ["Active", "Inactive", "Retired"];

export function LecturerFormModal({
  isOpen,
  onClose,
  onSubmit,
  lecturer,
  mode,
}: LecturerFormModalProps) {
  const [formData, setFormData] = useState<Partial<Lecturer>>({
    lecturer_number: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    department: "",
    specialization: "",
    employment_date: new Date().toISOString().split("T")[0],
    status: "Active",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Department and specialization from API
  const [departments, setDepartments] = useState<string[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [newDepartment, setNewDepartment] = useState("");
  const [newSpecialization, setNewSpecialization] = useState("");
  const [showNewDeptInput, setShowNewDeptInput] = useState(false);
  const [showNewSpecInput, setShowNewSpecInput] = useState(false);
  const [addingDept, setAddingDept] = useState(false);
  const [addingSpec, setAddingSpec] = useState(false);

  // Fetch departments and specializations from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [depts, specs] = await Promise.all([
          get<{ id: number; name: string; faculty: string }[]>("/departments"),
          get<{ id: number; name: string; department: string }[]>("/specializations"),
        ]);
        setDepartments(depts.map((d) => d.name));
        setSpecializations(specs.map((s) => s.name));
      } catch (error) {
        console.error("Failed to fetch departments/specializations:", error);
      }
    };
    if (isOpen) fetchData();
  }, [isOpen]);

  useEffect(() => {
    if (lecturer && mode === "edit") {
      setFormData(lecturer);
    } else {
      setFormData({
        lecturer_number: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        bio: "",
        department: "",
        specialization: "",
        employment_date: new Date().toISOString().split("T")[0],
        status: "Active",
        avatar_url: "",
      });
    }
    setSelectedFile(null);
    setImagePreview(null);
    setShowNewDeptInput(false);
    setShowNewSpecInput(false);
    setNewDepartment("");
    setNewSpecialization("");
  }, [lecturer, mode, isOpen]);

  const handleAddDepartment = async () => {
    if (!newDepartment.trim()) return;
    setAddingDept(true);
    try {
      await post("/departments", { name: newDepartment.trim() });
      setDepartments((prev) => [...prev, newDepartment.trim()].sort());
      setFormData({ ...formData, department: newDepartment.trim() });
      setNewDepartment("");
      setShowNewDeptInput(false);
      toast.success("Department added");
    } catch (error: any) {
      toast.error(error.message || "Failed to add department");
    } finally {
      setAddingDept(false);
    }
  };

  const handleAddSpecialization = async () => {
    if (!newSpecialization.trim()) return;
    setAddingSpec(true);
    try {
      await post("/specializations", { name: newSpecialization.trim() });
      setSpecializations((prev) => [...prev, newSpecialization.trim()].sort());
      setFormData({ ...formData, specialization: newSpecialization.trim() });
      setNewSpecialization("");
      setShowNewSpecInput(false);
      toast.success("Specialization added");
    } catch (error: any) {
      toast.error(error.message || "Failed to add specialization");
    } finally {
      setAddingSpec(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return null;
    setUploading(true);
    try {
      const { url } = await uploadFile("/upload", selectedFile);
      return url;
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload image");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let avatarUrl = formData.avatar_url;
    if (selectedFile) {
      avatarUrl = await uploadImage();
      if (!avatarUrl) return;
    }
    onSubmit({ ...formData, avatar_url: avatarUrl });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Lecturer" : "Edit Lecturer"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lecturer_number">Lecturer Number</Label>
              <Input
                id="lecturer_number"
                value={formData.lecturer_number}
                onChange={(e) =>
                  setFormData({ ...formData, lecturer_number: e.target.value })
                }
                placeholder="LEC-2024-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: LecturerStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                placeholder="John"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="john.doe@university.edu"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="123 University Street, City, State"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              {showNewDeptInput ? (
                <div className="flex gap-2">
                  <Input
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="Enter new department"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddDepartment())}
                  />
                  <Button type="button" size="sm" onClick={handleAddDepartment} disabled={addingDept}>
                    {addingDept ? "..." : "Add"}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => { setShowNewDeptInput(false); setNewDepartment(""); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select
                    value={formData.department}
                    onValueChange={(value) =>
                      setFormData({ ...formData, department: value })
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowNewDeptInput(true)}
                    className="shrink-0"
                    title="Add new department"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialization">Specialization</Label>
              {showNewSpecInput ? (
                <div className="flex gap-2">
                  <Input
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    placeholder="Enter new specialization"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSpecialization())}
                  />
                  <Button type="button" size="sm" onClick={handleAddSpecialization} disabled={addingSpec}>
                    {addingSpec ? "..." : "Add"}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => { setShowNewSpecInput(false); setNewSpecialization(""); }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Select
                    value={formData.specialization}
                    onValueChange={(value) =>
                      setFormData({ ...formData, specialization: value })
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowNewSpecInput(true)}
                    className="shrink-0"
                    title="Add new specialization"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="employment_date">Employment Date</Label>
            <Input
              id="employment_date"
              type="date"
              value={formData.employment_date}
              onChange={(e) =>
                setFormData({ ...formData, employment_date: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biography</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Brief biography or professional summary..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Profile Photo</Label>
            <div className="flex flex-col sm:flex-row items-start gap-6 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary/50 transition-colors">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : formData.avatar_url ? (
                    <img
                      src={formData.avatar_url}
                      alt="Current profile photo"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center border-4 border-white shadow-lg">
                      <UserCheck className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  {(selectedFile || formData.avatar_url) && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                      <Upload className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {imagePreview
                    ? "Preview"
                    : formData.avatar_url
                      ? "Current photo"
                      : "No photo uploaded"}
                </p>
              </div>

              <div className="flex-1 space-y-3 w-full min-w-0">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Upload New Photo
                  </Label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label
                      htmlFor="avatar"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer transition-colors shrink-0"
                    >
                      <Upload className="w-4 h-4" />
                      Choose File
                    </label>
                    <input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <span className="text-sm text-muted-foreground truncate min-w-0">
                      {selectedFile ? selectedFile.name : "No file chosen"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: JPG, PNG, GIF. Max size: 10MB
                  </p>
                </div>

                {selectedFile && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="File preview"
                          className="w-10 h-10 rounded-lg object-cover border border-blue-300 dark:border-blue-700 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB •
                          Ready to upload
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          setImagePreview(null);
                        }}
                        className="text-blue-600 hover:text-blue-800 shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {uploading && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full shrink-0"></div>
                      <div>
                        <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                          Uploading photo...
                        </p>
                        <p className="text-xs text-orange-600 dark:text-orange-400">
                          Please wait while we process your image
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploading}
              className="w-full sm:w-auto"
            >
              {mode === "add" ? "Add Lecturer" : "Update Lecturer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
