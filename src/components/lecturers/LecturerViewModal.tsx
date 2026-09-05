import { Lecturer } from "@/types/lecturer";
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
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  BookOpen,
  Award,
  Building,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LecturerViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lecturer: Lecturer | null;
}

const statusStyles = {
  Active: "bg-success/10 text-success border-success/20",
  Inactive: "bg-muted text-muted-foreground border-muted",
  Retired: "bg-primary/10 text-primary border-primary/20",
};

export function LecturerViewModal({
  isOpen,
  onClose,
  lecturer,
}: LecturerViewModalProps) {
  if (!lecturer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-lg sm:text-xl flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            Lecturer Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Header Section */}
          <div className="flex items-start gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage
                src={lecturer.avatar_url}
                alt={`${lecturer.first_name} ${lecturer.last_name}`}
              />
              <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary to-orange-400 text-white">
                {`${lecturer.first_name?.[0] ?? ""}${lecturer.last_name?.[0] ?? ""}`.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {lecturer.first_name} {lecturer.last_name}
                </h2>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Hash className="h-4 w-4" />
                  {lecturer.lecturer_number}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={cn("font-medium", statusStyles[lecturer.status])}
                >
                  {lecturer.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Joined {new Date(lecturer.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Email Address
                </label>
                <p className="text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {lecturer.email}
                </p>
              </div>

              {lecturer.phone && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </label>
                  <p className="text-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {lecturer.phone}
                  </p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Academic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Academic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Department
                </label>
                <p className="text-foreground flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {lecturer.department || "Not specified"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Specialization
                </label>
                <p className="text-foreground flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  {lecturer.specialization || "Not specified"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Employment Date
                </label>
                <p className="text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(lecturer.employment_date).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Years of Service
                </label>
                <p className="text-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {Math.floor(
                    (new Date().getTime() -
                      new Date(lecturer.employment_date).getTime()) /
                      (1000 * 60 * 60 * 24 * 365)
                  )}{" "}
                  years
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(lecturer.address || lecturer.bio) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Additional Information
                </h3>

                {lecturer.address && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Address
                    </label>
                    <p className="text-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {lecturer.address}
                    </p>
                  </div>
                )}

                {lecturer.bio && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Biography
                    </label>
                    <p className="text-foreground text-sm leading-relaxed">
                      {lecturer.bio}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* System Information */}
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">System Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <label className="text-muted-foreground">Profile ID</label>
                <p className="font-mono text-xs bg-muted p-2 rounded">
                  {lecturer.id}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-muted-foreground">Last Updated</label>
                <p className="text-foreground">
                  {new Date(
                    lecturer.updated_at || lecturer.created_at
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
