import { useState, useEffect, useMemo, type ReactNode } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Edit,
  Clock,
  Building2,
  Loader2,
  Monitor,
  MapPin,
} from "lucide-react";
import { get, post, put, del } from "@/lib/api";
import { toast } from "sonner";
import { Course, CourseUnit, TimetableEntry } from "@/types/course";
import { cn } from "@/lib/utils";

const ACADEMIC_YEARS = ["2025/2026", "2024/2025", "2023/2024", "2022/2023"];
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const SESSION_TYPES = [
  "Lecture",
  "Lab",
  "Tutorial",
  "Workshop",
  "Practical",
  "Review",
];
const TIMES = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];
const START = 8 * 60;
const HOUR_CELL = 56;
const GRID_HEIGHT = TIMES.length * HOUR_CELL;

const PALETTE = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-lime-500",
  "bg-fuchsia-500",
  "bg-orange-500",
  "bg-sky-500",
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map((n) => parseInt(n, 10));
  return h * 60 + (isNaN(m) ? 0 : m);
}

function formatTime(time: string): string {
  const mins = toMinutes(time);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export default function Timetable() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseUnits, setCourseUnits] = useState<CourseUnit[]>([]);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [registrarCollege, setRegistrarCollege] = useState<string | null>(
    () => localStorage.getItem("registrar_college"),
  );

  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [academicYear, setAcademicYear] = useState(ACADEMIC_YEARS[0]);
  const [semester, setSemester] = useState(1);
  const [yearOfStudy, setYearOfStudy] = useState(1);

  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === Number(selectedCourseId)) || null,
    [courses, selectedCourseId],
  );
  const unitsForCourse = useMemo(
    () =>
      courseUnits.filter((u) => u.course_id === Number(selectedCourseId)),
    [courseUnits, selectedCourseId],
  );

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    course_unit_id: 0,
    session_type: SESSION_TYPES[0],
    is_online: false,
    sessions: [
      {
        day_of_week: DAYS[0],
        start_time: "08:00",
        end_time: "10:00",
        room: "",
        lecturer_name: "",
      },
    ],
  });

  useEffect(() => {
    fetchRegistrarData();
  }, []);

  const fetchRegistrarData = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      const stored = localStorage.getItem("registrar_college");
      if (stored) {
        setRegistrarCollege(stored);
        await fetchCourses(stored);
        return;
      }

      try {
        const registrar = await get<any>(`/registrars/${userId}/`);
        if (registrar?.college) {
          localStorage.setItem("registrar_college", registrar.college);
          setRegistrarCollege(registrar.college);
          await fetchCourses(registrar.college);
          return;
        }
      } catch {
        console.warn("Registrar not found in the platform database");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching registrar data:", error);
    }
  };

  const fetchCourses = async (college: string) => {
    try {
      const coursesData = await get<Course[]>(
        `/courses/?college=${encodeURIComponent(college)}`,
      );
      const sorted = (Array.isArray(coursesData) ? coursesData : []).sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      setCourses(sorted);

      const allUnits = await get<CourseUnit[]>("/course-units/");
      setCourseUnits(Array.isArray(allUnits) ? allUnits : []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const fetchEntries = async (courseId: string, year: string, sem: number, level: number) => {
    if (!courseId) {
      setEntries([]);
      return;
    }
    const course = courses.find((c) => c.id === Number(courseId));
    if (!course) return;
    setEntriesLoading(true);
    try {
      const data = await get<TimetableEntry[]>(
        `/timetable/?program=${encodeURIComponent(course.name)}&academic_year=${encodeURIComponent(year)}&semester=${sem}&year_of_study=${level}`,
      );
      setEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching timetable:", error);
      toast.error("Failed to load timetable entries");
    } finally {
      setEntriesLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries(selectedCourseId, academicYear, semester, yearOfStudy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId, academicYear, semester, yearOfStudy, courses]);

  const openAddModal = () => {
    setModalMode("add");
    setEditingId(null);
    setForm({
      course_unit_id: unitsForCourse[0]?.id || 0,
      session_type: SESSION_TYPES[0],
      is_online: false,
      sessions: [
        {
          day_of_week: DAYS[0],
          start_time: "08:00",
          end_time: "10:00",
          room: "",
          lecturer_name: "",
        },
      ],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (entry: TimetableEntry) => {
    setModalMode("edit");
    setEditingId(entry.id);
    setForm({
      course_unit_id: entry.course_unit_id || 0,
      session_type: entry.session_type || SESSION_TYPES[0],
      is_online: entry.is_online,
      sessions: [
        {
          day_of_week: entry.day_of_week,
          start_time: entry.start_time,
          end_time: entry.end_time,
          room: entry.room,
          lecturer_name: entry.lecturer_name || "",
        },
      ],
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedCourse) return;
    if (!form.course_unit_id) {
      toast.error("Select a course unit for this session");
      return;
    }
    const unit = courseUnits.find((u) => u.id === Number(form.course_unit_id));
    const commonPayload = {
      program: selectedCourse.name,
      program_code: selectedCourse.code,
      academic_year: academicYear,
      semester,
      year_of_study: yearOfStudy,
      session_type: form.session_type,
      is_online: form.is_online,
      course_unit_id: Number(form.course_unit_id),
      course_unit_code: unit?.code || null,
      course_unit_name: unit?.name || null,
    };
    const sessions = form.sessions.filter(
      (s) => s.day_of_week && s.start_time && s.end_time,
    );
    if (sessions.length === 0) {
      toast.error("Add at least one day and time");
      return;
    }
    for (const s of sessions) {
      if (toMinutes(s.end_time) <= toMinutes(s.start_time)) {
        toast.error(`End time must be after start time on ${s.day_of_week}`);
        return;
      }
      if (!s.room.trim()) {
        toast.error(`Room/venue is required for ${s.day_of_week}`);
        return;
      }
    }
    setIsSaving(true);
    try {
      if (modalMode === "add") {
        const results = await Promise.all(
          sessions.map((s) =>
            post("/timetable/", {
              ...commonPayload,
              day_of_week: s.day_of_week,
              start_time: s.start_time,
              end_time: s.end_time,
              room: s.room.trim(),
              lecturer_name: s.lecturer_name.trim() || null,
            }),
          ),
        );
        const ok = results.every(Boolean);
        if (ok) {
          toast.success(
            sessions.length > 1
              ? `${sessions.length} sessions added to timetable`
              : "Session added to timetable",
          );
        } else {
          toast.error("Some sessions could not be saved");
        }
      } else if (editingId) {
        const s = sessions[0];
        await put(`/timetable/${editingId}/`, {
          ...commonPayload,
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
          room: s.room.trim(),
          lecturer_name: s.lecturer_name.trim() || null,
        });
        toast.success("Session updated");
      }
      setIsModalOpen(false);
      fetchEntries(selectedCourseId, academicYear, semester, yearOfStudy);
    } catch (error) {
      console.error("Error saving session:", error);
      toast.error("Failed to save session");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSession = (index: number, patch: Partial<{ day_of_week: string; start_time: string; end_time: string; room: string; lecturer_name: string }>) => {
    setForm((f) => ({
      ...f,
      sessions: f.sessions.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));
  };

  const addSession = () => {
    setForm((f) => ({
      ...f,
      sessions: [
        ...f.sessions,
        {
          day_of_week: DAYS.find((d) => !f.sessions.some((s) => s.day_of_week === d)) || DAYS[0],
          start_time: f.sessions[f.sessions.length - 1]?.start_time || "08:00",
          end_time: f.sessions[f.sessions.length - 1]?.end_time || "10:00",
          room: "",
          lecturer_name: f.sessions[0]?.lecturer_name ?? "",
        },
      ],
    }));
  };

  const removeSession = (index: number) => {
    setForm((f) => ({
      ...f,
      sessions: f.sessions.filter((_, i) => i !== index),
    }));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this session from the timetable?")) return;
    try {
      await del(`/timetable/${id}/`);
      toast.success("Session removed");
      fetchEntries(selectedCourseId, academicYear, semester, yearOfStudy);
    } catch (error) {
      toast.error("Failed to remove session");
    }
  };

  const unitColor = (code: string | null | undefined) => {
    const key = code || "generic";
    return PALETTE[hashCode(key) % PALETTE.length];
  };

  // Position sessions inside the day columns
  const layoutByDay = useMemo(() => {
    const perDay: Record<string, TimetableEntry[]> = {};
    DAYS.forEach((d) => (perDay[d] = []));
    entries.forEach((e) => {
      if (perDay[e.day_of_week]) perDay[e.day_of_week].push(e);
    });
    DAYS.forEach((d) =>
      perDay[d].sort((a, b) => toMinutes(a.start_time) - toMinutes(b.start_time) ||
        toMinutes(a.end_time) - toMinutes(b.end_time)),
    );
    return perDay;
  }, [entries]);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-primary/10 rounded-xl">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold font-display">Timetable</h1>
            </div>
            <p className="text-muted-foreground">
              Set the weekly teaching schedule for {registrarCollege || "Loading..."}
            </p>
          </div>
          <Button
            onClick={openAddModal}
            disabled={!selectedCourse}
            className="gap-2 h-11 px-6 rounded-xl shadow-primary"
          >
            <Plus className="h-4 w-4" />
            Add Session
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Program</Label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACADEMIC_YEARS.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select value={String(semester)} onValueChange={(v) => setSemester(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Semester 1</SelectItem>
                  <SelectItem value="2">Semester 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year of Study</Label>
              <Select value={String(yearOfStudy)} onValueChange={(v) => setYearOfStudy(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: selectedCourse?.duration_years || 4 },
                    (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        Year {i + 1}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Week Grid */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-4 sm:p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading...
            </div>
          ) : !selectedCourse ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-3">
              <Building2 className="h-12 w-12" />
              <p>Select a program to view or build its timetable.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">{selectedCourse.name}</h2>
                  <Badge variant="secondary" className="font-mono">
                    {selectedCourse.code}
                  </Badge>
                  <Badge variant="outline">
                    {academicYear} · Semester {semester}
                  </Badge>
                </div>
                <Badge variant="secondary">
                  {entries.length} session{entries.length === 1 ? "" : "s"}
                </Badge>
              </div>

              {entries.length === 0 ? (
                <div className="text-center text-muted-foreground py-16">
                  {entriesLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading timetable...
                    </div>
                  ) : (
                    <>
                      No sessions in the timetable for this program, year and
                      semester yet. Click &quot;Add Session&quot; to schedule one.
                    </>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div
                    className="grid gap-1 min-w-[860px]"
                    style={{
                      gridTemplateColumns: `64px repeat(${DAYS.length}, minmax(0, 1fr))`,
                    }}
                  >
                    <div />
                    {DAYS.map((d) => (
                      <div
                        key={d}
                        className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide py-2 border-b border-border"
                      >
                        {d.slice(0, 3)}
                      </div>
                    ))}

                    {TIMES.map((t, hourIdx) => (
                      <FragmentRow
                        key={t}
                        time={t}
                        isLast={hourIdx === TIMES.length - 1}
                      >
                        {DAYS.map((d) => {
                          const dayEntries = layoutByDay[d];
                          const starts: { entry: TimetableEntry; idx: number }[] = [];
                          dayEntries.forEach((e) => {
                            const idx = Math.floor((toMinutes(e.start_time) - START) / 60);
                            if (idx === hourIdx) starts.push({ entry: e, idx });
                          });
                          return <DaySlot key={d} entries={starts.map((s) => s.entry)} unitColor={unitColor} onEdit={openEditModal} onDelete={handleDelete} />;
                        })}
                      </FragmentRow>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Session Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-2xl border-none shadow-2xl max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {modalMode === "add" ? "Add Session" : "Edit Session"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Course Unit</Label>
              <Select
                value={form.course_unit_id ? String(form.course_unit_id) : ""}
                onValueChange={(v) => setForm({ ...form, course_unit_id: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent>
                  {unitsForCourse.length > 0 ? (
                    unitsForCourse.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.code} — {u.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No units for this program
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Session Type</Label>
              <Select
                value={form.session_type}
                onValueChange={(v) => setForm({ ...form, session_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SESSION_TYPES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Days &amp; Times</Label>
                {modalMode === "add" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSession}
                    className="gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Add Day
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {form.sessions.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border p-3 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Session {i + 1}
                      </span>
                      {modalMode === "add" && form.sessions.length > 1 && (
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeSession(i)}
                          title="Remove this day"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label>Day</Label>
                        <Select
                          value={s.day_of_week}
                          onValueChange={(v) => updateSession(i, { day_of_week: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DAYS.map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Select
                          value={s.start_time}
                          onValueChange={(v) => updateSession(i, { start_time: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIMES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {formatTime(t)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Select
                          value={s.end_time}
                          onValueChange={(v) => updateSession(i, { end_time: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIMES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {formatTime(t)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Room / Venue</Label>
                        <Input
                          value={s.room}
                          onChange={(e) => updateSession(i, { room: e.target.value })}
                          placeholder="e.g., LT-102 or Room 4B"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Lecturer (optional)</Label>
                        <Input
                          value={s.lecturer_name}
                          onChange={(e) => updateSession(i, { lecturer_name: e.target.value })}
                          placeholder="e.g., Dr. Jane Doe"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-border p-3">
              <Checkbox
                checked={form.is_online}
                onCheckedChange={(v) => setForm({ ...form, is_online: !!v })}
              />
              <div className="flex items-center gap-2 text-sm">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                Online session (no physical venue)
              </div>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="shadow-primary px-8" disabled={isSaving}>
              {isSaving ? "Saving..." : modalMode === "add" ? "Add Session" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

// Hour label + day cells for one time row
function FragmentRow({
  time,
  isLast,
  children,
}: {
  time: string;
  isLast: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <div
        className={cn(
          "text-[11px] text-muted-foreground pr-2 text-right pt-1.5",
          isLast && "border-b border-border",
        )}
      >
        {formatTime(time)}
      </div>
      {children}
    </>
  );
}

// Day cell
function DaySlot({
  entries,
  unitColor,
  onEdit,
  onDelete,
}: {
  entries: TimetableEntry[];
  unitColor: (code: string | null | undefined) => string;
  onEdit: (e: TimetableEntry) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="relative min-h-[56px] border-b border-border/50">
      {entries.map((e, i) => {
        const startIdx = Math.floor((toMinutes(e.start_time) - START) / 60);
        const top = startIdx * HOUR_CELL;
        const span = Math.max(1, (toMinutes(e.end_time) - toMinutes(e.start_time)) / 60);
        const height = Math.max(HOUR_CELL * 0.8, span * HOUR_CELL - 4);
        const left = i * 24;
        return (
          <div
            key={e.id}
            className={cn(
              "absolute rounded-lg p-1.5 text-white text-[11px] leading-tight shadow-sm overflow-hidden group cursor-pointer",
              unitColor(e.course_unit_code || e.course_unit_name),
            )}
            style={{
              top: top + 2,
              height,
              left: left + 2,
              right: left + 2,
            }}
            onClick={() => onEdit(e)}
            title={`${e.course_unit_code || e.course_unit_name || "Session"} · ${e.room}`}
          >
            <div className="font-bold truncate">
              {e.course_unit_code || e.course_unit_name}
            </div>
            <div className="truncate opacity-90">{e.course_unit_name}</div>
            <div className="truncate opacity-80">
              {formatTime(e.start_time)} – {formatTime(e.end_time)} · {e.room}
            </div>
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1">
              <span
                className="bg-black/30 rounded p-0.5"
                role="button"
                onClick={(ev) => {
                  ev.stopPropagation();
                  onEdit(e);
                }}
              >
                <Edit className="h-3 w-3" />
              </span>
              <span
                className="bg-black/30 rounded p-0.5"
                role="button"
                onClick={(ev) => {
                  ev.stopPropagation();
                  onDelete(e.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}