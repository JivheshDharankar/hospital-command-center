import { cn } from '@/lib/utils';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function SectionCard({ title, subtitle, children, className, id }: SectionCardProps) {
  return (
    <div
      id={id}
      className={cn(
        'bg-card rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-card transition-all duration-300 hover:shadow-card-hover scroll-mt-24',
        className
      )}
    >
      <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-1">{title}</h2>
      <div className="w-11 h-0.5 bg-primary rounded-full mb-3" />
      {subtitle && <p className="text-sm text-muted-foreground mb-5">{subtitle}</p>}
      {children}
    </div>
  );
}
