import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'normal' | 'busy' | 'critical';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    normal: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-600',
      border: 'border-emerald-500/20',
      dot: 'bg-emerald-500',
      label: 'Normal',
    },
    busy: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-600',
      border: 'border-amber-500/20',
      dot: 'bg-amber-500',
      label: 'Busy',
    },
    critical: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-600',
      border: 'border-rose-500/20',
      dot: 'bg-rose-500',
      label: 'Critical',
    },
  };

  const style = config[status];

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm',
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {status === 'critical' && (
          <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', style.dot)} />
        )}
        <span className={cn('relative inline-flex rounded-full h-2 w-2', style.dot)} />
      </span>
      {style.label}
    </motion.span>
  );
}
