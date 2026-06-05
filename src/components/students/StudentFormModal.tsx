import { useState, useEffect } from "react";
import { Student, StudentStatus } from "@/types/student";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { X, Upload } from "lucide-react";
import {
  auth,
  db,
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "@/lib/firebase";
import { toast } from "sonner";

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (student: Partial<Student>) => void;
  student?: Student | null;
  mode: "add" | "edit";
}

const programs = [
  // Undergraduate Degrees
  "Bachelor of Science (BSc)",
  "Bachelor of Arts (BA)",
  "Bachelor of Commerce (BCom)",
  "Bachelor of Business Administration (BBA)",
  "Bachelor of Engineering (BEng)",
  "Bachelor of Technology (BTech)",
  "Bachelor of Medicine, Bachelor of Surgery (MBBS)",
  "Bachelor of Dental Surgery (BDS)",
  "Bachelor of Pharmacy (BPharm)",
  "Bachelor of Nursing (BN)",
  "Bachelor of Laws (LLB)",
  "Bachelor of Education (BEd)",
  "Bachelor of Fine Arts (BFA)",
  "Bachelor of Architecture (BArch)",
  "Bachelor of Veterinary Science (BVSc)",
  "Bachelor of Agriculture (BAgri)",
  "Bachelor of Social Work (BSW)",
  "Bachelor of Journalism (BJ)",
  "Bachelor of Tourism and Hospitality Management",

  // Postgraduate Degrees
  "Master of Science (MSc)",
  "Master of Arts (MA)",
  "Master of Business Administration (MBA)",
  "Master of Commerce (MCom)",
  "Master of Engineering (MEng)",
  "Master of Technology (MTech)",
  "Master of Medicine (MM)",
  "Master of Surgery (MS)",
  "Master of Pharmacy (MPharm)",
  "Master of Public Health (MPH)",
  "Master of Laws (LLM)",
  "Master of Education (MEd)",
  "Master of Fine Arts (MFA)",
  "Master of Architecture (MArch)",
  "Master of Social Work (MSW)",
  "Master of Journalism (MJ)",
  "Master of International Relations",
  "Master of Development Studies",
  "Master of Environmental Science",

  // Doctoral Degrees
  "Doctor of Philosophy (PhD)",
  "Doctor of Medicine (MD)",
  "Doctor of Dental Surgery (DDS)",
  "Doctor of Veterinary Medicine (DVM)",
  "Doctor of Education (EdD)",
  "Doctor of Business Administration (DBA)",
  "Doctor of Laws (LLD)",
  "Doctor of Science (DSc)",
  "Doctor of Letters (DLitt)",

  // Professional Degrees
  "Juris Doctor (JD)",
  "Doctor of Pharmacy (PharmD)",
  "Doctor of Physical Therapy (DPT)",
  "Doctor of Optometry (OD)",
  "Doctor of Chiropractic (DC)",
  "Doctor of Audiology (AuD)",

  // Diplomas and Certificates
  "Diploma in Business Administration",
  "Diploma in Information Technology",
  "Diploma in Nursing",
  "Diploma in Education",
  "Diploma in Journalism",
  "Certificate in Computer Applications",
  "Certificate in Project Management",
  "Certificate in Digital Marketing",

  // Specialized Programs
  "Executive MBA",
  "Postgraduate Diploma in Education",
  "Postgraduate Diploma in Business",
  "Advanced Diploma in Engineering",
  "Associate Degree in Arts",
  "Associate Degree in Science",
  "Foundation Program",
  "Pre-Medical Program",
  "Pre-Law Program",

  // Professional Certifications
  "Chartered Accountant (CA)",
  "Certified Public Accountant (CPA)",
  "Project Management Professional (PMP)",
  "Cisco Certified Network Associate (CCNA)",
  "Microsoft Certified Solutions Expert (MCSE)",
  "AWS Certified Solutions Architect",
  "Google Cloud Professional Cloud Architect",
];

const statuses: StudentStatus[] = [
  "Active",
  "Inactive",
  "Graduated",
  "Suspended",
];

export function StudentFormModal({
  isOpen,
  onClose,
  onSubmit,
  student,
  mode,
}: StudentFormModalProps) {
  const [formData, setFormData] = useState<Partial<Student>>({
    student_number: "",
    registration_number: "",
    first_name: "",
    last_name: "",
    email: "",
    department: "",
    program: "",
    year_of_study: 1,
    status: "Active",
    admission_date: new Date().toISOString().split("T")[0],
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (student && mode === "edit") {
      setFormData(student);
    } else {
      setFormData({
        student_number: "",
        registration_number: "",
        first_name: "",
        last_name: "",
        email: "",
        department: "",
        program: "",
        year_of_study: 1,
        status: "Active",
        admission_date: new Date().toISOString().split("T")[0],
        avatar_url: "",
      });
    }
    setSelectedFile(null);
  }, [student, mode, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    setUploading(true);
    try {
      const storage = getStorage();
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `student-avatars/${fileName}`;
      const storageRef = ref(storage, filePath);

      await uploadBytes(storageRef, selectedFile);
      const publicUrl = await getDownloadURL(storageRef);

      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(`Failed to upload image: ${error.message || ""}`);
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
      if (!avatarUrl) return; // Upload failed
    }

    onSubmit({ ...formData, avatar_url: avatarUrl });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-lg sm:text-xl">
            {mode === "add" ? "Add New Student" : "Edit Student"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="student_number">Student Number</Label>
              <Input
                id="student_number"
                value={formData.student_number}
                onChange={(e) =>
                  setFormData({ ...formData, student_number: e.target.value })
                }
                placeholder="STU-2024-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration_number">Registration Number</Label>
              <Input
                id="registration_number"
                value={formData.registration_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    registration_number: e.target.value,
                  })
                }
                placeholder="REG-2024-001"
                required
              />
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
            <Label htmlFor="avatar">Student Image</Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-auto">
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer w-full sm:w-auto"
                />
                {selectedFile && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              {formData.avatar_url && (
                <img
                  src={formData.avatar_url}
                  alt="Current avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-border"
                />
              )}
            </div>
            {uploading && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Uploading image...
              </div>
            )}
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
              <Label htmlFor="department">Faculty</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder="Enter faculty name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <Select
                value={formData.program}
                onValueChange={(value) =>
                  setFormData({ ...formData, program: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((prog) => (
                    <SelectItem key={prog} value={prog}>
                      {prog}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year_of_study">Year of Study</Label>
              <Select
                value={String(formData.year_of_study)}
                onValueChange={(value) =>
                  setFormData({ ...formData, year_of_study: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      Year {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as StudentStatus })
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
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="admission_date">Admission Date</Label>
              <Input
                id="admission_date"
                type="date"
                value={formData.admission_date}
                onChange={(e) =>
                  setFormData({ ...formData, admission_date: e.target.value })
                }
                required
              />
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
            <Button type="submit" className="w-full sm:w-auto">
              {mode === "add" ? "Add Student" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
