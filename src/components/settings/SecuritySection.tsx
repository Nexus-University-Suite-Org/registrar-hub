import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, KeyRound, MonitorSmartphone, LogOut } from "lucide-react";
import { get, post, del } from "@/lib/api";
import { toast } from "sonner";
import type { AuthSession } from "@/types/settings";

export default function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await get<AuthSession[]>("/v1/auth/sessions");
        setSessions(Array.isArray(data) ? data : []);
      } catch {
        toast.error("Failed to load active sessions");
      } finally {
        setSessionsLoading(false);
      }
    };
    load();
  }, []);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Fill in both password fields");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      await post("/v1/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to change password";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOutAll = async () => {
    if (!confirm("Sign out of all other sessions?")) return;
    setRevoking(true);
    try {
      await del("/v1/auth/sessions");
      toast.success("Signed out of all other sessions");
      const data = await get<AuthSession[]>("/v1/auth/sessions");
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to sign out other sessions");
    } finally {
      setRevoking(false);
    }
  };

  const deviceLabel = (s: AuthSession) => {
    const created = s.created_at ? new Date(s.created_at) : null;
    const expires = s.expires_at ? new Date(s.expires_at) : null;
    const parts: string[] = [];
    if (created) parts.push(`Started ${created.toLocaleDateString()} ${created.toLocaleTimeString()}`);
    if (expires) parts.push(`Expires ${expires.toLocaleDateString()}`);
    return parts.join(" · ");
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold">Security</h3>
        <p className="text-sm text-muted-foreground">
          Change your password and manage active sign-in sessions.
        </p>
      </div>

      <div className="max-w-md space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-medium">Change Password</h4>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sec-current">Current Password</Label>
          <Input
            id="sec-current"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="sec-new">New Password</Label>
            <Input
              id="sec-new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sec-confirm">Confirm Password</Label>
            <Input
              id="sec-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleChangePassword} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </div>
      </div>

      <div className="max-w-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
            <h4 className="font-medium">Active Sessions</h4>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={revoking || sessionsLoading}
            onClick={handleSignOutAll}
          >
            {revoking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Sign Out Others
          </Button>
        </div>

        {sessionsLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-6">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading sessions...
          </div>
        ) : (
          <div className="mt-3 divide-y rounded-lg border">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <div className="font-medium">Refresh token session</div>
                  <div className="text-sm text-muted-foreground">
                    {deviceLabel(s)}
                  </div>
                </div>
                <Switch checked={s.active} disabled aria-readonly />
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground">
                No active sessions found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}