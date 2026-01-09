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
  Settings,
  Clock,
  TrendingUp,
  Calendar,
  Bell
} from 'lucide-react';
import { StudentStats } from '@/types/student';

const quickActions = [
  { name: 'Manage Students', href: '/students', icon: Users, description: 'View and manage student records', color: 'from-primary to-orange-400' },
  { name: 'View Transcripts', href: '/transcripts', icon: FileText, description: 'Access student transcripts', color: 'from-amber-500 to-orange-500' },
  { name: 'Generate Reports', href: '/reports', icon: BarChart3, description: 'Create and view reports', color: 'from-orange-500 to-red-400' },
  { name: 'Settings', href: '/settings', icon: Settings, description: 'Configure system settings', color: 'from-red-400 to-primary' },
];

const recentActivities = [
  { action: 'New student enrolled', student: 'Sarah Johnson', time: '2 hours ago', icon: UserCheck },
  { action: 'Transcript requested', student: 'Michael Brown', time: '4 hours ago', icon: FileText },
  { action: 'Status updated', student: 'Emily Davis', time: '5 hours ago', icon: TrendingUp },
  { action: 'Record modified', student: 'James Wilson', time: 'Yesterday', icon: Clock },
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
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('registrar_authenticated');
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

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
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="animate-slide-up">
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">
              {greeting}, Admin 👋
            </h1>
            <p className="mt-2 text-muted-foreground text-lg">
              Here's what's happening with your portal today.
            </p>
          </div>
          <div className="flex items-center gap-3 animate-slide-up stagger-1 opacity-0">
            <Button variant="outline" size="lg" className="gap-2">
              <Calendar className="h-5 w-5" />
              <span className="hidden sm:inline">Today</span>
            </Button>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">3</span>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="animate-scale-in opacity-0 stagger-1">
            <StatCard
              title="Total Students"
              value={stats.total}
              icon={<Users className="h-6 w-6" />}
              variant="primary"
              trend={{ value: 12, isPositive: true }}
            />
          </div>
          <div className="animate-scale-in opacity-0 stagger-2">
            <StatCard
              title="Active"
              value={stats.active}
              icon={<UserCheck className="h-6 w-6" />}
              variant="success"
              trend={{ value: 8, isPositive: true }}
            />
          </div>
          <div className="animate-scale-in opacity-0 stagger-3">
            <StatCard
              title="Inactive"
              value={stats.inactive}
              icon={<UserX className="h-6 w-6" />}
              variant="default"
            />
          </div>
          <div className="animate-scale-in opacity-0 stagger-4">
            <StatCard
              title="Graduated"
              value={stats.graduated}
              icon={<GraduationCap className="h-6 w-6" />}
              variant="primary"
              trend={{ value: 5, isPositive: true }}
            />
          </div>
          <div className="animate-scale-in opacity-0 stagger-5">
            <StatCard
              title="Suspended"
              value={stats.suspended}
              icon={<UserMinus className="h-6 w-6" />}
              variant="destructive"
            />
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-foreground">Quick Actions</h2>
              <span className="text-sm text-muted-foreground">Access frequently used features</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={action.name}
                  onClick={() => navigate(action.href)}
                  className={`group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 animate-scale-in opacity-0 stagger-${index + 1}`}
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <div className="relative flex items-start justify-between">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} shadow-lg transition-all duration-300 group-hover:scale-110`}>
                      <action.icon className="h-7 w-7 text-white" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                  <h3 className="mt-5 font-display font-semibold text-lg text-foreground">{action.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-foreground">Recent Activity</h2>
              <Button variant="ghost" size="sm" className="text-primary">
                View all
              </Button>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
              <div className="divide-y divide-border/50">
                {recentActivities.map((activity, index) => (
                  <div 
                    key={index} 
                    className={`flex items-start gap-4 p-4 transition-colors hover:bg-accent/50 animate-slide-up opacity-0`}
                    style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary flex-shrink-0">
                      <activity.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{activity.action}</p>
                      <p className="text-sm text-muted-foreground truncate">{activity.student}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Card */}
        <div className="rounded-2xl border border-border/50 bg-card p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Portal Performance</h2>
              <p className="mt-2 text-muted-foreground max-w-xl">
                Your portal is running smoothly. All systems are operational and student data is up to date.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center px-6 py-3 rounded-xl bg-success/10 border border-success/20">
                <p className="text-2xl font-bold text-success">99.9%</p>
                <p className="text-xs text-success/80 font-medium">Uptime</p>
              </div>
              <div className="text-center px-6 py-3 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-2xl font-bold text-primary">Fast</p>
                <p className="text-xs text-primary/80 font-medium">Response</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}