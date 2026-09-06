import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ListChecks,
  Star,
  TextCursorInput,
  CheckSquare,
  GripVertical,
  Send,
  Lock,
} from "lucide-react";
import { get, post, put, del, patch } from "@/lib/api";
import { toast } from "sonner";
import type {
  Survey,
  SurveyQuestion,
  SurveyQuestionType,
  SurveyStatus,
  CourseUnitOption,
} from "@/types/settings";

const STATUS_COLORS: Record<SurveyStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-800 border-gray-200",
  PUBLISHED: "bg-green-100 text-green-800 border-green-200",
  CLOSED: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

const TYPE_META: Record<SurveyQuestionType, { label: string; icon: typeof Star }> = {
  RATING: { label: "Rating", icon: Star },
  TEXT: { label: "Text", icon: TextCursorInput },
  CHOICE: { label: "Choice", icon: CheckSquare },
};

interface QuestionDraft extends Partial<SurveyQuestion> {
  id?: number;
  text: string;
  type: SurveyQuestionType;
  required: boolean;
  sort_order: number;
  options: string;
}

const emptyQuestion = (order: number): QuestionDraft => ({
  text: "",
  type: "RATING",
  required: true,
  sort_order: order,
  options: "",
});

export default function EvaluationsSection() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [courseUnits, setCourseUnits] = useState<CourseUnitOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Survey | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("1");
  const [courseUnitId, setCourseUnitId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<SurveyStatus>("DRAFT");
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    emptyQuestion(0),
  ]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, cu] = await Promise.all([
        get<Survey[]>("/evaluations/surveys"),
        get<CourseUnitOption[]>("/course-units").catch(() => []),
      ]);
      setSurveys(Array.isArray(s) ? s : []);
      setCourseUnits(Array.isArray(cu) ? cu : []);
    } catch {
      toast.error("Failed to load evaluations");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setDescription("");
    setYear(String(new Date().getFullYear()));
    setSemester("1");
    setCourseUnitId("");
    setDeadline("");
    setStatus("DRAFT");
    setQuestions([emptyQuestion(0)]);
    setModalOpen(true);
  };

  const openEdit = (s: Survey) => {
    setEditing(s);
    setTitle(s.title);
    setDescription(s.description || "");
    setYear(String(s.year));
    setSemester(String(s.semester));
    setCourseUnitId(s.course_unit_id ? String(s.course_unit_id) : "");
    setDeadline(s.deadline || "");
    setStatus(s.status);
    setQuestions(
      s.questions.length
        ? s.questions.map((q) => ({
            id: q.id,
            text: q.text,
            type: q.type,
            required: q.required,
            sort_order: q.sort_order,
            options: q.options || "",
          }))
        : [emptyQuestion(0)],
    );
    setModalOpen(true);
  };

  const handleQuestionChange = (
    index: number,
    patch: Partial<QuestionDraft>,
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...patch } : q)),
    );
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion(prev.length)]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, sort_order: i })),
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Survey title is required");
      return;
    }
    const validQuestions = questions.filter((q) => q.text.trim());
    if (validQuestions.length === 0) {
      toast.error("Add at least one question");
      return;
    }
    for (const q of validQuestions) {
      if (q.type === "CHOICE" && !q.options.trim()) {
        toast.error(`Question "${q.text}" needs options (comma separated)`);
        return;
      }
    }
    const payload = {
      title,
      description,
      year: parseInt(year) || new Date().getFullYear(),
      semester: parseInt(semester) || 1,
      course_unit_id: courseUnitId ? parseInt(courseUnitId) : null,
      status,
      deadline: deadline || null,
      questions: validQuestions.map((q, i) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        required: q.required,
        sort_order: i,
        options: q.options || undefined,
      })),
    };
    setSaving(true);
    try {
      if (editing) {
        await put(`/evaluations/surveys/${editing.id}`, payload);
        toast.success("Survey updated");
      } else {
        await post("/evaluations/surveys", payload);
        toast.success("Survey created");
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save survey";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (survey: Survey, next: SurveyStatus) => {
    try {
      await patch(`/evaluations/surveys/${survey.id}/status`, { status: next });
      toast.success(`Survey ${next.toLowerCase()}`);
      fetchAll();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      toast.error(message);
    }
  };

  const handleDelete = async (survey: Survey) => {
    if (!confirm(`Delete survey "${survey.title}"?`)) return;
    try {
      await del(`/evaluations/surveys/${survey.id}`);
      toast.success("Survey deleted");
      fetchAll();
    } catch {
      toast.error("Failed to delete survey");
    }
  };

  const courseOptions = () => {
    const unique = new Map<number, CourseUnitOption>();
    for (const cu of courseUnits) unique.set(cu.id, cu);
    return [...unique.values()];
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-8">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading evaluations...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Evaluations</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage course unit evaluation surveys
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Survey
        </Button>
      </div>

      {surveys.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          <ListChecks className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
          No evaluation surveys yet. Click "New Survey" to create one.
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Survey</TableHead>
                <TableHead>Course Unit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surveys.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{s.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.questions.length} question
                      {s.questions.length !== 1 ? "s" : ""} &middot; Year{" "}
                      {s.year} &middot; Semester {s.semester}
                    </div>
                  </TableCell>
                  <TableCell>
                    {s.course_unit_code ? (
                      <div>
                        <div className="font-medium">{s.course_unit_code}</div>
                        <div className="text-xs text-muted-foreground">
                          {s.course_unit_name}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">General</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={STATUS_COLORS[s.status]}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {s.deadline
                      ? new Date(s.deadline).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {s.status === "DRAFT" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Publish"
                          onClick={() =>
                            handleStatusChange(s, "PUBLISHED")
                          }
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      {s.status === "PUBLISHED" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Close"
                          onClick={() => handleStatusChange(s, "CLOSED")}
                        >
                          <Lock className="h-4 w-4" />
                        </Button>
                      )}
                      {s.status === "PUBLISHED" || s.status === "CLOSED" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Reopen as draft"
                          onClick={() => handleStatusChange(s, "DRAFT")}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Edit"
                          disabled={s.status === "CLOSED"}
                          onClick={() => openEdit(s)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(s)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Survey" : "New Evaluation Survey"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the survey details and questions."
                : "Build a survey for a course unit or a general evaluation."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="ev-title">Title *</Label>
              <Input
                id="ev-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Semester One Course Evaluation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ev-desc">Description</Label>
              <Textarea
                id="ev-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Short description shown to students"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="ev-year">Year *</Label>
                <Input
                  id="ev-year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ev-semester">Semester *</Label>
                <Input
                  id="ev-semester"
                  type="number"
                  min={1}
                  max={2}
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Course Unit</Label>
                <Select
                  value={courseUnitId}
                  onValueChange={setCourseUnitId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="General" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">General (no course unit)</SelectItem>
                    {courseOptions().map((cu) => (
                      <SelectItem key={cu.id} value={String(cu.id)}>
                        {cu.code} &middot; {cu.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ev-deadline">Deadline</Label>
                <Input
                  id="ev-deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as SurveyStatus)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border">
              <div className="border-b px-4 py-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Questions ({questions.length})</h4>
                  <Button variant="outline" size="sm" onClick={addQuestion}>
                    <Plus className="mr-1 h-4 w-4" />
                    Add Question
                  </Button>
                </div>
              </div>
              <div className="divide-y">
                {questions.map((q, index) => {
                  const TypeIcon = TYPE_META[q.type].icon;
                  return (
                    <div key={index} className="space-y-3 p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          {index + 1}.
                        </span>
                        <Input
                          value={q.text}
                          onChange={(e) =>
                            handleQuestionChange(index, { text: e.target.value })
                          }
                          placeholder="Question text"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-destructive"
                          onClick={() => removeQuestion(index)}
                          disabled={questions.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 pl-7">
                        <Select
                          value={q.type}
                          onValueChange={(v) =>
                            handleQuestionChange(index, {
                              type: v as SurveyQuestionType,
                            })
                          }
                        >
                          <SelectTrigger className="w-36 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(TYPE_META) as SurveyQuestionType[]).map(
                              (t) => (
                                <SelectItem key={t} value={t}>
                                  {TYPE_META[t].label}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        {q.type === "CHOICE" && (
                          <Input
                            value={q.options}
                            onChange={(e) =>
                              handleQuestionChange(index, {
                                options: e.target.value,
                              })
                            }
                            placeholder="Options: comma separated"
                            className="flex-1 min-w-[200px] h-8 text-xs"
                          />
                        )}
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={q.required}
                            onCheckedChange={(v) =>
                              handleQuestionChange(index, { required: v })
                            }
                          />
                          <Label className="text-xs cursor-pointer">
                            Required
                          </Label>
                        </div>
                      </div>
                      {q.type === "RATING" && (
                        <p className="pl-7 text-xs text-muted-foreground flex items-center gap-1">
                          <TypeIcon className="h-3 w-3" />
                          Students rate on a 1-5 scale.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editing ? (
                "Update Survey"
              ) : (
                "Create Survey"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}