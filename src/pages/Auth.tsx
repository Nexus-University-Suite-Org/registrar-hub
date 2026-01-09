import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft, Eye, EyeOff, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

type AuthStep = 'email' | 'verification' | 'password' | 'login';

const features = [
  'Student Records Management',
  'Enrollment & Status Tracking',
  'Academic Oversight & Reports',
  'Secure Role-Based Access',
];

export default function Auth() {
  const navigate = useNavigate();
  const [step, setStep] = useState<AuthStep>('email');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email: string) => {
    const registrarPattern = /^[a-zA-Z]+\.[a-zA-Z]+@registrar\.com$/;
    return registrarPattern.test(email);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(email)) {
      setError('Please use your institutional email (firstname.lastname@registrar.com)');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);

    if (isLogin) {
      setStep('login');
    } else {
      toast.success('Verification code sent to your email');
      setStep('verification');
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);

    setStep('password');
  };

  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);

    toast.success('Account created successfully!');
    localStorage.setItem('registrar_authenticated', 'true');
    navigate('/dashboard');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);

    toast.success('Welcome back!');
    localStorage.setItem('registrar_authenticated', 'true');
    navigate('/dashboard');
  };

  return (
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
                A powerful platform designed specifically for university registrars to streamline academic administration.
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
          {step !== 'email' && (
            <button
              onClick={() => setStep('email')}
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
                {isLogin ? 'Welcome back' : 'Get started'}
              </div>
              <h2 className="font-display text-3xl font-bold text-foreground">
                {step === 'email' && (isLogin ? 'Sign in to your account' : 'Create your account')}
                {step === 'verification' && 'Verify your email'}
                {step === 'password' && 'Set your password'}
                {step === 'login' && 'Enter your password'}
              </h2>
              <p className="mt-3 text-muted-foreground">
                {step === 'email' && (isLogin ? 'Enter your institutional email to continue' : 'Sign up using your institutional email')}
                {step === 'verification' && `We sent a code to ${email}`}
                {step === 'password' && 'Create a secure password for your account'}
                {step === 'login' && 'Enter your password to access the portal'}
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
            {step === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium">Institutional Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="firstname.lastname@registrar.com"
                      className="pl-12 h-14 text-base rounded-xl border-border/50 focus:border-primary bg-card"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-14 text-base rounded-xl shadow-primary" disabled={isLoading}>
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
            {step === 'verification' && (
              <form onSubmit={handleVerification} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="otp" className="text-sm font-medium">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="h-14 text-center text-2xl tracking-[0.5em] font-mono rounded-xl border-border/50 focus:border-primary bg-card"
                    maxLength={6}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the code? <button type="button" className="text-primary hover:underline font-medium">Resend</button>
                  </p>
                </div>
                <Button type="submit" className="w-full h-14 text-base rounded-xl shadow-primary" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>
              </form>
            )}

            {/* Password Setup Step */}
            {step === 'password' && (
              <form onSubmit={handlePasswordSetup} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-medium">Create Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
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
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="pl-12 h-14 text-base rounded-xl border-border/50 focus:border-primary bg-card"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-14 text-base rounded-xl shadow-primary" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            )}

            {/* Login Step */}
            {step === 'login' && (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="loginPassword" className="text-sm font-medium">Password</Label>
                    <button type="button" className="text-sm text-primary hover:underline font-medium">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="loginPassword"
                      type={showPassword ? 'text' : 'password'}
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
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-14 text-base rounded-xl shadow-primary" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            )}

            {/* Toggle Login/Signup */}
            {step === 'email' && (
              <p className="text-center text-muted-foreground">
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-semibold text-primary hover:underline"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}