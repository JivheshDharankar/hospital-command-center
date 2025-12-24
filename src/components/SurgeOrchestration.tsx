import { motion } from 'framer-motion';
import { SectionCard } from './SectionCard';
import { RiskBadge } from './RiskBadge';
import { TrendingUp, AlertCircle, CheckCircle2, ArrowUpRight } from 'lucide-react';

interface SurgeOrchestrationProps {
  occupancy: number;
}

export function SurgeOrchestration({ occupancy }: SurgeOrchestrationProps) {
  let surgeRisk: 'High' | 'Medium' | 'Low' = 'Low';
  if (occupancy > 0.7) surgeRisk = 'High';
  else if (occupancy > 0.5) surgeRisk = 'Medium';

  const actions = {
    High: [
      { icon: AlertCircle, text: 'Flag upcoming ED overload to operations for all sites.', urgent: true },
      { icon: ArrowUpRight, text: 'Recommend diverting new high-risk cases to lower-pressure hospitals.', urgent: true },
      { icon: TrendingUp, text: 'Suggest calling in additional Emergency and Cardiology staff.', urgent: false },
    ],
    Medium: [
      { icon: ArrowUpRight, text: 'Recommend pre-emptively reallocating staff from low-pressure units.', urgent: false },
      { icon: CheckCircle2, text: 'Prepare to convert OPD bays into observation beds if surge continues.', urgent: false },
    ],
    Low: [
      { icon: CheckCircle2, text: 'Capacity comfortable. Continue monitoring without major interventions.', urgent: false },
    ],
  };

  const occupancyPercent = Math.round(occupancy * 100);

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
                surgeRisk === 'High' ? 'text-rose-500' :
                surgeRisk === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
              }
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              r="14"
              cx="18"
              cy="18"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 100' }}
              animate={{ strokeDasharray: `${occupancyPercent} 100` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-foreground">{occupancyPercent}%</span>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-sm font-medium text-muted-foreground">90-min ED Surge Risk</span>
            <RiskBadge risk={surgeRisk} />
          </div>
          <p className="text-xs text-muted-foreground">
            City-wide bed occupancy across all monitored facilities
          </p>
        </div>
      </div>

      {/* Action Items */}
      <div className="space-y-2">
        {actions[surgeRisk].map((action, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
              action.urgent 
                ? 'bg-rose-500/5 border border-rose-500/20' 
                : 'bg-muted/30 border border-transparent'
            }`}
          >
            <action.icon className={`w-5 h-5 mt-0.5 shrink-0 ${
              action.urgent ? 'text-rose-500' : 'text-primary'
            }`} />
            <span className="text-sm text-muted-foreground">{action.text}</span>
          </motion.div>
        ))}
      </div>
    </SectionCard>
  );
}
