import { motion } from 'framer-motion';
import { Ambulance, Heart, Brain, Stethoscope } from 'lucide-react';

const departments = [
  { name: 'Emergency', tag: 'Red & yellow triage', icon: Ambulance, color: 'from-rose-500 to-red-600' },
  { name: 'Cardiology', tag: 'Chest pain & MI', icon: Heart, color: 'from-pink-500 to-rose-600' },
  { name: 'Neurology', tag: 'Stroke window', icon: Brain, color: 'from-violet-500 to-purple-600' },
  { name: 'General Medicine', tag: 'Routine OPD', icon: Stethoscope, color: 'from-blue-500 to-indigo-600' },
];

export function Departments() {
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {departments.map((dept, i) => (
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
    </section>
  );
}
