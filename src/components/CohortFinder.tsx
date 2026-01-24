import { motion } from 'framer-motion';
import { SectionCard } from './SectionCard';
import { RiskBadge } from './RiskBadge';
import { Users, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { useCohortStats } from '@/hooks/useCohortStats';
import { Skeleton } from '@/components/ui/skeleton';

export function CohortFinder() {
  const { cohorts, loading } = useCohortStats();

  return (
    <SectionCard
      title="High-Risk Cohort Finder"
      subtitle="Chronic patient cohorts that would benefit from proactive outreach, based on encounter patterns."
      icon={<Users className="w-6 h-6 text-primary-foreground" />}
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : cohorts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No cohort data available yet.</p>
          <p className="text-sm">Run the queue simulation to generate patient data.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cohorts.map((cohort, i) => {
            const isPositiveTrend = cohort.trend.startsWith('+') && cohort.trend !== '+0%';
            const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 4 }}
                className="group flex items-center gap-4 p-4 bg-card rounded-xl border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  cohort.risk === 'High' 
                    ? 'bg-rose-500/10 text-rose-500' 
                    : cohort.risk === 'Medium'
                    ? 'bg-amber-500/10 text-amber-500'
                    : 'bg-emerald-500/10 text-emerald-500'
                }`}>
                  <Users className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {cohort.name}
                  </h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-muted-foreground">
                      {cohort.size} patients
                    </span>
                    <span className={`flex items-center gap-1 text-xs ${
                      isPositiveTrend ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      <TrendIcon className="w-3 h-3" />
                      {cohort.trend}
                    </span>
                  </div>
                </div>

                <RiskBadge risk={cohort.risk} />

                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Based on last 90 days of encounter data
        </span>
        <button className="text-xs font-medium text-primary hover:underline">
          View All Cohorts →
        </button>
      </div>
    </SectionCard>
  );
}
