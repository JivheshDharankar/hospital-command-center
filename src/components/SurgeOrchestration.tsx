import { SectionCard } from './SectionCard';
import { RiskBadge } from './RiskBadge';

interface SurgeOrchestrationProps {
  occupancy: number;
}

export function SurgeOrchestration({ occupancy }: SurgeOrchestrationProps) {
  let surgeRisk: 'High' | 'Medium' | 'Low' = 'Low';
  if (occupancy > 0.7) surgeRisk = 'High';
  else if (occupancy > 0.5) surgeRisk = 'Medium';

  const actions = {
    High: [
      'Flag upcoming ED overload to operations for all sites.',
      'Recommend diverting new high-risk cases to lower-pressure hospitals.',
      'Suggest calling in additional Emergency and Cardiology staff.',
    ],
    Medium: [
      'Recommend pre-emptively reallocating staff from low-pressure units.',
      'Prepare to convert OPD bays into observation beds if surge continues.',
    ],
    Low: [
      'Capacity comfortable. Continue monitoring without major interventions.',
    ],
  };

  return (
    <SectionCard
      title="AI Surge & Capacity Orchestration"
      subtitle="Predicts overload 60–120 minutes ahead and converts it into a simple Pressure Score (0–100) per hospital."
    >
      <p className="text-sm text-muted-foreground mb-4">
        Next 90-minute ED surge risk: <RiskBadge risk={surgeRisk} /> (city-wide occupancy {(occupancy * 100).toFixed(0)}%).
      </p>
      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
        {actions[surgeRisk].map((action, i) => (
          <li key={i}>{action}</li>
        ))}
      </ul>
    </SectionCard>
  );
}
