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
} from "firebase/auth";

import { doc, setDoc } from "firebase/firestore";

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
    if (password !== confirmPassword)
      return setError("Passwords do not match");

    setIsLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
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
    if (!validateEmail(email))
      return setError("Enter valid email first");

    await sendPasswordResetEmail(auth, email);
    toast.success("Reset email sent");
  };

  if (isCheckingAuth) return <p>Loading...</p>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">

        {error && <p className="text-red-500">{error}</p>}

        {/* EMAIL */}
        {step === "email" && (
          <form onSubmit={handleEmailSubmit}>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
            />
            <Button className="w-full mt-4">Continue</Button>
          </form>
        )}

        {/* PROFILE */}
        {step === "profile" && (
          <form onSubmit={handleProfileSubmit} className="space-y-3">
            <Input placeholder="First Name" onChange={e => setFirstName(e.target.value)} />
            <Input placeholder="Last Name" onChange={e => setLastName(e.target.value)} />
            <Input placeholder="Employee ID" onChange={e => setEmployeeId(e.target.value)} />
            <Input placeholder="Department" onChange={e => setDepartment(e.target.value)} />
            <Input placeholder="College" onChange={e => setCollege(e.target.value)} />
            <Button>Create Profile</Button>
          </form>
        )}

        {/* PASSWORD */}
        {step === "password" && (
          <form onSubmit={handlePasswordSetup} className="space-y-3">
            <Input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
            <Input type="password" placeholder="Confirm Password" onChange={e => setConfirmPassword(e.target.value)} />
            <Button>Create Account</Button>
          </form>
        )}

        {/* LOGIN */}
        {step === "login" && (
          <form onSubmit={handleLogin} className="space-y-3">
            <Input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
            <Button>Login</Button>
            <button type="button" onClick={handleForgotPassword}>
              Forgot Password?
            </button>
          </form>
        )}

      </div>
    </div>
  );
}