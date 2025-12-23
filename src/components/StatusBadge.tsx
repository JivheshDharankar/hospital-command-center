import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'normal' | 'busy' | 'critical';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
        {
          'bg-success/10 text-success': status === 'normal',
          'bg-warning/10 text-warning': status === 'busy',
          'bg-destructive/10 text-destructive': status === 'critical',
        },
        className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
