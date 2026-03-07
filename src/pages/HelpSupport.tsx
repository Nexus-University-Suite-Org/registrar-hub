import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  HelpCircle,
  BookOpen,
  Mail,
  MessageCircle,
  FileQuestion,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";

const faqs = [
  {
    question: "How do I manage student records?",
    answer:
      "Navigate to the Students section from the sidebar to view, add, edit, or export student records. You can filter by status, college, or search by name or registration number.",
  },
  {
    question: "How do I generate transcripts?",
    answer:
      "Go to the Transcripts page, select the student(s) you need, choose the transcript type, and generate. Transcripts can be downloaded as PDF or printed.",
  },
  {
    question: "How do I reset my password?",
    answer:
      "On the sign-in page, click 'Forgot password?' below the Sign In button. Enter your email and we'll send you a link to reset your password.",
  },
  {
    question: "Where can I find reports?",
    answer:
      "The Reports section provides enrollment statistics, academic performance summaries, and custom report generation. Use filters to narrow down by college, department, or date range.",
  },
];

const resources = [
  { name: "User Guide", icon: BookOpen, href: "#", description: "Complete documentation" },
  { name: "Video Tutorials", icon: FileQuestion, href: "#", description: "Step-by-step guides" },
];

export default function HelpSupport() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Help & Support
          </h1>
          <p className="mt-1 text-muted-foreground">
            Get assistance, browse FAQs, and find resources to use the Registrar Portal
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="mailto:support@registrar.example.com"
            className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Email Support</h3>
              <p className="text-sm text-muted-foreground">
                support@registrar.example.com
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                We typically respond within 24 hours
              </p>
            </div>
            <ExternalLink className="h-5 w-5 text-muted-foreground ml-auto" />
          </a>
          <div className="flex items-center gap-4 p-6 rounded-xl border border-border bg-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Live Chat</h3>
              <p className="text-sm text-muted-foreground">
                Available Mon–Fri, 8am–5pm
              </p>
              <Button size="sm" className="mt-2" disabled>
                Coming soon
              </Button>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-muted-foreground">
                Quick answers to common questions
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-lg border border-border/50 p-4 hover:bg-muted/50 transition-colors"
              >
                <h4 className="font-medium text-foreground">{faq.question}</h4>
                <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground mb-4">Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resources.map((resource) => (
              <a
                key={resource.name}
                href={resource.href}
                className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <resource.icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{resource.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {resource.description}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground ml-auto" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
