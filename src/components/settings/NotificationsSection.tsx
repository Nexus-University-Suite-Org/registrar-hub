import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { get, put } from "@/lib/api";
import { toast } from "sonner";
import type { NotificationPreference } from "@/types/settings";

interface CategoryMeta {
  category: string;
  label: string;
  description: string;
}

const CATEGORIES: CategoryMeta[] = [
  {
    category: "service_requests",
    label: "Service Requests",
    description: "Student document and service request updates",
  },
  {
    category: "fee_updates",
    label: "Fee Updates",
    description: "Payment confirmations and fee status changes",
  },
  {
    category: "student_registration",
    label: "Student Registration",
    description: "New registrations and course enrollments",
  },
  {
    category: "calendar_events",
    label: "Calendar Events",
    description: "Deadlines and academic calendar reminders",
  },
  {
    category: "announcements",
    label: "Announcements",
    description: "General platform announcements",
  },
];

const DEFAULTS = (): NotificationPreference[] =>
  CATEGORIES.map((c) => ({
    category: c.category,
    email_enabled: true,
    in_app_enabled: true,
  }));

export default function NotificationsSection() {
  const [prefs, setPrefs] = useState<NotificationPreference[]>(DEFAULTS());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await get<NotificationPreference[]>("/notifications/preferences");
        const savedArr = Array.isArray(saved) ? saved : [];
        const merged = DEFAULTS().map((d) => {
          const match = savedArr.find((s) => s.category === d.category);
          return match
            ? { ...d, ...match }
            : d;
        });
        setPrefs(merged);
      } catch {
        toast.error("Failed to load notification preferences");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggle = (category: string, key: "email_enabled" | "in_app_enabled") => {
    setPrefs((prev) =>
      prev.map((p) =>
        p.category === category ? { ...p, [key]: !p[key] } : p,
      ),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await put<NotificationPreference[]>("/notifications/preferences", prefs);
      toast.success("Notification preferences updated");
    } catch {
      toast.error("Failed to update notification preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-8">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading notification preferences...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Notifications</h3>
        <p className="text-sm text-muted-foreground">
          Choose how you want to be notified for each activity category.
        </p>
      </div>

      <div className="max-w-2xl divide-y rounded-lg border">
        {prefs.map((p) => {
          const meta = CATEGORIES.find((c) => c.category === p.category);
          return (
            <div key={p.category} className="flex items-start justify-between gap-4 p-4">
              <div className="space-y-0.5">
                <div className="font-medium">{meta?.label ?? p.category}</div>
                <div className="text-sm text-muted-foreground">
                  {meta?.description}
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={p.email_enabled}
                    onCheckedChange={() =>
                      toggle(p.category, "email_enabled")
                    }
                  />
                  <Label className="cursor-pointer text-sm">Email</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={p.in_app_enabled}
                    onCheckedChange={() =>
                      toggle(p.category, "in_app_enabled")
                    }
                  />
                  <Label className="cursor-pointer text-sm">In-app</Label>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </span>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </div>
    </div>
  );
}