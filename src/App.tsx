import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useBranding } from "@/hooks/useBranding";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Lecturers from "./pages/Lecturers";
import Results from "./pages/Results";
import Transcripts from "./pages/Transcripts";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Courses from "./pages/Courses";
import Fees from "./pages/Fees";
import Notifications from "./pages/Notifications";
import Calendar from "./pages/Calendar";
import Timetable from "./pages/Timetable";
import Tools from "./pages/Tools";
import HelpSupport from "./pages/HelpSupport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { branding } = useBranding();

  // Update document title when branding changes
  React.useEffect(() => {
    if (branding?.siteName) {
      document.title = branding.siteName;
    }
  }, [branding]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/lecturers" element={<Lecturers />} />
        <Route path="/results" element={<Results />} />
        <Route path="/transcripts" element={<Transcripts />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/fees" element={<Fees />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/help-support" element={<HelpSupport />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;