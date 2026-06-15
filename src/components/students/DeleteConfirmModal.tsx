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
  person: {
    first_name?: string;
    last_name?: string;
    student_number?: string;
    lecturer_number?: string;
    email?: string;
  } | null;
  type?: "Student" | "Lecturer";
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  person,
  type = "Student",
}: DeleteConfirmModalProps) {
  if (!person) return null;

  const identifier = person.student_number || person.lecturer_number || "";
  const fullName = [person.first_name, person.last_name].filter(Boolean).join(" ");

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
                Delete {type}
              </DialogTitle>
              <DialogDescription className="mt-1">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 p-4 rounded-lg bg-muted">
          <p className="text-sm text-muted-foreground">
            You are about to delete the {type.toLowerCase()} record for:
          </p>
          <p className="mt-2 font-medium text-foreground">
            {fullName}
          </p>
          <p className="text-sm text-muted-foreground">
            {identifier && `${identifier} • `}{person.email}
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
            Delete {type}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
