import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { get, post, put, del } from "@/lib/api";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  Clock,
  Search,
  GraduationCap,
  ClipboardList,
  PartyPopper,
  AlertTriangle,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isBefore,
  parseISO,
} from "date-fns";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  dueDate?: Date;
  type: string;
  description?: string;
  isActive: boolean;
}

const EVENT_TYPES = ["exam", "deadline", "meeting", "holiday", "registration", "other"];

const eventStyles: Record<string, { dot: string; badge: string; card: string; icon: React.ReactNode }> = {
  exam: {
    dot: "bg-rose-500",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    card: "border-l-rose-500",
    icon: <GraduationCap className="h-4 w-4" />,
  },
  deadline: {
    dot: "bg-orange-500",
    badge: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
    card: "border-l-orange-500",
    icon: <ClipboardList className="h-4 w-4" />,
  },
  meeting: {
    dot: "bg-blue-500",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    card: "border-l-blue-500",
    icon: <UsersIcon />,
  },
  holiday: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    card: "border-l-emerald-500",
    icon: <PartyPopper className="h-4 w-4" />,
  },
  registration: {
    dot: "bg-violet-500",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
    card: "border-l-violet-500",
    icon: <CalendarDays className="h-4 w-4" />,
  },
  other: {
    dot: "bg-slate-500",
    badge: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
    card: "border-l-slate-500",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
};

function getEventStyle(type: string) {
  return eventStyles[type] || eventStyles.other;
}

function UsersIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

const typeIcon = (type: string) => getEventStyle(type).icon;

type FilterType = "all" | string;

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [deleting, setDeleting] = useState<CalendarEvent | null>(null);
  const [form, setForm] = useState({
    title: "",
    date: "",
    dueDate: "",
    type: "exam",
    description: "",
  });

  const fetchEvents = async () => {
    try {
      const eventsData = await get<any[]>("/academic-calendar");
      setEvents(
        (eventsData || []).map((e: any) => ({
          id: String(e.id),
          title: e.title,
          date: e.date ? parseISO(e.date) : new Date(),
          dueDate: e.due_date ? parseISO(e.due_date) : undefined,
          type: e.type || "other",
          description: e.description,
          isActive: e.is_active !== false,
        })),
      );
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ title: "", date: "", dueDate: "", type: "exam", description: "" });
    setIsAddOpen(true);
  };

  const openEdit = (event: CalendarEvent) => {
    setEditing(event);
    setForm({
      title: event.title,
      date: format(event.date, "yyyy-MM-dd"),
      dueDate: event.dueDate ? format(event.dueDate, "yyyy-MM-dd") : "",
      type: event.type,
      description: event.description || "",
    });
    setIsAddOpen(true);
  };

  const submit = async () => {
    if (!form.title.trim() || !form.date) return;
    const payloadDate = parseISO(form.date).toISOString();
    const payload: any = {
      title: form.title.trim(),
      date: payloadDate,
      due_date: form.dueDate ? parseISO(form.dueDate).toISOString() : null,
      type: form.type,
      description: form.description,
    };
    try {
      if (editing) {
        await put(`/academic-calendar/${editing.id}`, payload);
      } else {
        await post("/academic-calendar", { ...payload, is_active: true });
      }
      setIsAddOpen(false);
      await fetchEvents();
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const toggleActive = async (event: CalendarEvent) => {
    try {
      await put(`/academic-calendar/${event.id}`, { is_active: !event.isActive });
      await fetchEvents();
    } catch (error) {
      console.error("Error toggling event:", error);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await del(`/academic-calendar/${deleting.id}`);
      setDeleting(null);
      await fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const eventsForDate = (date: Date) =>
    events.filter((event) => isSameDay(event.date, date));

  const selectedDateEvents = selectedDate ? eventsForDate(selectedDate) : [];

  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => (filter === "all" ? true : e.type === filter))
      .filter((e) =>
        search.trim() ? e.title.toLowerCase().includes(search.trim().toLowerCase()) : true,
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events, filter, search]);

  const upcoming = useMemo(
    () =>
      events
        .filter((e) => e.isActive && !isBefore(e.date, new Date()))
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 5),
    [events],
  );

  const stats = useMemo(
    () => ({
      total: events.length,
      active: events.filter((e) => e.isActive).length,
      upcoming: events.filter((e) => e.isActive && !isBefore(e.date, new Date())).length,
      months: Array.from(
        new Set(
          events.map((e) => `${e.date.getFullYear()}-${e.date.getMonth()}`),
        ),
      ).length,
    }),
    [events],
  );

  const monthLabel = format(currentDate, "MMMM yyyy");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <CalendarDays className="h-4 w-4" />
              <span className="uppercase tracking-wider text-xs">Registrar</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-1">
              Academic Calendar
            </h1>
            <p className="text-muted-foreground">
              Manage important dates, deadlines, and events for the university.
            </p>
          </div>
          <Button onClick={openAdd} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Total Events", value: stats.total, icon: CalendarDays, color: "text-primary" },
            { label: "Active", value: stats.active, icon: AlertTriangle, color: "text-emerald-500" },
            { label: "Upcoming", value: stats.upcoming, icon: Clock, color: "text-orange-500" },
            { label: "Active Months", value: stats.months, icon: GraduationCap, color: "text-violet-500" },
          ].map((s) => (
            <Card key={s.label} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={cn("h-11 w-11 rounded-xl bg-muted flex items-center justify-center", s.color)}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold leading-none">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <Card className="border-border/60 shadow-lg overflow-hidden">
              <CardHeader className="border-b bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl gradient-primary text-primary-foreground flex items-center justify-center shadow-primary">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>{monthLabel}</CardTitle>
                      <CardDescription>{format(currentDate, "yyyy")}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                      Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-7 gap-1.5 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div
                      key={day}
                      className="p-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {calendarDays.map((day) => {
                    const dayEvents = eventsForDate(day).filter((e) => e.isActive);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const inMonth = isSameMonth(day, currentDate);
                    const today = isToday(day);
                    const style = getEventStyle(dayEvents[0]?.type || "other");

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          "relative group flex flex-col items-center justify-start rounded-xl border p-2 min-h-[64px] sm:min-h-[72px] transition-all duration-150",
                          inMonth
                            ? "bg-card hover:bg-accent/60 border-border/60"
                            : "bg-muted/30 border-transparent opacity-45",
                          isSelected && "ring-2 ring-primary border-transparent bg-primary/5",
                          today && !isSelected && "border-primary/60 bg-primary/5",
                        )}
                      >
                        <span
                          className={cn(
                            "text-sm font-medium",
                            today && "text-primary font-bold",
                          )}
                        >
                          {format(day, "d")}
                        </span>
                        {dayEvents.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                            {dayEvents.slice(0, 3).map((e) => (
                              <span
                                key={e.id}
                                className={cn("h-1.5 w-1.5 rounded-full", getEventStyle(e.type).dot)}
                              />
                            ))}
                          </div>
                        )}
                        {dayEvents.length > 0 && (
                          <span className="absolute top-1 right-1 rounded-full bg-accent text-[9px] font-bold px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {dayEvents.length}
                          </span>
                        )}
                        {today && (
                          <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t">
                  {EVENT_TYPES.filter((t) => t !== "other").map((type) => (
                    <span key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={cn("h-2.5 w-2.5 rounded-full", getEventStyle(type).dot)} />
                      <span className="capitalize">{type}</span>
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Selected day + upcoming */}
          <div className="space-y-6">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  {selectedDate ? format(selectedDate, "EEEE, MMM d, yyyy") : "Select a date"}
                </CardTitle>
                <CardDescription>
                  {selectedDateEvents.length > 0
                    ? `${selectedDateEvents.length} event${selectedDateEvents.length > 1 ? "s" : ""} on this day`
                    : selectedDate ? "No events scheduled" : "Click a day in the calendar"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {selectedDateEvents.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                      <p className="text-sm">{selectedDate ? "Nothing here yet" : "Click a day to see events"}</p>
                    </motion.div>
                  ) : (
                    selectedDateEvents.map((event) => (
                      <motion.div
                        key={event.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        className={cn("rounded-xl border border-border/60 border-l-4 p-3 space-y-2", getEventStyle(event.type).card)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={cn("text-primary", getEventStyle(event.type).badge, "p-1.5 rounded-lg")}>
                              {typeIcon(event.type)}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold leading-tight truncate">{event.title}</p>
                              <Badge variant="outline" className="text-[10px] mt-0.5 capitalize">
                                {event.type}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(event)} title="Edit">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleting(event)} title="Delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        {event.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                        )}
                        {event.dueDate && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Due {format(event.dueDate, "MMM d, yyyy")}
                          </p>
                        )}
                        <div className="flex items-center justify-between pt-1 border-t">
                          <span className="text-xs text-muted-foreground">
                            {event.isActive ? "Active" : "Inactive"}
                          </span>
                          <Switch
                            checked={event.isActive}
                            onCheckedChange={() => toggleActive(event)}
                          />
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
                {selectedDate && (
                  <Button variant="outline" size="sm" className="w-full" onClick={openAdd}>
                    <Plus className="h-4 w-4 mr-1" /> Add event on this day
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcoming.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
                ) : (
                  upcoming.map((event) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className={cn("mt-1.5 h-2.5 w-2.5 rounded-full shrink-0", getEventStyle(event.type).dot)} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(event.date, "EEE, MMM d, yyyy")}
                          {event.dueDate && ` • Due ${format(event.dueDate, "MMM d")}`}
                        </p>
                      </div>
                      <button className="text-muted-foreground hover:text-primary" onClick={() => openEdit(event)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* All events */}
        <Card className="border-border/60 shadow-lg">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b bg-muted/20">
            <div>
              <CardTitle className="text-xl">All Events</CardTitle>
              <CardDescription>
                {filteredEvents.length} of {events.length} events
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 sm:w-48"
                />
              </div>
              <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
                <SelectTrigger className="sm:w-40">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-3" />
                <p className="text-muted-foreground">Loading events...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDays className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="text-lg font-medium">No events found</h3>
                <p className="text-muted-foreground text-sm">Try adjusting your search or add a new event.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredEvents.map((event) => {
                  const style = getEventStyle(event.type);
                  return (
                    <motion.div
                      key={event.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "rounded-xl border border-border/70 border-l-4 p-4 shadow-sm hover:shadow-md transition-shadow",
                        style.card,
                        !event.isActive && "opacity-60",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={cn("text-primary p-1.5 rounded-lg", style.badge)}>
                            {typeIcon(event.type)}
                          </span>
                          <div className="min-w-0">
                            <p className="font-semibold leading-tight truncate">{event.title}</p>
                            <Badge variant="outline" className="text-[10px] capitalize">{event.type}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(event)} title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleting(event)} title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <CalendarIcon className="h-4 w-4" /> {format(event.date, "EEE, MMM d")}
                        </span>
                        {event.dueDate && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" /> Due {format(event.dueDate, "MMM d")}
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <Badge variant={event.isActive ? "default" : "secondary"}>
                          {event.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => toggleActive(event)}>
                          {event.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Event" : "Add New Event"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the event details below." : "Create a new event for the academic calendar."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. End of Semester Exams"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date (optional)</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add details about this event..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={submit} disabled={!form.title.trim() || !form.date}>
              {editing ? "Save Changes" : "Add Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">{deleting?.title}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
