import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('registrar_authenticated');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 pattern-dots opacity-20 pointer-events-none" />
      
      <Sidebar onLogout={handleLogout} />
      <main className="pl-64 min-h-screen relative">
        {/* Top gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-accent/30 to-transparent pointer-events-none" />
        
        <div className="relative p-8">
          {children}
        </div>
      </main>
    </div>
  );
}