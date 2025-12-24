import { motion } from 'framer-motion';
import { Hospital } from '@/types/hospital';
import { SectionCard } from './SectionCard';
import { StatusBadge } from './StatusBadge';
import { LayoutDashboard, Bed, UserCheck } from 'lucide-react';

interface HospitalDashboardProps {
  hospitals: Hospital[];
}

export function HospitalDashboard({ hospitals }: HospitalDashboardProps) {
  return (
    <SectionCard
      id="dashboard"
      title="Hospital Resource Dashboard"
      subtitle="Used by operations teams to see which units are nearing capacity before it becomes a crisis."
      icon={<LayoutDashboard className="w-6 h-6 text-primary-foreground" />}
    >
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border/50">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left py-4 px-5 text-sm font-semibold text-foreground">Hospital</th>
              <th className="text-left py-4 px-5 text-sm font-semibold text-foreground">
                <span className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-muted-foreground" />
                  Available Beds
                </span>
              </th>
              <th className="text-left py-4 px-5 text-sm font-semibold text-foreground">
                <span className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                  Doctors on Duty
                </span>
              </th>
              <th className="text-left py-4 px-5 text-sm font-semibold text-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {hospitals.map((hospital, i) => (
              <motion.tr
                key={hospital.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="border-t border-border/50 hover:bg-muted/30 transition-colors"
              >
                <td className="py-4 px-5">
                  <span className="font-medium text-foreground">{hospital.name}</span>
                </td>
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-foreground">{hospital.available_beds}</span>
                    <div className="flex-1 max-w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          hospital.status === 'critical' ? 'bg-rose-500' :
                          hospital.status === 'busy' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((hospital.available_beds / 20) * 100, 100)}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5">
                  <span className="text-lg font-semibold text-foreground">{hospital.doctors_available}</span>
                </td>
                <td className="py-4 px-5">
                  <StatusBadge status={hospital.status} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {hospitals.map((hospital, i) => (
          <motion.div
            key={hospital.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-muted/30 rounded-xl p-4 border border-border/50"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-foreground">{hospital.name}</span>
              <StatusBadge status={hospital.status} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Beds</div>
                <div className="text-xl font-bold text-foreground">{hospital.available_beds}</div>
              </div>
              <div className="bg-card rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Doctors</div>
                <div className="text-xl font-bold text-foreground">{hospital.doctors_available}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-5 flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse" />
        Demo data only. In production, this would refresh from live hospital systems.
      </p>
    </SectionCard>
  );
}
