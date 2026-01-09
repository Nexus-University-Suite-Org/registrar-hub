import { Student } from '@/types/student';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onView: (student: Student) => void;
}

const statusStyles = {
  Active: 'bg-success/10 text-success border-success/20',
  Inactive: 'bg-muted text-muted-foreground border-muted',
  Graduated: 'bg-primary/10 text-primary border-primary/20',
  Suspended: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function StudentTable({ students, onEdit, onDelete, onView }: StudentTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
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
              Department
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
                <div>
                  <p className="font-medium text-foreground">
                    {student.first_name} {student.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
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
  );
}
