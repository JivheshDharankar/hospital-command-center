import { motion } from 'framer-motion';
import { Brain, GitBranch, LayoutDashboard, CheckCircle2 } from 'lucide-react';

const features = [
  { 
    icon: Brain,
    title: 'Triage Intelligence', 
    description: 'Scores symptoms and assigns patients to Emergency, Cardiology, Neurology, or OPD.',
  },
  { 
    icon: GitBranch,
    title: 'Capacity-aware Routing', 
    description: 'Considers beds, ICU, and doctors before new cases are accepted.',
  },
  { 
    icon: LayoutDashboard,
    title: 'Clean Operational View', 
    description: 'Designed to fit into hospital control rooms and MIS dashboards.',
  },
];

export function Features() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full mb-4">
            Transparent AI
          </span>
          <h2 className="text-display-md text-foreground mb-4">
            AI That Stays Under
            <span className="text-gradient"> Hospital Control</span>
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Instead of a black-box model, MediQueue AI uses explainable rules and capacity data
            so every routing decision can be traced and audited by operations or clinical leads.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>Trusted by Ruby Hall Clinic operations team</span>
          </div>
        </motion.div>
        
        <div className="grid gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ x: 4, transition: { duration: 0.2 } }}
              className="group flex gap-4 p-5 bg-card rounded-2xl border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {feature.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
