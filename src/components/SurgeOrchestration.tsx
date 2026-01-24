import { motion } from 'framer-motion';
import { SectionCard } from './SectionCard';
import { RiskBadge } from './RiskBadge';
import { TrendingUp, AlertCircle, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { useSurgePrediction } from '@/hooks/useSurgePrediction';
import { Skeleton } from '@/components/ui/skeleton';

export function SurgeOrchestration() {
  const { prediction, loading } = useSurgePrediction();

  const getActionIcon = (action: string) => {
    if (action.includes('Flag') || action.includes('overload')) return AlertCircle;
    if (action.includes('divert') || action.includes('reallocat')) return ArrowUpRight;
    if (action.includes('staff') || action.includes('Prepare')) return TrendingUp;
    return CheckCircle2;
  };

  const isUrgentAction = (action: string) => {
    return action.includes('Flag') || action.includes('divert');
  };

  if (loading) {
    return (
      <SectionCard
        title="AI Surge & Capacity Orchestration"
        subtitle="Predicts overload 60–120 minutes ahead and converts it into a simple Pressure Score per hospital."
        icon={<TrendingUp className="w-6 h-6 text-primary-foreground" />}
      >
        <Skeleton className="h-24 rounded-xl mb-6" />
        <div className="space-y-2">
          <Skeleton className="h-14 rounded-xl" />
          <Skeleton className="h-14 rounded-xl" />
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="AI Surge & Capacity Orchestration"
      subtitle="Predicts overload 60–120 minutes ahead and converts it into a simple Pressure Score per hospital."
      icon={<TrendingUp className="w-6 h-6 text-primary-foreground" />}
    >
      {/* Occupancy Gauge */}
      <div className="flex items-center gap-6 mb-6 p-4 bg-muted/30 rounded-xl border border-border/50">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              className="text-muted"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              r="14"
              cx="18"
              cy="18"
            />
            <motion.circle
              className={
                prediction.surgeRisk === 'High' ? 'text-rose-500' :
                prediction.surgeRisk === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
              }
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              r="14"
              cx="18"
              cy="18"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 100' }}
              animate={{ strokeDasharray: `${prediction.currentOccupancy} 100` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">{prediction.currentOccupancy}%</span>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-sm font-medium text-muted-foreground">
              {prediction.predictionWindowMinutes}-min ED Surge Risk
            </span>
            <RiskBadge risk={prediction.surgeRisk} />
          </div>
          <p className="text-xs text-muted-foreground">
            City-wide bed occupancy across all monitored facilities
          </p>
          {prediction.predictedOccupancy > prediction.currentOccupancy && (
            <p className="text-xs text-amber-600 mt-1">
              Predicted: {prediction.predictedOccupancy}% in {prediction.predictionWindowMinutes} min
            </p>
          )}
        </div>
      </div>

      {/* Action Items */}
      <div className="space-y-2">
        {prediction.recommendedActions.map((action, i) => {
          const Icon = getActionIcon(action);
          const urgent = isUrgentAction(action);
          
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                urgent 
                  ? 'bg-rose-500/5 border border-rose-500/20' 
                  : 'bg-muted/30 border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${
                urgent ? 'text-rose-500' : 'text-primary'
              }`} />
              <span className="text-sm text-muted-foreground">{action}</span>
            </motion.div>
          );
        })}
      </div>
    </SectionCard>
  );
}
