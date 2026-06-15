import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { post } from "@/lib/api";
import { useBranding } from "@/hooks/useBranding";

type AuthStep = "email" | "verification" | "password" | "profile" | "login" | "forgot-password";

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

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [college, setCollege] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) navigate("/dashboard");
    else setIsCheckingAuth(false);
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
      await post("/registrars/", {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        employee_id: employeeId,
        department,
        college,
      });

      localStorage.setItem("registrar_college", college);

      toast.success("Account created.");
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
      const data: any = await post("/auth/login/", { email, password });
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }
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

    try {
      await post("/auth/password-reset/", { email });
      toast.success("Reset email sent");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden bg-background">
      {/* Background mesh */}
      <div className="absolute inset-0 gradient-mesh opacity-60" />
      <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-float" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-primary/5 to-transparent blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 gradient-primary rounded-2xl blur-lg opacity-40" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-primary">
                <GraduationCap className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
                {branding?.name || "Registrar Hub"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isLogin
                  ? "Sign in to your account"
                  : "Create your registrar account"}
              </p>
            </div>
          </div>
        </div>

        {/* Main card */}
        <Card className="glass border-border/50 shadow-xl backdrop-blur-xl">
          <CardHeader className="pb-4">
            {/* Mode Toggle */}
            <div className="flex items-center justify-center gap-1 p-1 bg-muted/80 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setStep("email");
                  setError("");
                }}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isLogin
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setStep("email");
                  setError("");
                }}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  !isLogin
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Register
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl animate-slide-down">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* EMAIL STEP */}
            {step === "email" && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="pl-10 h-12 rounded-xl bg-background/50 border-border/50 focus-visible:ring-primary/30"
                      required
                    />
                  </div>
                </div>

                <Button
                  onClick={handleEmailSubmit}
                  className="w-full h-12 rounded-xl shadow-primary hover:shadow-glow transition-all duration-300"
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            )}

            {/* PROFILE STEP - Only for Sign Up */}
            {step === "profile" && !isLogin && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2">
                  <ArrowLeft
                    className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => setStep("email")}
                  />
                  <h2 className="font-display text-lg font-semibold">
                    Create Profile
                  </h2>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">
                        First Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          className="pl-10 h-12 rounded-xl bg-background/50 border-border/50"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        className="h-12 rounded-xl bg-background/50 border-border/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employeeId" className="text-sm font-medium">
                      Employee ID
                    </Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="employeeId"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        placeholder="REG-001"
                        className="pl-10 h-12 rounded-xl bg-background/50 border-border/50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium">
                      Department
                    </Label>
                    <Input
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Academic Affairs"
                      className="h-12 rounded-xl bg-background/50 border-border/50"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="college" className="text-sm font-medium">
                      College / Institution
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="college"
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        placeholder="Nexus University"
                        className="pl-10 h-12 rounded-xl bg-background/50 border-border/50"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 rounded-xl shadow-primary hover:shadow-glow transition-all duration-300">
                    Continue to Password Setup
                  </Button>
                </form>
              </div>
            )}

            {/* PASSWORD STEP - Only for Sign Up */}
            {step === "password" && !isLogin && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2">
                  <ArrowLeft
                    className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => setStep("profile")}
                  />
                  <h2 className="font-display text-lg font-semibold">
                    Set Password
                  </h2>
                </div>

                <form onSubmit={handlePasswordSetup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a strong password"
                        className="pl-10 pr-10 h-12 rounded-xl bg-background/50 border-border/50"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1.5">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                      Must be at least 8 characters long
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="pl-10 h-12 rounded-xl bg-background/50 border-border/50"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 rounded-xl shadow-primary hover:shadow-glow transition-all duration-300" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating Account...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Create Account
                        <Sparkles className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </div>
            )}

            {/* LOGIN STEP */}
            {step === "login" && isLogin && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2">
                  <ArrowLeft
                    className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => setStep("email")}
                  />
                  <h2 className="font-display text-lg font-semibold">
                    Welcome Back
                  </h2>
                </div>

                <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-xl">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-sm text-muted-foreground leading-snug">
                    Signing in as <strong className="text-foreground">{email}</strong>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loginPassword" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="loginPassword"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="pl-10 pr-10 h-12 rounded-xl bg-background/50 border-border/50"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 rounded-xl shadow-primary hover:shadow-glow transition-all duration-300" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Signing In...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Sign In
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setStep("forgot-password")}
                    className="w-full text-sm text-muted-foreground"
                  >
                    Forgot your password?
                  </Button>
                </form>
              </div>
            )}

            {/* FORGOT PASSWORD STEP */}
            {step === "forgot-password" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2">
                  <ArrowLeft
                    className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => setStep("login")}
                  />
                  <h2 className="font-display text-lg font-semibold">
                    Reset Password
                  </h2>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resetEmail" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="resetEmail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="pl-10 h-12 rounded-xl bg-background/50 border-border/50"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleForgotPassword}
                  className="w-full h-12 rounded-xl shadow-primary hover:shadow-glow transition-all duration-300"
                  disabled={!email.trim()}
                >
                  Send Reset Link
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  We'll send you a link to reset your password.
                </p>
              </div>
            )}

            {/* VERIFICATION STEP */}
            {step === "verification" && (
              <div className="space-y-6 text-center py-4 animate-fade-in">
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-success/20 rounded-full blur-xl" />
                    <CheckCircle2 className="h-16 w-16 text-success relative" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Check Your Email
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We've sent a verification link to <strong className="text-foreground">{email}</strong>.
                    Please check your inbox and click the link to activate your account.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => { setStep("email"); setIsLogin(true); }}
                  className="w-full h-12 rounded-xl"
                >
                  Back to Sign In
                </Button>
              </div>
            )}

            {/* Footer link */}
            <p className="text-xs text-center text-muted-foreground pt-2">
              By continuing, you agree to our{" "}
              <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">
                Privacy Policy
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
