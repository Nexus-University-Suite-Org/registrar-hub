export type NotificationType =
  | "grade_submitted"
  | "request"
  | "deadline"
  | "enrollment"
  | "assignment"
  | "system";

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  grade_submitted: "Grade submitted",
  request: "Request",
  deadline: "Deadline",
  enrollment: "Enrollment",
  assignment: "Assignment",
  system: "System",
};

export interface NotificationMetadata {
  entityType?: string;
  entityId?: string;
  link?: string;
  academicYear?: string;
  semester?: string;
  lecturerName?: string;
}

export interface NotificationDoc {
  id: string;
  recipientId: string | null; // null = all registrars for the college
  college: string | null;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: { toDate: () => Date } | Date;
  metadata?: NotificationMetadata;
  createdBy?: string;
}

export interface Notification extends Omit<NotificationDoc, "createdAt"> {
  createdAt: Date;
  timestamp: Date;
}
