import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  GraduationCap,
  ArrowRight,
  Users,
  FileText,
  BarChart3,
  Shield,
  Sparkles,
  Zap,
  Check,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  Palette,
  Settings,
  Upload,
  Eye,
  Search,
  Filter,
  Download,
  Edit,
  TrendingUp,
  Lock,
  UserCheck,
  Database,
  Activity,
} from "lucide-react";
import { useBranding } from "@/hooks/useBranding";

const DemoWalkthrough = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const { branding } = useBranding();

  const demoSteps = [
    {
      title: "Welcome to Your Customizable Academic Portal",
      content: (
        <div className="space-y-4">
          <p className="text-lg text-muted-foreground">
            This open-source academic management system is fully customizable
            for any institution. Let's walk through the key features and
            customization options.
          </p>
          <div className="bg-gradient-to-r from-primary/10 to-orange-500/10 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">
              What makes this portal special?
            </h4>
            <ul className="space-y-1 text-sm">
              <li>• Fully customizable branding without code changes</li>
              <li>• Real-time customization via web interface</li>
              <li>• Firebase-powered backend for scalability</li>
              <li>• Modern React/TypeScript architecture</li>
            </ul>
          </div>
        </div>
      ),
      visual: (
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <GraduationCap className="h-16 w-16 mx-auto text-primary mb-4" />
            <h3 className="text-xl font-bold">Academic Portal</h3>
            <p className="text-muted-foreground">Customizable & Open Source</p>
          </div>
        </div>
      ),
    },
    {
      title: "Branding Customization - Site Name",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Change the portal name to match your institution. This updates
            everywhere in the app.
          </p>
          <div className="bg-card p-4 rounded-lg border">
            <h4 className="font-semibold mb-2">Current Settings:</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Site Name:</span>
                <span className="font-mono text-primary">
                  {branding.siteName}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Meta Description:</span>
                <span className="font-mono text-sm">
                  {branding.metaDescription}
                </span>
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <strong>How to change:</strong> Settings → Branding → Site Name
            field
          </div>
        </div>
      ),
      visual: (
        <div className="space-y-4">
          <div className="bg-card p-4 rounded-lg border">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-primary shadow-primary">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">
                {branding.siteName}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              This appears in the sidebar, title bar, and throughout the app
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Logo Customization",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Upload your institution's logo. Supports PNG, JPG, and SVG formats.
          </p>
          <div className="bg-card p-4 rounded-lg border">
            <h4 className="font-semibold mb-2">Logo Upload Process:</h4>
            <ol className="space-y-2 text-sm list-decimal list-inside">
              <li>Go to Settings → Branding</li>
              <li>Click "Choose File" in the Logo section</li>
              <li>Select your logo image</li>
              <li>Click "Save Branding Settings"</li>
              <li>Logo appears instantly across the app</li>
            </ol>
          </div>
          <div className="text-sm text-muted-foreground">
            <strong>Storage:</strong> Logos are securely stored in Firebase
            Storage
          </div>
        </div>
      ),
      visual: (
        <div className="space-y-4">
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
                {branding.logoUrl ? (
                  <img
                    src={branding.logoUrl}
                    alt="Logo"
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <GraduationCap className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-bold">{branding.siteName}</h3>
                <p className="text-sm text-muted-foreground">
                  Logo appears here and in navigation
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Color Theme Customization",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Customize the primary color to match your institution's brand
            colors.
          </p>
          <div className="bg-card p-4 rounded-lg border">
            <h4 className="font-semibold mb-2">Current Theme:</h4>
            <div className="flex items-center gap-4">
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: branding.primaryColor }}
              ></div>
              <span className="font-mono text-sm">{branding.primaryColor}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <strong>How to change:</strong> Settings → Branding → Primary Color
            picker
          </div>
        </div>
      ),
      visual: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card p-4 rounded-lg border">
              <Button
                className="w-full"
                style={{ backgroundColor: branding.primaryColor }}
              >
                Primary Button
              </Button>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <Button variant="outline" className="w-full">
                Outline Button
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Colors update instantly across the entire application
          </p>
        </div>
      ),
    },
    {
      title: "Firebase-Powered Backend",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            All customization settings are stored in Firebase Firestore and
            Storage.
          </p>
          <div className="bg-card p-4 rounded-lg border">
            <h4 className="font-semibold mb-2">Data Structure:</h4>
            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
              {`settings/branding:
{
  "siteName": "${branding.siteName}",
  "logoUrl": "${branding.logoUrl || "null"}",
  "primaryColor": "${branding.primaryColor}",
  "metaDescription": "${branding.metaDescription}"
}`}
            </pre>
          </div>
          <div className="text-sm text-muted-foreground">
            <strong>Benefits:</strong> Real-time sync, secure storage, scalable
            architecture
          </div>
        </div>
      ),
      visual: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 p-6 rounded-lg">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-semibold">Firestore</p>
                <p className="text-xs text-muted-foreground">
                  Settings Storage
                </p>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-2">
                  <Upload className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-semibold">Storage</p>
                <p className="text-xs text-muted-foreground">Logo Files</p>
              </div>
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-2">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm font-semibold">Live App</p>
                <p className="text-xs text-muted-foreground">
                  Real-time Updates
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Open Source & Deployment Ready",
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            This portal is fully open source and ready for institutional
            deployment.
          </p>
          <div className="bg-card p-4 rounded-lg border">
            <h4 className="font-semibold mb-2">Deployment Steps:</h4>
            <ol className="space-y-2 text-sm list-decimal list-inside">
              <li>Clone the repository</li>
              <li>Set up Firebase project</li>
              <li>Configure environment variables</li>
              <li>Deploy to your hosting platform</li>
              <li>Customize branding via web interface</li>
            </ol>
          </div>
          <div className="text-sm text-muted-foreground">
            <strong>Tech Stack:</strong> React, TypeScript, Tailwind CSS,
            Firebase, Vite
          </div>
        </div>
      ),
      visual: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6 rounded-lg">
            <div className="text-center">
              <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="font-bold text-lg mb-2">Ready to Deploy</h3>
              <p className="text-sm text-muted-foreground">
                Clone, configure, customize, and deploy your own branded
                academic portal
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const nextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
        ></div>
      </div>

      {/* Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-xl font-bold">{demoSteps[currentStep].title}</h3>
          {demoSteps[currentStep].content}
        </div>
        <div className="flex items-center justify-center">
          {demoSteps[currentStep].visual}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {demoSteps.length}
        </div>

        <Button
          onClick={
            currentStep === demoSteps.length - 1
              ? () => window.open("/auth", "_blank")
              : nextStep
          }
        >
          {currentStep === demoSteps.length - 1 ? (
            <>
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

const features = [
  {
    icon: Users,
    title: "Student Management",
    description:
      "Complete CRUD operations for student records with powerful search and filtering capabilities",
    color: "from-primary to-orange-400",
  },
  {
    icon: FileText,
    title: "Transcript Access",
    description:
      "Generate and manage academic transcripts with secure, instant access",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description:
      "Comprehensive insights on enrollment trends and academic performance",
    color: "from-orange-500 to-red-400",
  },
  {
    icon: Shield,
    title: "Secure Access",
    description: "Enterprise-grade security with role-based authentication",
    color: "from-red-400 to-primary",
  },
];

const stats = [
  { value: "10,000+", label: "Students Managed" },
  { value: "99.9%", label: "Uptime" },
  { value: "50+", label: "Universities" },
  { value: "24/7", label: "Support" },
];

export default function Index() {
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<
    (typeof features)[0] | null
  >(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("registrar_authenticated");
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLearnMore = (feature: (typeof features)[0]) => {
    setSelectedFeature(feature);
    setFeatureModalOpen(true);
  };
  const renderFeatureDetails = () => {
    if (!selectedFeature) return null;

    switch (selectedFeature.title) {
      case "Student Management":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Complete CRUD Operations</h4>
                    <p className="text-sm text-muted-foreground">
                      Create, read, update, and delete student records with full audit trails
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Search className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Advanced Search & Filtering</h4>
                    <p className="text-sm text-muted-foreground">
                      Search by name, student number, email, or filter by program, year, status
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Edit className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Bulk Operations</h4>
                    <p className="text-sm text-muted-foreground">
                      Import/export student data, bulk status updates, and batch processing
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Database className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Data Integrity</h4>
                    <p className="text-sm text-muted-foreground">
                      Validation rules, duplicate prevention, and data consistency checks
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Activity Logging</h4>
                    <p className="text-sm text-muted-foreground">
                      Complete audit trail of all student record changes and access
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Download className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Export Capabilities</h4>
                    <p className="text-sm text-muted-foreground">
                      CSV export with customizable fields and filtered data export
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Key Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Student profile management with avatar upload</li>
                <li>• Academic program and year tracking</li>
                <li>• Status management (Active, Inactive, Graduated, Suspended)</li>
                <li>• Faculty assignment with manual input capability</li>
                <li>• Real-time search across all student fields</li>
                <li>• Responsive design for mobile and desktop</li>
              </ul>
            </div>
          </div>
        );

      case "Transcript Access":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                    <FileText className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Instant Generation</h4>
                    <p className="text-sm text-muted-foreground">
                      Generate transcripts on-demand with real-time GPA calculations
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                    <TrendingUp className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Academic Performance</h4>
                    <p className="text-sm text-muted-foreground">
                      Detailed GPA breakdown by semester with performance classification
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                    <Download className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Multiple Formats</h4>
                    <p className="text-sm text-muted-foreground">
                      Print-ready transcripts with professional formatting and branding
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                    <Filter className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Flexible Filtering</h4>
                    <p className="text-sm text-muted-foreground">
                      Filter by academic year, semester, or generate complete academic history
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                    <Shield className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Secure Access</h4>
                    <p className="text-sm text-muted-foreground">
                      Role-based access control ensures only authorized personnel can generate transcripts
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                    <Database className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Data Integration</h4>
                    <p className="text-sm text-muted-foreground">
                      Pulls data from student_grades, courses, and course_units collections
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Transcript Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Semester-wise GPA calculation with credit weighting</li>
                <li>• Course code, title, credits, marks, and grades display</li>
                <li>• Academic year and semester organization</li>
                <li>• Performance classification (First Class, Second Class, etc.)</li>
                <li>• Print-optimized layout with institution branding</li>
                <li>• Historical transcript generation for any academic period</li>
              </ul>
            </div>
          </div>
        );

      case "Analytics & Reports":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                    <BarChart3 className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Enrollment Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      Track enrollment trends by department, program, year, and status
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Performance Insights</h4>
                    <p className="text-sm text-muted-foreground">
                      GPA distribution, grade analysis, and academic performance trends
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                    <Users className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Student Risk Analysis</h4>
                    <p className="text-sm text-muted-foreground">
                      Identify at-risk students and top performers for targeted support
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                    <FileText className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Department Reports</h4>
                    <p className="text-sm text-muted-foreground">
                      Performance breakdowns by faculty, department, and program
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                    <Download className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Export Capabilities</h4>
                    <p className="text-sm text-muted-foreground">
                      Generate detailed reports in various formats for stakeholders
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                    <Activity className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Real-time Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Live data aggregation from student records and grade submissions
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Analytics Capabilities:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Student enrollment statistics by multiple dimensions</li>
                <li>• GPA distribution analysis and performance classification</li>
                <li>• Department and program performance comparisons</li>
                <li>• Top performers and at-risk student identification</li>
                <li>• Academic year-over-year trend analysis</li>
                <li>• Interactive dashboards with filtering capabilities</li>
              </ul>
            </div>
          </div>
        );

      case "Secure Access":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                    <Lock className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Firebase Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Enterprise-grade authentication with email verification and password policies
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                    <UserCheck className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Role-Based Access</h4>
                    <p className="text-sm text-muted-foreground">
                      Granular permissions for registrars, lecturers, and administrators
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                    <Shield className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Data Protection</h4>
                    <p className="text-sm text-muted-foreground">
                      Secure data transmission and storage with Firebase security rules
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                    <Activity className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Audit Logging</h4>
                    <p className="text-sm text-muted-foreground">
                      Complete activity tracking for compliance and security monitoring
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                    <Database className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Session Management</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatic session handling with secure logout and timeout policies
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                    <Eye className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Privacy Controls</h4>
                    <p className="text-sm text-muted-foreground">
                      Student data privacy with controlled access and data minimization
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Security Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Multi-factor authentication support</li>
                <li>• Encrypted data transmission (HTTPS)</li>
                <li>• Firebase security rules for data access control</li>
                <li>• Session timeout and automatic logout</li>
                <li>• Password reset and account recovery</li>
                <li>• Activity logging for all user actions</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 gradient-primary rounded-xl blur-lg opacity-40" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl gradient-primary shadow-primary">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <span className="font-display font-bold text-xl text-foreground tracking-tight">
              Registrar Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="hidden sm:flex"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              className="shadow-primary"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 min-h-screen flex items-center">
        {/* Background decoration */}
        <div className="absolute inset-0 gradient-mesh opacity-60" />
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-primary/5 to-transparent blur-3xl" />

        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 text-primary text-sm font-semibold mb-8 animate-slide-down shadow-sm">
              <Sparkles className="h-4 w-4" />
              University Registrar Management System
              <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
            </div>

            {/* Main heading */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.1] tracking-tight animate-slide-up">
              Streamline Your{" "}
              <span className="relative">
                <span className="text-gradient">Student Records</span>
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 300 12"
                  fill="none"
                >
                  <path
                    d="M2 10C50 4 100 2 150 6C200 10 250 8 298 4"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="300" y2="0">
                      <stop stopColor="hsl(24, 100%, 50%)" />
                      <stop offset="1" stopColor="hsl(35, 100%, 55%)" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>{" "}
              Management
            </h1>

            <p className="mt-8 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-slide-up stagger-1 opacity-0">
              A comprehensive portal for registrars to manage student records,
              enrollment, transcripts, and academic data with unmatched ease and
              efficiency.
            </p>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up stagger-2 opacity-0">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="h-14 px-8 text-base shadow-primary hover:shadow-glow transition-all duration-300"
              >
                <Zap className="mr-2 h-5 w-5" />
                Get Started Free
              </Button>
              <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-base glass border-border/50 hover:border-primary/30 hover:bg-accent/50"
                  >
                    Watch Demo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                      <Play className="h-6 w-6 text-primary" />
                      Interactive Demo: Customizable Academic Portal
                    </DialogTitle>
                  </DialogHeader>

                  <DemoWalkthrough />
                </DialogContent>
              </Dialog>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground animate-slide-up stagger-3 opacity-0">
              {[
                "No credit card required",
                "Free 14-day trial",
                "Cancel anytime",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`text-center p-6 rounded-2xl glass border border-border/50 hover-lift animate-scale-in stagger-${i + 1} opacity-0`}
              >
                <div className="text-3xl sm:text-4xl font-display font-bold text-gradient">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 pattern-dots opacity-30" />

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">
              Features
            </span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              Everything You Need
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for university registrars
              to streamline their workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card p-8 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 hover:border-primary/20"
              >
                {/* Gradient background on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                {/* Icon */}
                <div
                  className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-base">
                  {feature.description}
                </p>

                {/* Arrow indicator */}
                <div
                  className="mt-6 flex items-center text-primary font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0 cursor-pointer hover:text-primary/80"
                  onClick={() => handleLearnMore(feature)}
                >
                  <span>Learn more</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-[2.5rem] gradient-primary p-16 md:p-24">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-white/10 blur-3xl translate-y-1/2 -translate-x-1/4" />
            <div className="absolute inset-0 pattern-grid opacity-10" />

            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Ready to Transform Your Workflow?
              </h2>
              <p className="mt-6 text-white/80 text-xl max-w-xl mx-auto leading-relaxed">
                Join thousands of registrars who trust our platform to manage
                their student records efficiently
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="h-14 px-8 text-base bg-white text-primary hover:bg-white/90 shadow-xl"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base border-white/30 text-white hover:bg-white/10 bg-transparent"
                >
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-sm">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">
              Registrar Portal
            </span>
          </div>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Support
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Registrar Portal. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Feature Details Modal */}
      <Dialog open={featureModalOpen} onOpenChange={setFeatureModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedFeature && (
                <>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${selectedFeature.color} shadow-lg`}
                  >
                    <selectedFeature.icon className="h-5 w-5 text-white" />
                  </div>
                  {selectedFeature.title}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedFeature?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6">
            {renderFeatureDetails()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
