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
  Phone,
  MapPin,
  FileText,
  Award,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  Inactive: "bg-slate-100 text-slate-600 border-slate-200",
  Suspended: "bg-amber-500/10 text-amber-600 border-amber-200",
  Graduated: "bg-blue-500/10 text-blue-600 border-blue-200",
  Withdrawn: "bg-rose-500/10 text-rose-600 border-rose-200",
  SUBMITTED: "bg-sky-500/10 text-sky-600 border-sky-200",
  PENDING: "bg-amber-500/10 text-amber-600 border-amber-200",
  ADMITTED: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  REJECTED: "bg-rose-500/10 text-rose-600 border-rose-200",
  WAITLISTED: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
  DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Active":
    case "ADMITTED":
      return <CheckCircle2 className="h-4 w-4" />;
    case "Inactive":
    case "Withdrawn":
    case "REJECTED":
      return <XCircle className="h-4 w-4" />;
    case "Suspended":
    case "WAITLISTED":
    case "PENDING":
      return <Clock className="h-4 w-4" />;
    case "Graduated":
      return <GraduationCap className="h-4 w-4" />;
    default:
      return null;
  }
};

function Field({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: any;
  label: string;
  value?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </p>
        <p
          className={cn(
            "font-semibold text-foreground break-words",
            mono && "font-mono text-sm",
          )}
        >
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  color,
  children,
}: {
  icon: any;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
      <h3 className="text-lg font-bold flex items-center gap-2.5 text-foreground px-1">
        <div className={cn("p-1.5 rounded-lg", color)}>
          <Icon className="h-5 w-5" />
        </div>
        {title}
      </h3>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 space-y-4">{children}</div>
      </div>
    </div>
  );
}

function parseJsonList(str?: string): any[] {
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseQualificationResults(str?: string) {
  return parseJsonList(str);
}

const APPLICATION_STATUS = [
  "SUBMITTED",
  "ADMITTED",
  "REJECTED",
  "WAITLISTED",
  "DRAFT",
];

export function StudentViewModal({
  isOpen,
  onClose,
  student,
}: StudentViewModalProps) {
  if (!student) return null;
  const isNap = student.source === "nap";

  const fullName = [
    student.first_name,
    student.other_names,
    student.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const status =
    student.status ||
    (isNap ? student.review_status || "SUBMITTED" : "Active");
  const statusKey = APPLICATION_STATUS.includes(status) ? status : status;
  const badgeStyle =
    statusStyles[statusKey] || statusStyles.Active || statusStyles.Inactive;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl lg:max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0 border-none bg-background shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-display text-2xl flex items-center gap-3 text-foreground">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <User className="h-6 w-6 text-primary" />
            </div>
            {isNap ? "Applicant Profile" : "Student Profile"}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                <AvatarImage
                  src={student.avatar_url || student.passport_photo_url}
                  alt={fullName}
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
                    ["Active", "ADMITTED"].includes(status)
                      ? "bg-emerald-500"
                      : "bg-slate-300",
                  )}
                />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  {fullName}
                </h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-muted-foreground font-medium">
                  <div className="flex items-center gap-1.5">
                    <Hash className="h-4 w-4 text-primary/70" />
                    <span>{student.prn || student.student_number}</span>
                  </div>
                  {student.email && (
                    <>
                      <div className="h-1 w-1 rounded-full bg-slate-300 hidden sm:block" />
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-4 w-4 text-primary/70" />
                        <span>{student.email}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <Badge
                  variant="outline"
                  className={cn(
                    "px-3 py-1 flex items-center gap-1.5 text-sm font-semibold rounded-full border shadow-sm",
                    badgeStyle,
                  )}
                >
                  {getStatusIcon(status)}
                  {status}
                </Badge>
                {isNap ? (
                  student.assigned_programme && (
                    <Badge
                      variant="secondary"
                      className="px-3 py-1 rounded-full font-medium text-sm"
                    >
                      {student.assigned_programme}
                    </Badge>
                  )
                ) : (
                  <Badge
                    variant="secondary"
                    className="px-3 py-1 rounded-full font-medium text-sm"
                  >
                    Year {student.year_of_study}
                  </Badge>
                )}
              </div>

              {isNap && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                  <MiniStat label="Application" value={student.application_type} />
                  <MiniStat label="Entry Scheme" value={student.entry_scheme} />
                  <MiniStat label="Academic Year" value={student.academic_year} />
                  <MiniStat label="Study Mode" value={student.study_mode} />
                </div>
              )}
            </div>
          </div>

          {isNap ? (
            <div className="grid grid-cols-1 gap-8">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SectionCard
                  icon={User}
                  title="Personal Information"
                  color="bg-slate-100 text-slate-600"
                >
                  <Field icon={Hash} label="PRN" value={student.prn} mono />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={Phone}
                    label="Phone"
                    value={student.phone_number}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={User}
                    label="Gender"
                    value={student.gender}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={Calendar}
                    label="Date of Birth"
                    value={formatDate(student.date_of_birth)}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={User}
                    label="Marital Status"
                    value={student.marital_status}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={User}
                    label="Nationality"
                    value={student.nationality}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={User}
                    label="ID / Passport"
                    value={student.birth_certificate_or_national_id_details}
                    mono
                  />
                </SectionCard>

                <SectionCard
                  icon={MapPin}
                  title="Address"
                  color="bg-orange-50 text-orange-600"
                >
                  <Field icon={MapPin} label="Address" value={student.address} />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={MapPin}
                    label="Postal Address"
                    value={student.postal_address}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={MapPin}
                    label="City"
                    value={student.city}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={MapPin}
                    label="District"
                    value={student.district}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={MapPin}
                    label="Subcounty"
                    value={student.subcounty}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={MapPin}
                    label="Village"
                    value={student.village}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={MapPin}
                    label="Country"
                    value={student.country}
                  />
                </SectionCard>
              </div>

              {/* Academic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SectionCard
                  icon={GraduationCap}
                  title="Academic Details"
                  color="bg-blue-50 text-blue-600"
                >
                  <Field
                    icon={BookOpen}
                    label="Program Choice 1"
                    value={student.program_choice_1}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={BookOpen}
                    label="Program Choice 2"
                    value={student.program_choice_2}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={BookOpen}
                    label="Program Choice 3"
                    value={student.program_choice_3}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={BookOpen}
                    label="Program Choice 4"
                    value={student.program_choice_4}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={Building}
                    label="Assigned Programme"
                    value={student.assigned_programme}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={Award}
                    label="Weighted Score"
                    value={formatScore(student.total_weight_score)}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={GraduationCap}
                    label="Previous Institution"
                    value={student.previous_institution}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={GraduationCap}
                    label="Highest Qualification"
                    value={student.highest_qualification}
                  />
                </SectionCard>

                <SectionCard
                  icon={FileText}
                  title="UCE / O-Level"
                  color="bg-emerald-50 text-emerald-600"
                >
                  <Field
                    icon={Hash}
                    label="Index Number"
                    value={student.uce_index_number}
                    mono
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={Calendar}
                    label="Year of Sitting"
                    value={student.uce_year_of_sitting}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={Award}
                    label="Total Aggregates"
                    value={student.uce_total_aggregates}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={Award}
                    label="Division"
                    value={student.uce_division}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={Building}
                    label="School"
                    value={student.o_level_school_name}
                  />
                  <Separator className="bg-slate-50" />
                  <SubjectsList
                    label="O-Level Subjects"
                    data={student.o_level_subjects}
                  />
                </SectionCard>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SectionCard
                  icon={FileText}
                  title="UACE / A-Level"
                  color="bg-violet-50 text-violet-600"
                >
                  <Field
                    icon={Hash}
                    label="Index Number"
                    value={student.uace_index_number}
                    mono
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={Calendar}
                    label="Year of Sitting"
                    value={student.uace_year_of_sitting}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={Award}
                    label="Total Points"
                    value={student.uace_total_points}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={Award}
                    label="General Paper"
                    value={student.uace_general_paper_grade}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={User}
                    label="ICT / Sub-Math"
                    value={`${student.uace_ict_or_sub_math_subject} ${
                      student.uace_ict_or_sub_math_grade || ""
                    }`}
                  />
                  <Separator className="bg-slate-50" />
                  <SubjectsList
                    label="Principal Subjects"
                    data={student.uace_principal_subjects}
                  />
                </SectionCard>

                <SectionCard
                  icon={CreditCard}
                  title="Application & Review"
                  color="bg-rose-50 text-rose-600"
                >
                  <Field
                    icon={CheckCircle2}
                    label="Email Verified"
                    value={student.email_verified ? "Yes" : "No"}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={Clock}
                    label="Submitted"
                    value={formatDateTime(student.submitted_at)}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={Clock}
                    label="Reviewed"
                    value={formatDateTime(student.reviewed_at)}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={User}
                    label="Review Status"
                    value={student.review_status}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={FileText}
                    label="Reviewer Notes"
                    value={student.reviewer_notes}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={CreditCard}
                    label="Fee Paid"
                    value={student.application_fee_paid ? "Yes" : "No"}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={CreditCard}
                    label="Payment Method"
                    value={student.payment_method}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={Hash}
                    label="Payment Reference"
                    value={student.payment_reference}
                    mono
                  />
                </SectionCard>
              </div>

              {/* Qualification results */}
              <QualificationPanel data={student.qualification_results} />

              {/* Guardian */}
              {student.guardian_name && (
                <SectionCard
                  icon={User}
                  title="Guardian / Next of Kin"
                  color="bg-cyan-50 text-cyan-600"
                >
                  <Field
                    icon={User}
                    label="Name"
                    value={student.guardian_name}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={User}
                    label="Type"
                    value={student.guardian_type}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={Phone}
                    label="Phone"
                    value={student.guardian_phone}
                  />
                  <Separator className="bg-slate-50" />
                  <Field
                    icon={User}
                    label="Relationship"
                    value={student.next_of_kin_relationship}
                  />
                </SectionCard>
              )}

              {/* Personal statement */}
              {student.personal_statement && (
                <SectionCard
                  icon={FileText}
                  title="Personal Statement"
                  color="bg-indigo-50 text-indigo-600"
                >
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {student.personal_statement}
                  </p>
                </SectionCard>
              )}
            </div>
          ) : (
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MiniStat({ label, value }: { label: string; value?: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-100 px-3 py-2 text-center">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-semibold text-foreground truncate">
        {value || "—"}
      </p>
    </div>
  );
}

function SubjectsList({ label, data }: { label: string; data?: string }) {
  const items = parseJsonList(data);
  if (items.length === 0) return null;
  return (
    <div className="flex items-start gap-3">
      <Award className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          {label}
        </p>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-sm">
            <tbody>
              {items.map((s, i) => (
                <tr
                  key={i}
                  className={cn(
                    "flex items-center justify-between px-3 py-1.5",
                    i % 2 === 0 ? "bg-white" : "bg-slate-50/60",
                  )}
                >
                  <td className="font-medium text-foreground">
                    {s.subject || s.name}
                  </td>
                  <td className="text-muted-foreground">
                    {s.grade || s.gradePoints || ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function QualificationPanel({ data }: { data?: string }) {
  const quals = parseQualificationResults(data).filter(
    (q) => q.qualified === true,
  );
  if (quals.length === 0) return null;
  return (
    <SectionCard
      icon={Award}
      title="Programme Qualification"
      color="bg-amber-50 text-amber-600"
    >
      <div className="space-y-3">
        {quals.map((q, i) => (
          <div
            key={i}
            className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="font-semibold text-foreground text-sm">
                {q.programmeName || q.code}
              </p>
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 border-emerald-200"
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Qualified
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {q.totalScore ?? "—"}
                </span>{" "}
                / cutoff{" "}
                <span className="font-semibold text-foreground">
                  {q.cutoffScore ?? "—"}
                </span>
              </p>
              <p className="text-muted-foreground">
                O-Level{" "}
                <span className="font-semibold text-foreground">
                  {q.oLevelScore ?? "—"}
                </span>{" "}
                · A-Level{" "}
                <span className="font-semibold text-foreground">
                  {q.aLevelScore ?? "—"}
                </span>
              </p>
            </div>
            {q.reason && (
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {q.reason}
              </p>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function formatDate(value?: string): string {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function formatDateTime(value?: string): string {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function formatScore(value?: number): string {
  if (value === null || value === undefined) return "";
  return String(value);
}
