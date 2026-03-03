import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  Building,
  User,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

type AuthStep = "email" | "verification" | "password" | "profile" | "login";

const features = [
  "Student Records Management",
  "Enrollment & Status Tracking",
  "Academic Oversight & Reports",
  "Secure Role-Based Access",
];

export default function Auth() {
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>("email");
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Registrar profile fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [college, setCollege] = useState("");

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in, redirect to dashboard
        navigate("/dashboard");
      } else {
        // No user logged in, show auth page
        setIsCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const colleges = [
    "College of Computing and Information Sciences (COCIS)",
    "College of Business and Management Sciences (COBAMS)",
    "College of Humanities and Social Sciences (CHUSS)",
    "College of Natural Sciences (CONAS)",
    "College of Engineering, Design, Art and Technology (CEDAT)",
    "College of Health Sciences (CHS)",
    "College of Agricultural and Environmental Sciences (CAES)",
    "College of Veterinary Medicine, Animal Resources and Bio-security (COVAB)",
    "College of Education and External Studies (CEES)",
    "School of Law (SOL)",
  ];

  const validateEmail = (email: string) => {
    // For development/demo purposes, allow any valid email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);

    if (isLogin) {
      setStep("login");
    } else {
      setStep("profile");
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !employeeId.trim() ||
      !college.trim() ||
      !department.trim()
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);

    setStep("password");
  };

  const handleResendOtp = () => {
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    toast("New Verification Code", {
      description: `Your new verification code is: ${mockOtp}. This code will expire soon.`,
      duration: 10000,
    });
    toast.success("Verification code resent!");
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);

    setStep("password");
  };

  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      if (user) {
        // Send verification email
        await sendEmailVerification(user);

        // Generate a mock 6-digit OTP for the user to use
        const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();

        toast("Verification Code", {
          description: `Your verification code is: ${mockOtp}. This code will expire soon.`,
          duration: 10000,
        });

        // Save registrar profile to database (Firestore)
        await setDoc(doc(db, "registrars", user.uid), {
          auth_id: user.uid,
          first_name: firstName,
          last_name: lastName,
          email: email,
          employee_id: employeeId,
          college: college,
          department: department,
          role: "registrar",
          hire_date: new Date().toISOString().split("T")[0], // Today's date
        });
      }

      toast.success(
        "Account created successfully! Please check your email for verification.",
      );
      setStep("verification");
    } catch (err: any) {
      console.error("Error creating account:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      if (!userCredential.user.emailVerified) {
        toast.info("Please verify your email address.");
        // Optional: you could resend verification if needed
      }

      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isCheckingAuth && (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )}

      {!isCheckingAuth && (
        <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 gradient-primary" />
        <div className="absolute inset-0 pattern-grid opacity-10" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-white/10 blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl translate-y-1/3 -translate-x-1/3" />

        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-display text-3xl font-bold text-white">
              Registrar Portal
            </h1>
          </div>

          {/* Main content */}
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-4xl xl:text-5xl font-bold text-white leading-tight">
                Manage your student records with confidence
              </h2>
              <p className="mt-6 text-xl text-white/80 leading-relaxed max-w-lg">
                A powerful platform designed specifically for university
                registrars to streamline academic administration.
              </p>
            </div>

            {/* Features list */}
            <div className="space-y-4">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 text-white/90 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-4 transition-all duration-300 hover:bg-white/15"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-white/60 text-sm">
            Trusted by 50+ universities worldwide
          </p>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 gradient-mesh opacity-30" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-primary">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Registrar Portal
            </h1>
          </div>

          {/* Back button */}
          {step !== "email" && (
            <button
              onClick={() => {
                if (step === "profile") setStep("email");
                else if (step === "password") setStep("profile");
                else if (step === "verification") setStep("password");
                else if (step === "login") setStep("email");
              }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
          )}

          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-primary text-xs font-semibold mb-4">
                <Sparkles className="h-3 w-3" />
                {isLogin ? "Welcome back" : "Get started"}
              </div>
              <h2 className="font-display text-3xl font-bold text-foreground">
                {step === "email" &&
                  (isLogin ? "Sign in to your account" : "Create your account")}
                {step === "profile" && "Complete your profile"}
                {step === "verification" && "Verify your email"}
                {step === "password" && "Set your password"}
                {step === "login" && "Enter your password"}
              </h2>
              <p className="mt-3 text-muted-foreground">
                {step === "email" &&
                  (isLogin
                    ? "Enter your email to continue"
                    : "Sign up using your email")}
                {step === "profile" && "Tell us a bit about yourself"}
                {step === "verification" && `We sent a code to ${email}`}
                {step === "password" &&
                  "Create a secure password for your account"}
                {step === "login" && "Enter your password to access the portal"}
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive animate-slide-down">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Email Step */}
            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="pl-12 h-14 text-base rounded-xl border-border/50 focus:border-primary bg-card"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-14 text-base rounded-xl shadow-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Please wait...
                    </div>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Profile Step */}
            {step === "profile" && (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        className="pl-12 h-12 rounded-xl border-border/50 focus:border-primary bg-card"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="h-12 rounded-xl border-border/50 focus:border-primary bg-card"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="college" className="text-sm font-medium">
                    College / Faculty
                  </Label>
                  <Select value={college} onValueChange={setCollege} required>
                    <SelectTrigger className="h-12 rounded-xl border-border/50 focus:ring-primary bg-card text-left">
                      <div className="flex items-center gap-3">
                        <Building className="h-5 w-5 text-muted-foreground" />
                        <SelectValue placeholder="Select your college" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="employeeId" className="text-sm font-medium">
                    Employee ID
                  </Label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="employeeId"
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="REG-001"
                      className="pl-12 h-12 rounded-xl border-border/50 focus:border-primary bg-card"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="department" className="text-sm font-medium">
                    Department
                  </Label>
                  <select
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-border/50 focus:border-primary bg-card text-base"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Academic Affairs">Academic Affairs</option>
                    <option value="Student Services">Student Services</option>
                    <option value="Records Management">
                      Records Management
                    </option>
                    <option value="Administration">Administration</option>
                    <option value="IT Services">IT Services</option>
                  </select>
                </div>
                <Button
                  type="submit"
                  className="w-full h-14 text-base rounded-xl shadow-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Please wait...
                    </div>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Verification Step */}
            {step === "verification" && (
              <form onSubmit={handleVerification} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="otp" className="text-sm font-medium">
                    Verification Code
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    className="h-14 text-center text-2xl tracking-[0.5em] font-mono rounded-xl border-border/50 focus:border-primary bg-card"
                    maxLength={6}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-primary hover:underline font-medium"
                    >
                      Resend
                    </button>
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full h-14 text-base rounded-xl shadow-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>
              </form>
            )}

            {/* Password Setup Step */}
            {step === "password" && (
              <form onSubmit={handlePasswordSetup} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Create Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="pl-12 pr-12 h-14 text-base rounded-xl border-border/50 focus:border-primary bg-card"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="pl-12 h-14 text-base rounded-xl border-border/50 focus:border-primary bg-card"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-14 text-base rounded-xl shadow-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            )}

            {/* Login Step */}
            {step === "login" && (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="loginPassword"
                      className="text-sm font-medium"
                    >
                      Password
                    </Label>
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="loginPassword"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-12 pr-12 h-14 text-base rounded-xl border-border/50 focus:border-primary bg-card"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-14 text-base rounded-xl shadow-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            )}

            {/* Toggle Login/Signup */}
            {step === "email" && (
              <p className="text-center text-muted-foreground">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-semibold text-primary hover:underline"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
        </div>
      )}
    </>
  );
}
