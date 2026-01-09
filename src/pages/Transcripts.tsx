import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FileText, Search, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Transcripts() {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('registrar_authenticated');
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Transcripts</h1>
            <p className="mt-1 text-muted-foreground">
              Access and manage student academic transcripts
            </p>
          </div>
          <Button>
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
              Search for a student to view or generate their academic transcript. 
              Transcripts include all courses, grades, and GPA calculations.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => navigate('/students')}>
                View Students
              </Button>
              <Button>
                Generate New Transcript
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
