import { useState, useEffect } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot,
  db,
} from "@/lib/firebase";

interface Event {
  id: string;
  title: string;
  date: Date;
  dueDate?: Date;
  type: string;
  description?: string;
  isActive: boolean;
}

const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Mid-term Exams",
    date: new Date(2026, 2, 15),
    type: "exam",
    description: "Computer Science mid-term examinations",
    isActive: true,
  },
  {
    id: "2",
    title: "Grade Submission Deadline",
    date: new Date(2026, 2, 20),
    dueDate: new Date(2026, 2, 20),
    type: "deadline",
    description: "All grades must be submitted by end of day",
    isActive: true,
  },
  {
    id: "3",
    title: "Faculty Meeting",
    date: new Date(2026, 2, 10),
    type: "meeting",
    description: "Monthly faculty meeting in conference room A",
    isActive: true,
  },
  {
    id: "4",
    title: "Spring Break",
    date: new Date(2026, 2, 25),
    type: "holiday",
    description: "Spring break begins",
    isActive: true,
  },
];

const getEventColor = (type: string) => {
  switch (type) {
    case "exam":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    case "deadline":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case "meeting":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "holiday":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const eventsCollection = collection(db, "AcademicCalendar");

    // Set up real-time listener
    const unsubscribe = onSnapshot(eventsCollection, (snapshot) => {
      const eventsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        dueDate: doc.data().dueDate?.toDate(),
      })) as Event[];
      setEvents(eventsData);
      setLoading(false);

      // Check for expired events and deactivate them
      const now = new Date();
      eventsData.forEach((event) => {
        if (event.dueDate && event.dueDate < now && event.isActive) {
          updateDoc(doc(db, "AcademicCalendar", event.id), {
            isActive: false,
          });
        }
      });
    });

    return () => unsubscribe();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const eventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.date, date));
  };

  const selectedDateEvents = selectedDate ? eventsForDate(selectedDate) : [];

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const addEvent = async () => {
    if (newEvent.title && newEvent.date && newEvent.type) {
      try {
        await addDoc(collection(db, "AcademicCalendar"), {
          title: newEvent.title,
          date: newEvent.date,
          dueDate: newEvent.dueDate || null,
          type: newEvent.type,
          description: newEvent.description || "",
          isActive: true,
        });
        setNewEvent({});
        setIsAddEventOpen(false);
      } catch (error) {
        console.error("Error adding event:", error);
      }
    }
  };

  const toggleEventActive = async (eventId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "AcademicCalendar", eventId), {
        isActive: !currentStatus,
      });
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">
              View important dates, deadlines, and events
            </p>
          </div>
          <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
                <DialogDescription>
                  Create a new event for the calendar.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={newEvent.title || ""}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={
                      newEvent.date ? format(newEvent.date, "yyyy-MM-dd") : ""
                    }
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        date: new Date(e.target.value),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dueDate" className="text-right">
                    Due Date
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={
                      newEvent.dueDate
                        ? format(newEvent.dueDate, "yyyy-MM-dd")
                        : ""
                    }
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        dueDate: new Date(e.target.value),
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <Input
                    id="type"
                    value={newEvent.type || ""}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, type: e.target.value })
                    }
                    list="event-types"
                    placeholder="Type or select event type"
                    className="col-span-3"
                  />
                  <datalist id="event-types">
                    <option value="exam" />
                    <option value="deadline" />
                    <option value="meeting" />
                    <option value="holiday" />
                  </datalist>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={newEvent.description || ""}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={addEvent}>
                  Add Event
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{format(currentDate, "MMMM yyyy")}</CardTitle>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={prevMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={nextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="p-2 text-center text-sm font-medium text-muted-foreground"
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day) => {
                    const dayEvents = eventsForDate(day).filter(
                      (event) => event.isActive,
                    );
                    const isSelected =
                      selectedDate && isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, currentDate);

                    return (
                      <Button
                        key={day.toISOString()}
                        variant={isSelected ? "default" : "ghost"}
                        className={`h-12 w-full p-1 relative ${
                          !isCurrentMonth
                            ? "text-muted-foreground opacity-50"
                            : ""
                        }`}
                        onClick={() => setSelectedDate(day)}
                      >
                        <span className="text-sm">{format(day, "d")}</span>
                        {dayEvents.length > 0 && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                            {dayEvents.slice(0, 3).map((event, index) => (
                              <div
                                key={event.id}
                                className={`w-1.5 h-1.5 rounded-full ${getEventColor(event.type).split(" ")[0]}`}
                              />
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                            )}
                          </div>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate
                    ? format(selectedDate, "MMMM d, yyyy")
                    : "Select a date"}
                </CardTitle>
                <CardDescription>
                  {selectedDateEvents.length > 0
                    ? `${selectedDateEvents.length} event${selectedDateEvents.length > 1 ? "s" : ""}`
                    : "No events scheduled"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDateEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No events on this date
                    </p>
                  </div>
                ) : (
                  selectedDateEvents.map((event) => (
                    <div key={event.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{event.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={getEventColor(event.type)}>
                            {event.type}
                          </Badge>
                          <Badge
                            variant={event.isActive ? "default" : "secondary"}
                          >
                            {event.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                      {event.dueDate && (
                        <p className="text-sm text-muted-foreground">
                          Due: {format(event.dueDate, "MMM d, yyyy")}
                        </p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toggleEventActive(event.id, event.isActive)
                        }
                        className="w-full"
                      >
                        {event.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {events
                  .filter((event) => event.date >= new Date() && event.isActive)
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 5)
                  .map((event) => (
                    <div key={event.id} className="flex items-start space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${getEventColor(event.type).split(" ")[0]}`}
                      />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(event.date, "MMM d, yyyy")}
                          {event.dueDate &&
                            ` • Due: ${format(event.dueDate, "MMM d")}`}
                        </p>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* All Events List */}
        <Card>
          <CardHeader>
            <CardTitle>All Events</CardTitle>
            <CardDescription>
              Complete list of all calendar events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading events...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No events</h3>
                <p className="text-muted-foreground">
                  No events have been added yet. Click "Add Event" to create
                  your first event.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {events
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .map((event) => (
                    <div
                      key={event.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        event.isActive
                          ? "bg-background border-border"
                          : "bg-muted/50 border-muted"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-3 h-3 rounded-full ${getEventColor(event.type).split(" ")[0]}`}
                        />
                        <div>
                          <h4
                            className={`font-medium ${!event.isActive && "text-muted-foreground"}`}
                          >
                            {event.title}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{format(event.date, "MMM d, yyyy")}</span>
                            <Badge variant="outline" className="text-xs">
                              {event.type}
                            </Badge>
                            {event.dueDate && (
                              <span>
                                Due: {format(event.dueDate, "MMM d, yyyy")}
                              </span>
                            )}
                            <Badge
                              variant={event.isActive ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {event.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toggleEventActive(event.id, event.isActive)
                        }
                      >
                        {event.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
