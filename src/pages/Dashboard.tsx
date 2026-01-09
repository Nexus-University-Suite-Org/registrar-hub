import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserCheck, 
  UserX, 
  GraduationCap, 
  UserMinus,
  ArrowRight,
  FileText,
  BarChart3,
  Settings
} from 'lucide-react';
import { StudentStats } from '@/types/student';

const quickActions = [
  { name: 'Manage Students', href: '/students', icon: Users, description: 'View and manage student records' },
  { name: 'View Transcripts', href: '/transcripts', icon: FileText, description: 'Access student transcripts' },
  { name: 'Generate Reports', href: '/reports', icon: BarChart3, description: 'Create and view reports' },
  { name: 'Settings', href: '/settings', icon: Settings, description: 'Configure system settings' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StudentStats>({
    total: 0,
    active: 0,
    inactive: 0,
    graduated: 0,
    suspended: 0,
  });

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('registrar_authenticated');
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Load stats from localStorage
    const savedStudents = localStorage.getItem('registrar_students');
    if (savedStudents) {
      const students = JSON.parse(savedStudents);
      setStats({
        total: students.length,
        active: students.filter((s: any) => s.status === 'Active').length,
        inactive: students.filter((s: any) => s.status === 'Inactive').length,
        graduated: students.filter((s: any) => s.status === 'Graduated').length,
        suspended: students.filter((s: any) => s.status === 'Suspended').length,
      });
    }
  }, [navigate]);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back! Here's an overview of your registrar portal.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Students"
            value={stats.total}
            icon={<Users className="h-6 w-6" />}
            variant="primary"
          />
          <StatCard
            title="Active"
            value={stats.active}
            icon={<UserCheck className="h-6 w-6" />}
            variant="success"
          />
          <StatCard
            title="Inactive"
            value={stats.inactive}
            icon={<UserX className="h-6 w-6" />}
            variant="default"
          />
          <StatCard
            title="Graduated"
            value={stats.graduated}
            icon={<GraduationCap className="h-6 w-6" />}
            variant="primary"
          />
          <StatCard
            title="Suspended"
            value={stats.suspended}
            icon={<UserMinus className="h-6 w-6" />}
            variant="destructive"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.name}
                onClick={() => navigate(action.href)}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 text-left transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <action.icon className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{action.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No recent activity to display</p>
            <p className="text-sm text-muted-foreground mt-1">
              Activity will appear here as you manage student records
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
