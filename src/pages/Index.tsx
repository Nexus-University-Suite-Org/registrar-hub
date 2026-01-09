import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight, Users, FileText, BarChart3, Shield, Sparkles, Zap, Check } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Student Management',
    description: 'Complete CRUD operations for student records with powerful search and filtering capabilities',
    color: 'from-primary to-orange-400',
  },
  {
    icon: FileText,
    title: 'Transcript Access',
    description: 'Generate and manage academic transcripts with secure, instant access',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Comprehensive insights on enrollment trends and academic performance',
    color: 'from-orange-500 to-red-400',
  },
  {
    icon: Shield,
    title: 'Secure Access',
    description: 'Enterprise-grade security with role-based authentication',
    color: 'from-red-400 to-primary',
  },
];

const stats = [
  { value: '10,000+', label: 'Students Managed' },
  { value: '99.9%', label: 'Uptime' },
  { value: '50+', label: 'Universities' },
  { value: '24/7', label: 'Support' },
];

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('registrar_authenticated');
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [navigate]);

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
            <Button variant="ghost" className="hidden sm:flex" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth')} className="shadow-primary">
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
              Streamline Your{' '}
              <span className="relative">
                <span className="text-gradient">Student Records</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10C50 4 100 2 150 6C200 10 250 8 298 4" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="300" y2="0">
                      <stop stopColor="hsl(24, 100%, 50%)" />
                      <stop offset="1" stopColor="hsl(35, 100%, 55%)" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>{' '}
              Management
            </h1>

            <p className="mt-8 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-slide-up stagger-1 opacity-0">
              A comprehensive portal for registrars to manage student records, 
              enrollment, transcripts, and academic data with unmatched ease and efficiency.
            </p>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up stagger-2 opacity-0">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="h-14 px-8 text-base shadow-primary hover:shadow-glow transition-all duration-300"
              >
                <Zap className="mr-2 h-5 w-5" />
                Get Started Free
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="h-14 px-8 text-base glass border-border/50 hover:border-primary/30 hover:bg-accent/50"
              >
                Watch Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground animate-slide-up stagger-3 opacity-0">
              {['No credit card required', 'Free 14-day trial', 'Cancel anytime'].map((item) => (
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
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Features</span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight">
              Everything You Need
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for university registrars to streamline their workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card p-8 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 hover:border-primary/20"
              >
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                {/* Icon */}
                <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg mb-6 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-base">
                  {feature.description}
                </p>

                {/* Arrow indicator */}
                <div className="mt-6 flex items-center text-primary font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
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
                Join thousands of registrars who trust our platform to manage their student records efficiently
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate('/auth')}
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
            <span className="font-display font-bold text-lg text-foreground">Registrar Portal</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Support</a>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Registrar Portal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}