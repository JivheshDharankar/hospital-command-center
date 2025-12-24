import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  risk: 'High' | 'Medium' | 'Low';
  className?: string;
  showDot?: boolean;
}

export function RiskBadge({ risk, className, showDot = true }: RiskBadgeProps) {
  const config = {
    High: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-600',
      border: 'border-rose-500/20',
      dot: 'bg-rose-500',
      glow: 'shadow-rose-500/20',
    },
    Medium: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-600',
      border: 'border-amber-500/20',
      dot: 'bg-amber-500',
      glow: 'shadow-amber-500/20',
    },
    Low: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-600',
      border: 'border-emerald-500/20',
      dot: 'bg-emerald-500',
      glow: 'shadow-emerald-500/20',
    },
  };

  const style = config[risk];

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
        style.bg,
        style.text,
        style.border,
        className
      )}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          {risk === 'High' && (
            <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', style.dot)} />
          )}
          <span className={cn('relative inline-flex rounded-full h-2 w-2', style.dot)} />
        </span>
      )}
      {risk}
    </motion.span>
  );
}
