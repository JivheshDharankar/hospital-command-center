import { motion } from 'framer-motion';
import { SectionCard } from './SectionCard';
import { Layers, ArrowRight, FileInput, Brain, GitBranch, Monitor } from 'lucide-react';

const architectureSteps = [
  { 
    icon: FileInput,
    title: 'Intake', 
    description: 'Symptom checker creates triage tickets with risk, department, and timestamps.',
    color: 'from-blue-500 to-indigo-500',
  },
  { 
    icon: Brain,
    title: 'AI & Rules Layer', 
    description: 'Risk-scores tickets using explainable rules and (future) ML models.',
    color: 'from-violet-500 to-purple-500',
  },
  { 
    icon: GitBranch,
    title: 'Queue Service', 
    description: 'Assigns tickets to hospitals based on bed capacity and service-level targets.',
    color: 'from-pink-500 to-rose-500',
  },
  { 
    icon: Monitor,
    title: 'Command UI', 
    description: 'Dashboards surface queues, capacity, and alerts for each facility.',
    color: 'from-orange-500 to-amber-500',
  },
];

export function SystemArchitecture() {
  return (
    <SectionCard
      id="architecture"
      title="System Design Overview"
      subtitle="A simple architecture that can scale from a single site to a full hospital network."
      icon={<Layers className="w-6 h-6 text-primary-foreground" />}
      gradient
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {architectureSteps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="relative group"
          >
            <div className="bg-card rounded-2xl p-5 h-full shadow-sm border border-border/50 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
              {/* Step number */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <step.icon className="w-6 h-6 text-white" />
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Step {i + 1}
                </span>
              </div>

              <h4 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {step.title}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Arrow connector */}
            {i < architectureSteps.length - 1 && (
              <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center"
                >
                  <ArrowRight className="w-3 h-3 text-primary" />
                </motion.div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Flow visualization */}
      <div className="mt-8 pt-6 border-t border-border/50">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Data flows from left to right in real-time</span>
        </div>
      </div>
    </SectionCard>
  );
}
