import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FileText, Search, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Transcripts() {
  const navigate = useNavigate();

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [studentNumber, setStudentNumber] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/");
        return;
      }
    };

    checkAuth();
  }, [navigate]);

  const handleGenerateTranscript = async (e: FormEvent) => {
    e.preventDefault();

    if (!studentNumber.trim()) {
      toast.error("Please enter a student number.");
      return;
    }

    try {
      setIsGenerating(true);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      toast.success(
        "Transcript generated successfully. Connect your backend to download the actual file.",
      );
      setIsGenerateOpen(false);
      setStudentNumber("");
      setAcademicYear("");
    } catch (err: any) {
      console.error("Transcript generation error:", err);
      toast.error("Failed to generate transcript.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Transcripts
            </h1>
            <p className="mt-1 text-muted-foreground">
              Access and manage student academic transcripts
            </p>
          </div>
          <Button onClick={() => setIsGenerateOpen(true)}>
            <Download className="h-5 w-5 mr-2" />
            Generate Transcript
          </Button>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by student name or number..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Empty State */}
        <div className="rounded-xl border border-border bg-card p-16 text-center">
          <div className="flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent mb-6">
              <FileText className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground">
              Transcript Management
            </h3>
            <p className="mt-2 text-muted-foreground max-w-md">
              Search for a student to view or generate their academic
              transcript. Transcripts include all courses, grades, and GPA
              calculations.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => navigate("/students")}>
                View Students
              </Button>
              <Button onClick={() => setIsGenerateOpen(true)}>
                Generate New Transcript
              </Button>
            </div>
          </div>
        </div>
        {/* Generate transcript modal */}
        <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
          <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Generate Transcript</DialogTitle>
              <DialogDescription>
                Enter the student details to generate an academic transcript.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={handleGenerateTranscript}
              className="space-y-4 mt-2"
            >
              <div className="space-y-2">
                <Label htmlFor="studentNumber">Student number</Label>
                <Input
                  id="studentNumber"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  placeholder="e.g. 21/U/12345/PS"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic year (optional)</Label>
                <Input
                  id="academicYear"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="e.g. 2023/2024"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsGenerateOpen(false)}
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isGenerating}>
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
