import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SectionCard } from './SectionCard';
import { RiskBadge } from './RiskBadge';
import { QueueEvent } from '@/types/hospital';
import { Play, Pause, Users } from 'lucide-react';

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
      subtitle="Real-time patient intake feed — data persists across sessions."
      icon={<Users className="w-6 h-6 text-primary-foreground" />}
    >
      <div className="flex items-center gap-4 mb-6">
        <Button 
          onClick={onToggle} 
          variant={isRunning ? 'outline' : 'default'}
          className="relative overflow-hidden"
        >
          <motion.span
            key={isRunning ? 'pause' : 'play'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop Simulation
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Simulation
              </>
            )}
          </motion.span>
          {isRunning && (
            <motion.span
              className="absolute inset-0 bg-primary/10"
              animate={{ opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </Button>
        
        {isRunning && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Live
          </motion.div>
        )}
      </div>
      
      <div className="max-h-64 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Click "Start Simulation" to begin watching<br />patients enter the queue in real-time
              </p>
            </motion.div>
          ) : (
            events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.3, delay: index === 0 ? 0 : 0 }}
                className="group flex flex-wrap items-center gap-3 text-sm py-3 px-4 bg-card rounded-xl border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-200"
              >
                <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {event.time}
                </span>
                <span className="font-semibold text-foreground">{event.patientName}</span>
                <RiskBadge risk={event.risk} />
                <span className="text-muted-foreground text-xs px-2 py-1 bg-muted rounded-full">
                  {event.department}
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="text-sm font-medium text-primary">{event.hospital}</span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </SectionCard>
  );
}
