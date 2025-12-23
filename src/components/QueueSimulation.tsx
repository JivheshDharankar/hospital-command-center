import { Button } from '@/components/ui/button';
import { SectionCard } from './SectionCard';
import { RiskBadge } from './RiskBadge';
import { QueueEvent } from '@/types/hospital';
import { Play, Pause } from 'lucide-react';

interface QueueSimulationProps {
  events: QueueEvent[];
  isRunning: boolean;
  onToggle: () => void;
}

export function QueueSimulation({ events, isRunning, onToggle }: QueueSimulationProps) {
  return (
    <SectionCard
      id="queue"
      title="Incoming Queue Simulation"
      subtitle="Simulates patients entering the system and being routed based on risk and capacity."
    >
      <Button onClick={onToggle} className="mb-4">
        {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
        {isRunning ? 'Stop Simulation' : 'Start Simulation'}
      </Button>
      
      <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">Click "Start Simulation" to begin...</p>
        ) : (
          events.map(event => (
            <div
              key={event.id}
              className="flex flex-wrap items-center gap-2 text-sm py-2 px-3 bg-secondary/50 rounded-lg animate-fade-in"
            >
              <span className="font-medium text-muted-foreground">{event.time}</span>
              <span className="text-foreground">—</span>
              <span className="font-medium">{event.patientName}</span>
              <span className="text-foreground">•</span>
              <RiskBadge risk={event.risk} />
              <span className="text-foreground">•</span>
              <span className="text-muted-foreground">{event.department}</span>
              <span className="text-foreground">→</span>
              <span className="italic text-muted-foreground">{event.hospital}</span>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  );
}
