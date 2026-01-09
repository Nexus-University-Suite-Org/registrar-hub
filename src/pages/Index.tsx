import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowRight, Users, FileText, BarChart3, Shield, CheckCircle2 } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Student Management',
    description: 'Complete CRUD operations for student records with search and filtering',
  },
  {
    icon: FileText,
    title: 'Transcript Access',
    description: 'Generate and manage academic transcripts efficiently',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Comprehensive reporting on enrollment and academic data',
  },
  {
    icon: Shield,
    title: 'Secure Access',
    description: 'Role-based authentication with institutional email verification',
  },
];

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    const isAuthenticated = localStorage.getItem('registrar_authenticated');
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Registrar Portal
            </span>
          </div>
          <Button onClick={() => navigate('/auth')}>
            Sign In
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 gradient-hero">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-primary text-sm font-medium mb-8">
            <CheckCircle2 className="h-4 w-4" />
            University Registrar Management System
          </div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground max-w-4xl mx-auto leading-tight">
            Streamline Your{' '}
            <span className="text-gradient">Student Records</span>{' '}
            Management
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive portal for registrars to manage student records, 
            enrollment, transcripts, and academic data with ease.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" variant="hero" onClick={() => navigate('/auth')}>
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="xl" variant="outline">
              Learn More
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Everything You Need
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed specifically for university registrars
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-2 hover:border-primary/20"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-primary mb-6 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-3xl gradient-primary p-12 md:p-16 text-center">
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
                Sign in with your institutional email to access the registrar portal
              </p>
              <Button
                size="xl"
                variant="secondary"
                onClick={() => navigate('/auth')}
                className="bg-background text-foreground hover:bg-background/90"
              >
                Sign In Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-white/10" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">Registrar Portal</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 University Registrar. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
