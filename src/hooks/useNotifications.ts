import { useState, useEffect, useCallback } from "react";
import { get, put, del, post } from "@/lib/api";
import type {
  Notification,
  NotificationType,
  NotificationMetadata,
} from "@/types/notification";

function toNotification(item: any): Notification {
  const createdAt = item.created_at ? new Date(item.created_at) : new Date();
  return {
    id: item.id,
    recipientId: item.recipient_id ?? null,
    college: item.college ?? null,
    type: (item.type as NotificationType) ?? "system",
    title: item.title ?? "",
    message: item.message ?? "",
    read: item.read ?? false,
    createdAt,
    timestamp: createdAt,
    metadata: item.metadata as NotificationMetadata | undefined,
    createdBy: item.created_by as string | undefined,
  };
}

const POLL_INTERVAL = 15000; // 15 seconds

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const uid = localStorage.getItem("user_id");

  const fetchNotifications = useCallback(async () => {
    if (!uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    try {
      const data = await get<any[]>(`/notifications/?recipient_id=${uid}`);
      const list = (data || []).map(toNotification);
      setNotifications(list);
    } catch (err) {
      console.error("Notifications fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    await put(`/notifications/${id}/`, { read: true });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = async () => {
    if (!uid) return;
    await post("/notifications/mark-all-read/", { recipient_id: uid });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = async (id: string) => {
    await del(`/notifications/${id}/`);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}

export async function createNotification(params: {
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  college?: string | null;
  metadata?: NotificationMetadata;
  createdBy?: string;
}) {
  await post("/notifications/", {
    recipient_id: params.recipientId,
    college: params.college ?? null,
    type: params.type,
    title: params.title,
    message: params.message,
    read: false,
    metadata: params.metadata ?? null,
    created_by: params.createdBy ?? null,
  });
}

/** Call from lecturer app or Cloud Function when a lecturer submits grades. */
export async function notifyGradeSubmitted(params: {
  registrarId: string;
  college: string;
  lecturerName: string;
  courseOrUnitName: string;
  academicYear?: string;
  semester?: string;
}) {
  await createNotification({
    recipientId: params.registrarId,
    college: params.college,
    type: "grade_submitted",
    title: "Grades submitted",
    message: `${params.lecturerName} submitted grades for ${params.courseOrUnitName}.`,
    metadata: {
      lecturerName: params.lecturerName,
      academicYear: params.academicYear,
      semester: params.semester,
    },
  });
}

/** Create a deadline-approaching notification (call when checking calendar). */
export async function createDeadlineNotification(params: {
  recipientId: string;
  title: string;
  message: string;
  entityId?: string;
  link?: string;
}) {
  await createNotification({
    recipientId: params.recipientId,
    type: "deadline",
    title: params.title,
    message: params.message,
    metadata: { entityId: params.entityId, link: params.link },
  });
}
