import { Student } from "@/types/student";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Calendar,
  GraduationCap,
  Building,
  Hash,
  BookOpen,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

const statusStyles = {
  Active: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  Inactive: "bg-slate-100 text-slate-600 border-slate-200",
  Suspended: "bg-amber-500/10 text-amber-600 border-amber-200",
  Graduated: "bg-blue-500/10 text-blue-600 border-blue-200",
  Withdrawn: "bg-rose-500/10 text-rose-600 border-rose-200",
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Active":
      return <CheckCircle2 className="h-4 w-4" />;
    case "Inactive":
    case "Withdrawn":
      return <XCircle className="h-4 w-4" />;
    case "Suspended":
      return <Clock className="h-4 w-4" />;
    case "Graduated":
      return <GraduationCap className="h-4 w-4" />;
    default:
      return null;
  }
};

export function StudentViewModal({
  isOpen,
  onClose,
  student,
}: StudentViewModalProps) {
  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0 border-none bg-background shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-display text-2xl flex items-center gap-3 text-foreground">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <User className="h-6 w-6 text-primary" />
            </div>
            Student Profile
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                <AvatarImage
                  src={student.avatar_url}
                  alt={`${student.first_name} ${student.last_name}`}
                />
                <AvatarFallback className="text-2xl font-bold bg-primary/5 text-primary">
                  {student.first_name?.[0]}
                  {student.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                <div
                  className={cn(
                    "h-4 w-4 rounded-full border-2 border-white",
                    student.status === "Active"
                      ? "bg-emerald-500"
                      : "bg-slate-300",
                  )}
                />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  {student.first_name} {student.last_name}
                </h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-muted-foreground font-medium">
                  <div className="flex items-center gap-1.5">
                    <Hash className="h-4 w-4 text-primary/70" />
                    <span>{student.student_number}</span>
                  </div>
                  <div className="h-1 w-1 rounded-full bg-slate-300 hidden sm:block" />
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-primary/70" />
                    <span>{student.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <Badge
                  variant="outline"
                  className={cn(
                    "px-3 py-1 flex items-center gap-1.5 text-sm font-semibold rounded-full border shadow-sm",
                    statusStyles[student.status as keyof typeof statusStyles] ||
                      statusStyles.Inactive,
                  )}
                >
                  {getStatusIcon(student.status)}
                  {student.status}
                </Badge>
                <Badge
                  variant="secondary"
                  className="px-3 py-1 rounded-full font-medium text-sm"
                >
                  Year {student.year_of_study}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Academic Information */}
            <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-500">
              <h3 className="text-lg font-bold flex items-center gap-2.5 text-foreground px-1">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                </div>
                Academic Details
              </h3>
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Faculty
                      </p>
                      <p className="font-semibold text-foreground">
                        {student.department}
                      </p>
                    </div>
                  </div>
                  <Separator className="bg-slate-50" />
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Program
                      </p>
                      <p className="font-semibold text-foreground">
                        {student.program}
                      </p>
                    </div>
                  </div>
                  <Separator className="bg-slate-50" />
                  <div className="flex items-start gap-3">
                    <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Reg. Number
                      </p>
                      <p className="font-semibold text-foreground font-mono">
                        {student.registration_number}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* General Information */}
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-lg font-bold flex items-center gap-2.5 text-foreground px-1">
                <div className="p-1.5 bg-orange-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                Important Dates
              </h3>
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Admission Date
                      </p>
                      <p className="font-semibold text-foreground">
                        {student.admission_date
                          ? new Date(student.admission_date).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <Separator className="bg-slate-50" />
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Last Updated
                      </p>
                      <p className="font-semibold text-foreground">
                        {student.updated_at
                          ? new Date(student.updated_at).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                  <Separator className="bg-slate-50" />
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Account Created
                      </p>
                      <p className="font-semibold text-foreground text-sm">
                        {student.created_at
                          ? new Date(student.created_at).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
