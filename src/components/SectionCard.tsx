import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  id?: string;
  icon?: ReactNode;
  gradient?: boolean;
}

export function SectionCard({ 
  title, 
  subtitle, 
  children, 
  className, 
  id,
  icon,
  gradient = false,
}: SectionCardProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
      className={cn(
        'relative bg-card rounded-3xl p-6 md:p-8 shadow-lg border border-border/50 overflow-hidden scroll-mt-24',
        gradient && 'bg-gradient-to-br from-card via-card to-primary-light/30',
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          {icon && (
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-primary shrink-0">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-display-xs text-foreground mb-1 truncate">{title}</h2>
            <div className="w-12 h-1 bg-gradient-primary rounded-full" />
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Content */}
        {children}
      </div>
    </motion.div>
  );
}
