import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  risk: 'High' | 'Medium' | 'Low';
  className?: string;
}

export function RiskBadge({ risk, className }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        'font-semibold',
        {
          'text-destructive': risk === 'High',
          'text-warning': risk === 'Medium',
          'text-success': risk === 'Low',
        },
        className
      )}
    >
      {risk}
    </span>
  );
}
