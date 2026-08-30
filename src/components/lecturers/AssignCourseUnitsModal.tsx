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
import { get, post, put, del } from "@/lib/api";
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
  const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const LECTURER_BACKEND_URL = "http://localhost:8084";

  useEffect(() => {
    if (isOpen) {
      fetchAssignedUnits();
      fetchRegistrarData();
    }
  }, [isOpen, lecturer]);

  const fetchAssignedUnits = async () => {
    try {
      const [lpProfilesResp, lpUnitsResp, regUnitsResp] = await Promise.all([
        fetch(`${LECTURER_BACKEND_URL}/api/profiles/?role=lecturer`),
        fetch(`${LECTURER_BACKEND_URL}/api/course-units/`),
        get<CourseUnit[]>("/course-units/"),
      ]);
      const lpProfiles = await lpProfilesResp.json();
      const lpUnits = await lpUnitsResp.json();
      const profile = lpProfiles?.find(
        (p: any) =>
          String(p.id) === String(lecturer.id) ||
          String(p.email)?.toLowerCase() ===
            String(lecturer.email)?.toLowerCase(),
      );
      const lpAssignedIds: number[] = profile?.assigned_course_units || [];

      const lpIdToCode: Record<number, string> = {};
      (lpUnits || []).forEach((u: any) => {
        lpIdToCode[u.id] = u.code;
      });
      const assignedCodes = lpAssignedIds
        .map((id) => lpIdToCode[id])
        .filter(Boolean);

      const regIdByCode: Record<string, number> = {};
      (regUnitsResp || []).forEach((u) => {
        regIdByCode[u.code] = u.id;
      });
      const regIds = assignedCodes
        .map((code) => regIdByCode[code])
        .filter((id) => id != null);

      setSelectedUnitIds(regIds);
    } catch (e) {
      console.warn("Failed to fetch assigned units from lecturer portal:", e);
      setSelectedUnitIds(lecturer.assigned_course_units?.map(Number) || []);
    }
  };

  const fetchRegistrarData = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      const registrar = await get<any>(`/registrars/${userId}/`);
      await fetchData(registrar?.college || "");
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
      const coursesData = await get<Course[]>(
        college
          ? `/courses/?college=${encodeURIComponent(college)}`
          : "/courses/",
      );
      coursesData.sort((a, b) => a.name.localeCompare(b.name));
      setCourses(coursesData);

      // Fetch Course Units
      const unitsData = await get<CourseUnit[]>("/course-units/");
      unitsData.forEach((unit) => {
        const course = coursesData.find((c) => c.id === unit.course_id);
        unit.course_name = course?.name || "Unknown Course";
      });
      const filteredUnits = unitsData.filter((unit) =>
        coursesData.some((c) => c.id === unit.course_id),
      );
      filteredUnits.sort((a, b) => a.name.localeCompare(b.name));

      setCourseUnits(filteredUnits);
    } catch (error) {
      console.error("Error fetching courses/units:", error);
      toast.error("Failed to load courses");
    }
  };

  const handleToggleUnit = (unitId: number) => {
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
      await put(`/profiles/${lecturer.id}/`, {
        assigned_course_units: selectedUnitIds,
      });

      // 2. Save individual records to the "sign-ups" collection
      const existingSignUps = await get<any[]>(
        `/sign-ups/?lecturer_id=${lecturer.id}`,
      );
      const existingUnitIds = existingSignUps.map((s: any) => s.course_unit_id);

      for (const unitId of selectedUnitIds) {
        if (existingUnitIds.includes(unitId)) continue;
        const unit = courseUnits.find((u) => u.id === unitId);
        await post("/sign-ups/", {
          lecturer_id: lecturer.id,
          lecturer_name: `${lecturer.first_name} ${lecturer.last_name}`,
          lecturer_email: lecturer.email,
          course_unit_id: unitId,
          course_unit_code: unit?.code || "",
          course_unit_name: unit?.name || "",
          course_id: unit?.course_id || "",
          assigned_by: localStorage.getItem("user_id") || "system",
          assigned_at: new Date().toISOString(),
          status: "active",
        });
      }

      // 3. Remove units that were unchecked
      for (const signUp of existingSignUps) {
        if (!selectedUnitIds.includes(signUp.course_unit_id)) {
          await del(`/sign-ups/${signUp.id}/`);
        }
      }

      // 4. Sync course units to lecturer-portal backend
      const assignedUnits = courseUnits.filter((u) =>
        selectedUnitIds.includes(u.id),
      );
      if (assignedUnits.length > 0) {
        try {
          await fetch(`${LECTURER_BACKEND_URL}/api/profiles/course-units/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              assignedUnits.map((u) => ({
                id: Number(u.id),
                code: u.code,
                name: u.name,
                credits: u.credits,
                semester: u.semester,
                year: u.year,
              })),
            ),
          });
        } catch (e) {
          console.warn("Failed to sync course units to lecturer portal:", e);
        }
      }

      // 5. Update assigned units on lecturer-portal backend using codes to map IDs
      try {
        const lpUnitsResp = await fetch(
          `${LECTURER_BACKEND_URL}/api/course-units/`,
        );
        const lpUnits = await lpUnitsResp.json();
        const codeToLpId: Record<string, number> = {};
        (lpUnits || []).forEach((u: any) => {
          codeToLpId[u.code] = u.id;
        });
        const lpIds = assignedUnits
          .map((u) => codeToLpId[u.code])
          .filter((id) => id != null);

        await fetch(
          `${LECTURER_BACKEND_URL}/api/profiles/by-email/${encodeURIComponent(lecturer.email)}/assigned-units`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              assigned_course_units: lpIds,
            }),
          },
        );
      } catch (e) {
        console.warn("Failed to update assigned units on lecturer portal:", e);
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
