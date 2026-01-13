import { Lecturer } from "@/types/lecturer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface LecturerTableProps {
  lecturers: Lecturer[];
  onEdit: (lecturer: Lecturer) => void;
  onDelete: (lecturer: Lecturer) => void;
  onView: (lecturer: Lecturer) => void;
}

const statusStyles = {
  Active: "bg-success/10 text-success border-success/20",
  Inactive: "bg-muted text-muted-foreground border-muted",
  Retired: "bg-primary/10 text-primary border-primary/20",
};

export function LecturerTable({
  lecturers,
  onEdit,
  onDelete,
  onView,
}: LecturerTableProps) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Lecturer
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Lecturer No.
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Department
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Specialization
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Employment Date
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
            {lecturers.map((lecturer) => (
              <tr
                key={lecturer.id}
                className="transition-colors hover:bg-muted/30"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {lecturer.avatar_url ? (
                      <img
                        src={lecturer.avatar_url}
                        alt={`${lecturer.first_name} ${lecturer.last_name}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium text-muted-foreground">
                          {lecturer.first_name?.[0]}
                          {lecturer.last_name?.[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">
                        {lecturer.first_name} {lecturer.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {lecturer.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-foreground font-mono">
                  {lecturer.lecturer_number}
                </td>
                <td className="px-6 py-4 text-sm text-foreground">
                  {lecturer.department}
                </td>
                <td className="px-6 py-4 text-sm text-foreground">
                  {lecturer.specialization || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-foreground">
                  {new Date(lecturer.employment_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <Badge
                    variant="outline"
                    className={cn("font-medium", statusStyles[lecturer.status])}
                  >
                    {lecturer.status}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(lecturer)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(lecturer)}
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(lecturer)}
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
        {lecturers.map((lecturer) => (
          <div
            key={lecturer.id}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              {lecturer.avatar_url ? (
                <img
                  src={lecturer.avatar_url}
                  alt={`${lecturer.first_name} ${lecturer.last_name}`}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-muted-foreground">
                    {lecturer.first_name?.[0]}
                    {lecturer.last_name?.[0]}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-foreground truncate">
                      {lecturer.first_name} {lecturer.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {lecturer.email}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-medium text-xs",
                      statusStyles[lecturer.status]
                    )}
                  >
                    {lecturer.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium">Lecturer No:</span>{" "}
                    {lecturer.lecturer_number}
                  </p>
                  <p>
                    <span className="font-medium">Department:</span>{" "}
                    {lecturer.department}
                  </p>
                  <p>
                    <span className="font-medium">Specialization:</span>{" "}
                    {lecturer.specialization || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Employment Date:</span>{" "}
                    {new Date(lecturer.employment_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(lecturer)}
                    className="h-8 px-2 sm:px-3 text-muted-foreground hover:text-foreground flex-1 sm:flex-none"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">View</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(lecturer)}
                    className="h-8 px-2 sm:px-3 text-muted-foreground hover:text-primary flex-1 sm:flex-none"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline ml-1">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(lecturer)}
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
