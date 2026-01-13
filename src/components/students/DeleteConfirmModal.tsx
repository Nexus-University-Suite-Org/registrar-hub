import { Student } from "@/types/student";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  student: Student | null;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  student,
}: DeleteConfirmModalProps) {
  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[90vw] p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg sm:text-xl">
                Delete Student
              </DialogTitle>
              <DialogDescription className="mt-1">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 p-4 rounded-lg bg-muted">
          <p className="text-sm text-muted-foreground">
            You are about to delete the student record for:
          </p>
          <p className="mt-2 font-medium text-foreground">
            {student.first_name} {student.last_name}
          </p>
          <p className="text-sm text-muted-foreground">
            {student.student_number} • {student.email}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="w-full sm:w-auto"
          >
            Delete Student
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
