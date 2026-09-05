import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Building,
  CreditCard,
  Mail,
  Loader2,
  Phone,
  AtSign,
} from "lucide-react";
import { get, put } from "@/lib/api";
import { toast } from "sonner";
import type { RegistrarProfile } from "@/types/settings";

export default function ProfileSection() {
  const userId = localStorage.getItem("user_id");
  const [profile, setProfile] = useState<RegistrarProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const data = await get<RegistrarProfile>(`/registrars/${userId}`);
        setProfile(data);
        localStorage.setItem("registrar_college", data.college || "");
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  const update = (patch: Partial<RegistrarProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const saved = await put<RegistrarProfile>(`/registrars/${userId}`, {
        first_name: profile.first_name,
        last_name: profile.last_name,
        employee_id: profile.employee_id,
        department: profile.department,
        college: profile.college,
        phone_number: profile.phone_number,
      });
      setProfile(saved);
      localStorage.setItem("registrar_college", saved.college || "");
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-8">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-8 text-sm text-muted-foreground">
        You must be signed in to view your profile.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Your registrar account details. Email and username cannot be changed.
        </p>
      </div>

      <div className="max-w-xl space-y-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={profile.email} disabled className="pl-10 bg-muted/50" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Username</Label>
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={profile.username} disabled className="pl-10 bg-muted/50" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="prof-first">First Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="prof-first"
                value={profile.first_name}
                onChange={(e) => update({ first_name: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prof-last">Last Name</Label>
            <Input
              id="prof-last"
              value={profile.last_name}
              onChange={(e) => update({ last_name: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="prof-employee">Employee ID</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="prof-employee"
                value={profile.employee_id}
                onChange={(e) => update({ employee_id: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prof-phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="prof-phone"
                value={profile.phone_number || ""}
                onChange={(e) => update({ phone_number: e.target.value })}
                className="pl-10"
                placeholder="+256..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prof-dept">Department</Label>
          <Input
            id="prof-dept"
            value={profile.department}
            onChange={(e) => update({ department: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="prof-college">College / Institution</Label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="prof-college"
              value={profile.college}
              onChange={(e) => update({ college: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              "Save Profile"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}