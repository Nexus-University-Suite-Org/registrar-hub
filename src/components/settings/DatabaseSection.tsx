import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Users, BookOpen, GraduationCap, FileText, Building2, RefreshCw } from "lucide-react";
import { get, post } from "@/lib/api";
import { toast } from "sonner";
import type { DatabaseStats } from "@/types/settings";

const EMPTY: DatabaseStats = {
  students: 0,
  courses: 0,
  course_units: 0,
  lecturers: 0,
  fee_assignments: 0,
  departments: 0,
  service_requests: 0,
  calendar_events: 0,
  university_services: 0,
};

const STAT_CARDS: { key: keyof DatabaseStats; label: string; icon: typeof Users }[] = [
  { key: "students", label: "Students", icon: Users },
  { key: "courses", label: "Courses", icon: BookOpen },
  { key: "course_units", label: "Course Units", icon: FileText },
  { key: "lecturers", label: "Lecturers", icon: GraduationCap },
  { key: "fee_assignments", label: "Fee Assignments", icon: FileText },
  { key: "departments", label: "Departments", icon: Building2 },
  { key: "service_requests", label: "Service Requests", icon: FileText },
  { key: "calendar_events", label: "Calendar Events", icon: FileText },
  { key: "university_services", label: "University Services", icon: Building2 },
];

export default function DatabaseSection() {
  const [stats, setStats] = useState<DatabaseStats>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState<{ scanned: number; updated: number } | null>(null);

  const fetchStats = async () => {
    try {
      const data = await get<DatabaseStats>("/settings/db/stats");
      setStats({ ...EMPTY, ...(data || {}) });
    } catch {
      toast.error("Failed to load database stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleMigrate = async () => {
    if (!confirm("Run student data migration now?")) return;
    setMigrating(true);
    setResult(null);
    try {
      const res = await post<{ scanned: number; updated: number }>(
        "/settings/db/migrate-students",
        {},
      );
      setResult(res);
      toast.success("Student migration complete");
      fetchStats();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to run migration";
      toast.error(message);
    } finally {
      setMigrating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-8">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading database stats...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Database</h3>
        <p className="text-sm text-muted-foreground">
          Storage statistics and maintenance tools for the registrar database.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STAT_CARDS.map((card) => (
          <Card key={card.key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats[card.key].toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-lg border p-5">
        <h4 className="font-semibold">Student Data Migration</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Scans existing students and backfills missing department values based
          on each student's programme. The migration is safe to run repeatedly.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <Button onClick={handleMigrate} disabled={migrating} className="gap-2">
            {migrating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {migrating ? "Migrating..." : "Run Student Migration"}
          </Button>
          {result && (
            <span className="text-sm text-muted-foreground">
              Scanned {result.scanned} student{result.scanned !== 1 ? "s" : ""},{" "}
              {result.updated} updated
            </span>
          )}
        </div>
      </div>
    </div>
  );
}