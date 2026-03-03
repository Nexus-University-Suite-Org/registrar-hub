import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
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
  Bell,
  Activity,
  Zap,
  Target,
  Award,
  UserPlus,
} from "lucide-react";
import { StudentStats } from "@/types/student";
import { LecturerStats } from "@/types/lecturer";
import { Activity as ActivityType } from "@/types/activity";
import { auth, db } from "@/lib/firebase";
import { collection, getCountFromServer, query, orderBy, limit, getDocs } from "firebase/firestore";

const quickActions = [
  {
    name: "Manage Students",
    href: "/students",
    icon: Users,
    description: "View and manage student records",
    color: "from-primary to-orange-400",
    stats: "Active Records",
  },
  {
    name: "View Transcripts",
    href: "/transcripts",
    icon: FileText,
    description: "Access student transcripts",
    color: "from-amber-500 to-orange-500",
    stats: "Available Docs",
  },
  {
    name: "Generate Reports",
    href: "/reports",
    icon: BarChart3,
    description: "Create and view reports",
    color: "from-orange-500 to-red-400",
    stats: "This Month",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Configure system settings",
    color: "from-red-400 to-primary",
    stats: "System Config",
  },
];

const systemMetrics = [
  {
    label: "System Uptime",
    value: "99.9%",
    icon: Activity,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    label: "Response Time",
    value: "< 200ms",
    icon: Zap,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "Active Sessions",
    value: "24",
    icon: Target,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    label: "Data Accuracy",
    value: "100%",
    icon: Award,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
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
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const studentCollection = collection(db, "profiles");

      // Get all students count
      const snapshot = await getCountFromServer(studentCollection);
      const total = snapshot.data().count;

      // In the original Supabase code, all students from profiles were considered active
      setStats({
        total: total || 0,
        active: total || 0,
        inactive: 0,
        graduated: 0,
        suspended: 0,
      });
    } catch (error) {
      console.error("Error fetching stats from Firestore:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const activitiesQuery = query(
        collection(db, "activities"),
        orderBy("timestamp", "desc"),
        limit(10)
      );
      const querySnapshot = await getDocs(activitiesQuery);
      const activitiesData: ActivityType[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as ActivityType[];
      setActivities(activitiesData);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const getActivityDisplayData = (activity: ActivityType) => {
    const timeAgo = getTimeAgo(activity.timestamp);
    
    switch (activity.action) {
      case "student_added":
        return {
          title: "New student enrolled",
          description: `${activity.entityName} has been successfully enrolled`,
          details: activity.details || "",
          time: timeAgo,
          icon: UserCheck,
          color: "from-green-500 to-emerald-500",
        };
      case "student_updated":
        return {
          title: "Student record updated",
          description: `${activity.entityName}'s record has been modified`,
          details: activity.details || "Information updated",
          time: timeAgo,
          icon: TrendingUp,
          color: "from-orange-500 to-amber-500",
        };
      case "lecturer_added":
        return {
          title: "New lecturer added",
          description: `${activity.entityName} has been added to the system`,
          details: activity.details || "",
          time: timeAgo,
          icon: UserPlus,
          color: "from-blue-500 to-cyan-500",
        };
      case "lecturer_updated":
        return {
          title: "Lecturer record updated",
          description: `${activity.entityName}'s record has been modified`,
          details: activity.details || "Information updated",
          time: timeAgo,
          icon: Clock,
          color: "from-purple-500 to-indigo-500",
        };
      default:
        return {
          title: activity.action,
          description: activity.details || "",
          details: "",
          time: timeAgo,
          icon: Activity,
          color: "from-gray-500 to-gray-600",
        };
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays === 1) return "Yesterday";
    return `${diffInDays} days ago`;
  };

  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/");
        return;
      }

      // Set greeting based on time of day
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Good morning");
      else if (hour < 18) setGreeting("Good afternoon");
      else setGreeting("Good evening");

      fetchStats();
      fetchActivities();
    };

    checkAuth();
  }, [navigate]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Enhanced Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-accent/20 border border-border/50 p-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="animate-slide-up">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                  <Activity className="h-4 w-4" />
                  Welcome back
                </div>
                <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-2">
                  {greeting}, Admin 👋
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  Your registrar portal is performing excellently. Here's what's
                  happening today.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 animate-slide-up stagger-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 hover:bg-accent transition-colors w-full sm:w-auto"
                  onClick={() => navigate("/calendar")}
                >
                  <Calendar className="h-5 w-5" />
                  <span className="hidden sm:inline">View Calendar</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="relative hover:bg-accent transition-colors"
                  onClick={() => navigate("/notifications")}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center animate-pulse">
                    3
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Key Metrics
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
              Live data
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="animate-scale-in opacity-0 stagger-1">
              <StatCard
                title="Total Students"
                value={loading ? "..." : stats.total}
                icon={<Users className="h-6 w-6" />}
                variant="primary"
                trend={
                  stats.total > 0 ? { value: 12, isPositive: true } : undefined
                }
              />
            </div>
            <div className="animate-scale-in opacity-0 stagger-2">
              <StatCard
                title="Active Students"
                value={loading ? "..." : stats.active}
                icon={<UserCheck className="h-6 w-6" />}
                variant="success"
                trend={
                  stats.active > 0 ? { value: 8, isPositive: true } : undefined
                }
              />
            </div>
            <div className="animate-scale-in opacity-0 stagger-3">
              <StatCard
                title="Inactive"
                value={loading ? "..." : stats.inactive}
                icon={<UserX className="h-6 w-6" />}
                variant="default"
              />
            </div>
            <div className="animate-scale-in opacity-0 stagger-4">
              <StatCard
                title="Graduated"
                value={loading ? "..." : stats.graduated}
                icon={<GraduationCap className="h-6 w-6" />}
                variant="primary"
                trend={
                  stats.graduated > 0
                    ? { value: 5, isPositive: true }
                    : undefined
                }
              />
            </div>
            <div className="animate-scale-in opacity-0 stagger-5">
              <StatCard
                title="Suspended"
                value={loading ? "..." : stats.suspended}
                icon={<UserMinus className="h-6 w-6" />}
                variant="destructive"
              />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Quick Actions Section */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Quick Actions
                </h2>
                <p className="text-muted-foreground mt-1">
                  Access your most frequently used features
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:bg-primary/10"
              >
                View all tools →
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickActions.map((action, index) => (
                <button
                  key={action.name}
                  onClick={() => navigate(action.href)}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 text-left transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 hover:border-primary/30 animate-scale-in opacity-0"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Enhanced gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Decorative elements */}
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 rounded-full blur-2xl transition-opacity duration-500`}
                  />

                  <div className="relative flex items-start justify-between mb-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${action.color} shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}
                    >
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:text-primary" />
                  </div>

                  <div className="relative space-y-2">
                    <h3 className="font-display font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                      {action.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {action.description}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">
                        {action.stats}
                      </span>
                      <div className="h-1.5 w-12 bg-gradient-to-r from-primary/20 to-primary/40 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-gradient-to-r from-primary to-orange-400 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Recent Activity
                </h2>
                <p className="text-muted-foreground mt-1">
                  Latest system updates and actions
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:bg-primary/10"
              >
                View all →
              </Button>
            </div>

            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 animate-scale-in opacity-0"
                  style={{ animationDelay: `${index * 0.1 + 0.3}s` }}
                >
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-accent/20 to-background opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative flex items-start space-x-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${activity.color} shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
                    >
                      <activity.icon className="h-5 w-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {activity.title}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {activity.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {activity.description}
                      </p>
                      {activity.details && (
                        <div className="mt-3 flex items-center space-x-2">
                          <div className="h-1.5 w-1 bg-primary rounded-full"></div>
                          <span className="text-xs text-muted-foreground">
                            {activity.details}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Performance */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-accent/20 border border-border/50 p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-400 shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    System Performance
                  </h2>
                  <p className="text-muted-foreground">
                    Real-time portal metrics
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-xl bg-success/10 border border-success/20 hover:bg-success/15 transition-colors">
                  <p className="text-3xl font-bold text-success mb-1">99.9%</p>
                  <p className="text-sm text-success/80 font-medium">Uptime</p>
                  <div className="mt-2 h-1.5 w-full bg-success/20 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-success to-success/80 rounded-full"></div>
                  </div>
                </div>
                <div className="text-center p-4 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors">
                  <p className="text-2xl font-bold text-primary mb-1">
                    &lt;200ms
                  </p>
                  <p className="text-sm text-primary/80 font-medium">
                    Response
                  </p>
                  <div className="mt-2 h-1.5 w-full bg-primary/20 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-primary to-orange-400 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-accent/50 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    Database Health
                  </span>
                  <span className="text-sm text-success font-semibold">
                    Excellent
                  </span>
                </div>
                <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                  <div className="h-full w-5/6 bg-gradient-to-r from-success to-success/80 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Overview */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-accent/20 border border-border/50 p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-400/5 to-transparent rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Weekly Insights
                  </h2>
                  <p className="text-muted-foreground">
                    Key performance indicators
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30 border border-border/50 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <UserPlus className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        New Registrations
                      </p>
                      <p className="text-sm text-muted-foreground">This week</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">+12</p>
                    <p className="text-xs text-success">+8.2%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30 border border-border/50 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                      <FileText className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Transcripts Issued
                      </p>
                      <p className="text-sm text-muted-foreground">This week</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">28</p>
                    <p className="text-xs text-success">+15.4%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30 border border-border/50 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
                      <Clock className="h-4 w-4 text-warning" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        Pending Reviews
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Requires attention
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">3</p>
                    <p className="text-xs text-warning">-2.1%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
