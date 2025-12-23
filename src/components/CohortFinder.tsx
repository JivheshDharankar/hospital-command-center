import { SectionCard } from './SectionCard';
import { RiskBadge } from './RiskBadge';

const cohorts = [
  { name: 'Frequent ED users (≥4 visits/year)', size: 87, risk: 'High' as const },
  { name: 'Diabetes + hypertension patients', size: 142, risk: 'Medium' as const },
  { name: 'Elderly (>75) with 2+ comorbidities', size: 63, risk: 'High' as const },
];

export function CohortFinder() {
  return (
    <SectionCard
      title="High-Risk Cohort Finder (Clinic View)"
      subtitle="Demo view of chronic patient cohorts that would benefit from proactive outreach, based on encounter patterns."
    >
      <div className="space-y-3">
        {cohorts.map((cohort, i) => (
          <div
            key={i}
            className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 bg-secondary/50 rounded-lg"
          >
            <span className="font-medium text-sm">{cohort.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{cohort.size} patients</span>
              <RiskBadge risk={cohort.risk} />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
