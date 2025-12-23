import { SectionCard } from './SectionCard';
import { ArrowRight } from 'lucide-react';

const architectureSteps = [
  { title: 'Intake', description: 'Symptom checker creates triage tickets with risk, department, and timestamps.' },
  { title: 'AI & Rules Layer', description: 'Risk-scores tickets using explainable rules and (future) ML models.' },
  { title: 'Queue Service', description: 'Assigns tickets to hospitals based on bed capacity and service-level targets.' },
  { title: 'Command UI', description: 'Dashboards surface queues, capacity, and alerts for each facility.' },
];

export function SystemArchitecture() {
  return (
    <SectionCard
      id="architecture"
      title="System Design Overview"
      subtitle="A simple architecture that can scale from a single site to a full hospital network."
      className="bg-accent"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {architectureSteps.map((step, i) => (
          <div key={i} className="relative">
            <div className="bg-card rounded-xl p-4 h-full shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-semibold">
                  {i + 1}
                </span>
                <h4 className="font-semibold text-sm">{step.title}</h4>
              </div>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
            {i < architectureSteps.length - 1 && (
              <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-primary z-10" />
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
