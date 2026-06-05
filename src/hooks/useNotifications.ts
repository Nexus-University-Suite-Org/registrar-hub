import { useState, useEffect } from "react";
import {
  auth,
  db,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  Timestamp,
  writeBatch,
} from "@/lib/firebase";

const CALENDAR_COLLECTION = "AcademicCalendar";
import type { Notification, NotificationType, NotificationMetadata } from "@/types/notification";

const COLLECTION = "notifications";

function toNotification(docSnap: { id: string; data: () => Record<string, unknown> }): Notification {
  const d = docSnap.data();
  const raw = d.createdAt as { toDate?: () => Date } | string | undefined;
  const createdAt = typeof raw === "object" && raw?.toDate ? raw.toDate() : raw ? new Date(raw as string) : new Date();
  return {
    id: docSnap.id,
    recipientId: d.recipientId as string | null,
    college: (d.college as string) ?? null,
    type: (d.type as NotificationType) ?? "system",
    title: (d.title as string) ?? "",
    message: (d.message as string) ?? "",
    read: (d.read as boolean) ?? false,
    createdAt,
    timestamp: createdAt,
    metadata: d.metadata as NotificationMetadata | undefined,
    createdBy: d.createdBy as string | undefined,
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, COLLECTION),
      where("recipientId", "==", uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((d) => toNotification({ id: d.id, data: () => d.data() }));
        setNotifications(list);
        setLoading(false);
      },
      (err) => {
        console.error("Notifications listener error:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [uid]);

  // Create notifications for upcoming deadlines from Academic Calendar (once per mount)
  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    (async () => {
      try {
        const calendarSnap = await getDocs(collection(db, CALENDAR_COLLECTION));
        const now = new Date();
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        const existingSnap = await getDocs(
          query(
            collection(db, COLLECTION),
            where("recipientId", "==", uid),
            where("type", "==", "deadline")
          )
        );
        const existingEntityIds = new Set(
          existingSnap.docs
            .map((d) => (d.data().metadata as { entityId?: string })?.entityId)
            .filter(Boolean)
        );
        for (const d of calendarSnap.docs) {
          if (cancelled) return;
          const data = d.data();
          if (data.type !== "deadline" || !data.isActive) continue;
          const dueDate = data.dueDate?.toDate?.() ?? (data.dueDate ? new Date(data.dueDate as string) : null);
          if (!dueDate || dueDate < now || dueDate > threeDaysFromNow) continue;
          if (existingEntityIds.has(d.id)) continue;
          await createDeadlineNotification({
            recipientId: uid,
            title: "Deadline approaching",
            message: data.title
              ? `${data.title} is due on ${dueDate.toLocaleDateString()}.`
              : `A deadline is due on ${dueDate.toLocaleDateString()}.`,
            entityId: d.id,
            link: "/calendar",
          });
          existingEntityIds.add(d.id);
        }
      } catch (e) {
        console.error("Deadline notifications check failed:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    const ref = doc(db, COLLECTION, id);
    await updateDoc(ref, { read: true });
  };

  const markAllAsRead = async () => {
    if (!uid) return;
    const q = query(
      collection(db, COLLECTION),
      where("recipientId", "==", uid),
      where("read", "==", false)
    );
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
    if (!snap.empty) await batch.commit();
  };

  const deleteNotification = async (id: string) => {
    await deleteDoc(doc(db, COLLECTION, id));
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
  await addDoc(collection(db, COLLECTION), {
    recipientId: params.recipientId,
    college: params.college ?? null,
    type: params.type,
    title: params.title,
    message: params.message,
    read: false,
    createdAt: Timestamp.now(),
    metadata: params.metadata ?? null,
    createdBy: params.createdBy ?? null,
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
