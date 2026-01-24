import { motion } from 'framer-motion';
import { Ambulance, Heart, Brain, Stethoscope, Bone, Baby, Clock, Users } from 'lucide-react';
import { useDepartmentStats } from '@/hooks/useDepartmentStats';
import { Skeleton } from '@/components/ui/skeleton';

const departmentConfig: Record<string, { icon: typeof Ambulance; color: string; tag: string }> = {
  'Emergency': { icon: Ambulance, color: 'from-rose-500 to-red-600', tag: 'Red & yellow triage' },
  'Cardiology': { icon: Heart, color: 'from-pink-500 to-rose-600', tag: 'Chest pain & MI' },
  'Neurology': { icon: Brain, color: 'from-violet-500 to-purple-600', tag: 'Stroke window' },
  'General Medicine': { icon: Stethoscope, color: 'from-blue-500 to-indigo-600', tag: 'Routine OPD' },
  'Orthopedics': { icon: Bone, color: 'from-amber-500 to-orange-600', tag: 'Fractures & trauma' },
  'Pediatrics': { icon: Baby, color: 'from-teal-500 to-cyan-600', tag: 'Child care' },
};

export function Departments() {
  const { departments, loading } = useDepartmentStats();

  // Merge database stats with static config
  const departmentData = departments.length > 0 
    ? departments.slice(0, 6).map(d => ({
        name: d.department,
        queue: d.totalQueue,
        avgWait: d.avgWait,
        hospitals: d.hospitalsCount,
        ...departmentConfig[d.department] || { 
          icon: Stethoscope, 
          color: 'from-gray-500 to-slate-600', 
          tag: 'Healthcare' 
        },
      }))
    : Object.entries(departmentConfig).slice(0, 4).map(([name, config]) => ({
        name,
        queue: 0,
        avgWait: 0,
        hospitals: 0,
        ...config,
      }));

  return (
    <section className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <span className="inline-block px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full mb-4">
          Specializations
        </span>
        <h2 className="text-display-sm text-foreground mb-2">Key Departments</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Focus on service lines where delays are most dangerous.
        </p>
      </motion.div>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {departmentData.map((dept, i) => (
            <motion.div
              key={dept.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ 
                y: -6, 
                transition: { duration: 0.2 } 
              }}
              className="group relative bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${dept.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${dept.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <dept.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <h3 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                {dept.name}
              </h3>
              
              {/* Dynamic Stats */}
              {dept.queue > 0 && (
                <div className="flex items-center gap-3 mb-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {dept.queue} in queue
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    ~{dept.avgWait}m wait
                  </span>
                </div>
              )}
              
              <span className="inline-block text-xs font-medium px-3 py-1.5 bg-muted text-muted-foreground rounded-full">
                {dept.tag}
              </span>

              {/* Arrow indicator */}
              <motion.div
                className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.1 }}
              >
                <svg className="w-4 h-4 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
