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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, Mail } from "lucide-react";
import { get, post, put, del } from "@/lib/api";
import { toast } from "sonner";
import type { EmailTemplate } from "@/types/settings";

const TOKEN_HINTS = ["{firstName}", "{otp}", "{setPasswordUrl}"];

export default function EmailTemplatesSection() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);

  const [templateKey, setTemplateKey] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await get<EmailTemplate[]>("/email-templates");
      setTemplates(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load email templates");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setTemplateKey("");
    setName("");
    setSubject("");
    setBody("");
    setDescription("");
    setActive(true);
    setModalOpen(true);
  };

  const openEdit = (t: EmailTemplate) => {
    setEditing(t);
    setTemplateKey(t.template_key);
    setName(t.name);
    setSubject(t.subject);
    setBody(t.body);
    setDescription(t.description || "");
    setActive(t.is_active);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!templateKey.trim() || !subject.trim() || !body.trim()) {
      toast.error("Template key, subject and body are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        template_key: templateKey.trim(),
        name: name || templateKey.trim(),
        subject,
        body,
        description,
        is_active: active,
      };
      if (editing) {
        await put(`/email-templates/${editing.id}`, payload);
        toast.success("Template updated");
      } else {
        await post("/email-templates", payload);
        toast.success("Template created");
      }
      setModalOpen(false);
      fetchTemplates();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save template";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t: EmailTemplate) => {
    if (!confirm(`Delete template "${t.name}"?`)) return;
    try {
      await del(`/email-templates/${t.id}`);
      toast.success("Template deleted");
      fetchTemplates();
    } catch {
      toast.error("Failed to delete template");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-8">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading email templates...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Email Templates</h3>
          <p className="text-sm text-muted-foreground">
            Customize the transactional emails the system sends.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          <Mail className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
          No email templates yet. Click "New Template" to create one.
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Template Key</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="font-medium">{t.name}</div>
                    {t.description && (
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {t.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted rounded px-1.5 py-0.5">
                      {t.template_key}
                    </code>
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate">
                    {t.subject}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        t.is_active
                          ? "bg-green-100 text-green-800 border-green-200"
                          : ""
                      }
                    >
                      {t.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(t)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(t)}
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
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Email Template" : "New Email Template"}
            </DialogTitle>
            <DialogDescription>
              Use placeholders like{" "}
              {TOKEN_HINTS.map((t) => (
                <code key={t} className="text-xs bg-muted rounded px-1">
                  {t}
                </code>
              ))}{" "}
              which are replaced at send time.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="et-key">Template Key *</Label>
                <Input
                  id="et-key"
                  value={templateKey}
                  onChange={(e) => setTemplateKey(e.target.value)}
                  placeholder="e.g. otp_email"
                  disabled={!!editing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="et-name">Name</Label>
                <Input
                  id="et-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. OTP Verification Email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="et-subject">Subject *</Label>
              <Input
                id="et-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Your verification code"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="et-body">Body *</Label>
              <Textarea
                id="et-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                placeholder={"<p>Hi {firstName}, your code is {otp}</p>"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="et-desc">Description</Label>
              <Input
                id="et-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Used for which email"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={active}
                onCheckedChange={setActive}
                id="et-active"
              />
              <Label htmlFor="et-active" className="cursor-pointer">
                {active ? "Active" : "Inactive"}
              </Label>
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
                "Update Template"
              ) : (
                "Create Template"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}