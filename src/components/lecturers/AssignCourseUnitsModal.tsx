import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
} from "@/lib/firebase";
import { toast } from "sonner";
import { Course, CourseUnit } from "@/types/course";
import { Lecturer } from "@/types/lecturer";

interface AssignProps {
  isOpen: boolean;
  onClose: () => void;
  lecturer: Lecturer;
  onSuccess: (updatedLecturer: Lecturer) => void;
}

export function AssignCourseUnitsModal({
  isOpen,
  onClose,
  lecturer,
  onSuccess,
}: AssignProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseUnits, setCourseUnits] = useState<CourseUnit[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>(
    lecturer.assigned_course_units || [],
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedUnitIds(lecturer.assigned_course_units || []);
      fetchRegistrarData();
    }
  }, [isOpen, lecturer]);

  const fetchRegistrarData = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const registrarDoc = await getDoc(doc(db, "registrars", user.uid));
      if (registrarDoc.exists()) {
        const data = registrarDoc.data();
        await fetchData(data.college);
      } else {
        // Fallback for missing registrar document
        await fetchData("");
      }
    } catch (error) {
      console.error("Error fetching registrar data:", error);
      toast.error("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (college: string) => {
    try {
      // Fetch Courses
      let coursesQuery = collection(db, "courses") as any;
      if (college) {
        coursesQuery = query(
          collection(db, "courses"),
          where("college", "==", college),
        );
      }

      const coursesSnap = await getDocs(coursesQuery);
      const coursesData = coursesSnap.docs
        .map(
          (doc) =>
            ({
              id: doc.id,
              ...(doc.data() as Record<string, unknown>),
            }) as Course,
        )
        .sort((a, b) => a.name.localeCompare(b.name));
      setCourses(coursesData);

      // Fetch Course Units
      const unitsSnap = await getDocs(collection(db, "course_units"));
      const unitsData = unitsSnap.docs
        .map((doc) => {
          const data = doc.data();
          const course = coursesData.find((c) => c.id === data.course_id);
          return {
            id: doc.id,
            ...data,
            course_name: course?.name || "Unknown Course",
          } as CourseUnit;
        })
        .filter((unit) => coursesData.some((c) => c.id === unit.course_id)) // Only show units for courses in this college
        .sort((a, b) => a.name.localeCompare(b.name));

      setCourseUnits(unitsData);
    } catch (error) {
      console.error("Error fetching courses/units:", error);
      toast.error("Failed to load courses");
    }
  };

  const handleToggleUnit = (unitId: string) => {
    setSelectedUnitIds((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId],
    );
  };

  const handleSave = async () => {
    if (!lecturer.id) return;

    setSaving(true);
    try {
      // 1. Update the profile with the array of units
      const docRef = doc(db, "profiles", lecturer.id);
      await updateDoc(docRef, {
        assigned_course_units: selectedUnitIds,
      });

      // 2. Save individual records to the "Sign Up" collection
      for (const unitId of selectedUnitIds) {
        // Find the unit details
        const unit = courseUnits.find((u) => u.id === unitId);

        // Find existing assigned records to prevent duplicates
        const signUpQuery = query(
          collection(db, "Sign Up"),
          where("lecturer_id", "==", lecturer.id),
          where("course_unit_id", "==", unitId),
        );
        const existingDocs = await getDocs(signUpQuery);

        if (existingDocs.empty) {
          // Add new record to 'Sign Up'
          await addDoc(collection(db, "Sign Up"), {
            lecturer_id: lecturer.id,
            lecturer_name: `${lecturer.first_name} ${lecturer.last_name}`,
            lecturer_email: lecturer.email,
            course_unit_id: unitId,
            course_unit_code: unit?.code || "",
            course_unit_name: unit?.name || "",
            course_id: unit?.course_id || "",
            assigned_by: auth.currentUser?.uid || "system",
            assigned_at: new Date().toISOString(),
            status: "active",
          });
        }
      }

      // 3. Remove units that were unchecked
      const allCurrentSignUps = await getDocs(
        query(
          collection(db, "Sign Up"),
          where("lecturer_id", "==", lecturer.id),
        ),
      );

      for (const docSnapshot of allCurrentSignUps.docs) {
        const data = docSnapshot.data();
        if (!selectedUnitIds.includes(data.course_unit_id)) {
          await deleteDoc(doc(db, "Sign Up", docSnapshot.id));
        }
      }

      toast.success("Assigned units saved successfully");
      onSuccess({ ...lecturer, assigned_course_units: selectedUnitIds });
      onClose();
    } catch (error) {
      console.error("Error assigning units:", error);
      toast.error("Failed to update assigned units");
    } finally {
      setSaving(false);
    }
  };

  const filteredUnits =
    selectedCourseId === "all"
      ? courseUnits
      : courseUnits.filter((u) => u.course_id === selectedCourseId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Course Units</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Reassign teaching units for{" "}
            <strong>
              {lecturer.first_name} {lecturer.last_name}
            </strong>
            . This updates the units available in their portal immediately.
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4 flex-1 overflow-hidden">
          <div className="flex gap-4">
            <div className="flex-1">
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="flex-1 border rounded-md">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredUnits.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No course units found.
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {courses
                  .filter(
                    (c) =>
                      selectedCourseId === "all" || c.id === selectedCourseId,
                  )
                  .map((course) => {
                    const courseGroupUnits = filteredUnits.filter(
                      (u) => u.course_id === course.id,
                    );
                    if (courseGroupUnits.length === 0) return null;

                    return (
                      <div
                        key={course.id}
                        className="space-y-3 pb-4 border-b last:border-0"
                      >
                        <h4 className="font-semibold text-primary">
                          {course.code} - {course.name}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4">
                          {courseGroupUnits.map((unit) => (
                            <div
                              key={unit.id}
                              className="flex items-start space-x-3 bg-secondary/20 p-2 rounded-md"
                            >
                              <Checkbox
                                id={`unit-${unit.id}`}
                                checked={selectedUnitIds.includes(unit.id)}
                                onCheckedChange={() =>
                                  handleToggleUnit(unit.id)
                                }
                              />
                              <div className="grid gap-1.5 leading-none">
                                <label
                                  htmlFor={`unit-${unit.id}`}
                                  className="text-sm font-medium leading-none cursor-pointer"
                                >
                                  {unit.code} - {unit.name}
                                </label>
                                <p className="text-xs text-muted-foreground">
                                  Year {unit.year}, Sem {unit.semester} •{" "}
                                  {unit.credits} Credits
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter className="mt-auto pt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving..." : "Save Assigned Units"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
