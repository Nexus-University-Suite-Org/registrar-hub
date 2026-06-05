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
import { useBranding } from "@/hooks/useBranding";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  doc,
  setDoc,
} from "@/lib/firebase";

type AuthStep = "email" | "verification" | "password" | "profile" | "login";

export default function Auth() {
  const navigate = useNavigate();
  const { branding } = useBranding();

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

  // profile
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [college, setCollege] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/dashboard");
      else setIsCheckingAuth(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateEmail(email)) return setError("Invalid email");

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(isLogin ? "login" : "profile");
    }, 800);
  };

  const handleProfileSubmit = (e: any) => {
    e.preventDefault();
    if (!firstName || !lastName || !employeeId || !college || !department)
      return setError("Fill all fields");

    setStep("password");
  };

  const handlePasswordSetup = async (e: any) => {
    e.preventDefault();

    if (password.length < 8) return setError("Password too short");
    if (password !== confirmPassword) return setError("Passwords do not match");

    setIsLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      await sendEmailVerification(userCred.user);

      await setDoc(doc(db, "registrars", userCred.user.uid), {
        email,
        firstName,
        lastName,
        employeeId,
        department,
        college,
      });

      toast.success("Account created. Verify your email.");
      setStep("verification");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!validateEmail(email)) return setError("Enter valid email first");

    await sendPasswordResetEmail(auth, email);
    toast.success("Reset email sent");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Header with mode toggle */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              {branding?.name || "Registrar Hub"}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {isLogin
              ? "Welcome back! Please sign in."
              : "Create your registrar account."}
          </p>

          {/* Mode Toggle */}
          <div className="flex items-center justify-center gap-1 p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setStep("email");
                setError("");
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isLogin
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setStep("email");
                setError("");
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isLogin
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* EMAIL STEP */}
        {step === "email" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button
              onClick={handleEmailSubmit}
              className="w-full"
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </div>
        )}

        {/* PROFILE STEP - Only for Sign Up */}
        {step === "profile" && !isLogin && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <ArrowLeft
                className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => setStep("email")}
              />
              <h2 className="text-lg font-semibold">Create Profile</h2>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="employeeId"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="REG-001"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Academic Affairs"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="college">College/Institution</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="college"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="Nexus University"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Continue to Password Setup
              </Button>
            </form>
          </div>
        )}

        {/* PASSWORD STEP - Only for Sign Up */}
        {step === "password" && !isLogin && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <ArrowLeft
                className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => setStep("profile")}
              />
              <h2 className="text-lg font-semibold">Set Password</h2>
            </div>

            <form onSubmit={handlePasswordSetup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Create Account
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </div>
        )}

        {/* LOGIN STEP */}
        {step === "login" && isLogin && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <ArrowLeft
                className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground"
                onClick={() => setStep("email")}
              />
              <h2 className="text-lg font-semibold">Welcome Back</h2>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-800">
                  Signing in as: <strong>{email}</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loginPassword">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="loginPassword"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="w-full text-sm text-muted-foreground hover:text-foreground underline"
              >
                Forgot your password?
              </button>
            </form>
          </div>
        )}

        {/* VERIFICATION STEP */}
        {step === "verification" && (
          <div className="space-y-4 text-center">
            <div className="flex items-center justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Check Your Email
            </h2>
            <p className="text-muted-foreground">
              We've sent a verification link to <strong>{email}</strong>. Please
              check your inbox and click the link to activate your account.
            </p>
            <Button
              variant="outline"
              onClick={() => setStep("email")}
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
