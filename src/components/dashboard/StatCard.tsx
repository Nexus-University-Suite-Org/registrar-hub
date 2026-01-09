import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
}

const variantStyles = {
  default: 'bg-card border-border/50',
  primary: 'bg-gradient-to-br from-accent to-card border-primary/10',
  success: 'bg-gradient-to-br from-success/5 to-card border-success/10',
  warning: 'bg-gradient-to-br from-warning/5 to-card border-warning/10',
  destructive: 'bg-gradient-to-br from-destructive/5 to-card border-destructive/10',
};

const iconStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-gradient-to-br from-primary to-orange-400 text-white shadow-primary',
  success: 'bg-gradient-to-br from-success to-emerald-400 text-white shadow-lg',
  warning: 'bg-gradient-to-br from-warning to-amber-400 text-white shadow-lg',
  destructive: 'bg-gradient-to-br from-destructive to-red-400 text-white shadow-lg',
};

export function StatCard({ title, value, icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group",
        variantStyles[variant]
      )}
    >
      {/* Decorative gradient */}
      {variant !== 'default' && (
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      )}
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-display font-bold text-foreground tracking-tight">{value}</p>
          {trend && (
            <div
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
                trend.isPositive 
                  ? "bg-success/10 text-success" 
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110",
            iconStyles[variant]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}