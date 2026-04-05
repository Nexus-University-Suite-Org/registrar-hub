import { Student } from "@/types/student";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onView: (student: Student) => void;
}

const statusStyles = {
  Active: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  Inactive: "bg-slate-100 text-slate-600 border-slate-200",
  Suspended: "bg-amber-500/10 text-amber-600 border-amber-200",
  Graduated: "bg-blue-500/10 text-blue-600 border-blue-200",
  Withdrawn: "bg-rose-500/10 text-rose-600 border-rose-200",
};

export function StudentTable({
  students,
  onEdit,
  onDelete,
  onView,
}: StudentTableProps) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Student
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Student No.
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Faculty
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Program
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Year
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((student) => (
              <tr
                key={student.id}
                className="transition-colors hover:bg-muted/30"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {student.avatar_url ? (
                      <img
                        src={student.avatar_url}
                        alt={`${student.first_name} ${student.last_name}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium text-muted-foreground">
                          {student.first_name?.[0]}
                          {student.last_name?.[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {student.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-foreground font-mono">
                  {student.student_number}
                </td>
                <td className="px-6 py-4 text-sm text-foreground">
                  {student.department}
                </td>
                <td className="px-6 py-4 text-sm text-foreground">
                  {student.program}
                </td>
                <td className="px-6 py-4 text-sm text-foreground">
                  Year {student.year_of_study}
                </td>
                <td className="px-6 py-4">
                  <Badge
                    variant="outline"
                    className={cn("font-medium", statusStyles[student.status])}
                  >
                    {student.status}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(student)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(student)}
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(student)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {students.map((student) => (
          <div
            key={student.id}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              {student.avatar_url ? (
                <img
                  src={student.avatar_url}
                  alt={`${student.first_name} ${student.last_name}`}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-muted-foreground">
                    {student.first_name?.[0]}
                    {student.last_name?.[0]}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-foreground truncate">
                      {student.first_name} {student.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {student.email}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium text-xs",
                      statusStyles[student.status],
                    )}
                  >
                    {student.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium">Student No:</span>{" "}
                    {student.student_number}
                  </p>
                  <p>
                    <span className="font-medium">Faculty:</span>{" "}
                    {student.department}
                  </p>
                  <p>
                    <span className="font-medium">Program:</span>{" "}
                    {student.program}
                  </p>
                  <p>
                    <span className="font-medium">Year:</span>{" "}
                    {student.year_of_study}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(student)}
                    className="h-8 px-2 sm:px-3 text-muted-foreground hover:text-foreground flex-1 sm:flex-none"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">View</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(student)}
                    className="h-8 px-2 sm:px-3 text-muted-foreground hover:text-primary flex-1 sm:flex-none"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(student)}
                    className="h-8 px-2 sm:px-3 text-muted-foreground hover:text-destructive flex-1 sm:flex-none"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
