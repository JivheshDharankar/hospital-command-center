import { motion } from 'framer-motion';
import { Building2, HeartPulse, Timer } from 'lucide-react';

interface Stat {
  icon: typeof Building2;
  value: string;
  label: string;
  color: string;
}

const stats: Stat[] = [
  { 
    icon: Building2, 
    value: '4 Hospitals', 
    label: 'City-wide view across emergency and OPD',
    color: 'from-blue-500 to-indigo-500'
  },
  { 
    icon: HeartPulse, 
    value: '3 Critical Units', 
    label: 'Emergency, Cardiology, Neurology',
    color: 'from-rose-500 to-pink-500'
  },
  { 
    icon: Timer, 
    value: 'Under 60s', 
    label: 'From symptom entry to triage decision',
    color: 'from-emerald-500 to-teal-500'
  },
];

export function StatsGrid() {
  return (
    <section className="container mx-auto px-4 -mt-8 md:-mt-12 relative z-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ 
              duration: 0.5, 
              delay: i * 0.1,
              ease: [0.25, 0.4, 0.25, 1]
            }}
            whileHover={{ 
              y: -4, 
              transition: { duration: 0.2 } 
            }}
            className="group relative bg-card rounded-2xl p-6 shadow-lg border border-border/50 overflow-hidden"
          >
            {/* Gradient accent */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
            
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4 shadow-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
              {stat.value}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {stat.label}
            </p>

            {/* Hover gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
