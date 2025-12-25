import { motion } from 'framer-motion';
import { Hospital } from '@/types/hospital';
import { SectionCard } from './SectionCard';
import { StatusBadge } from './StatusBadge';
import { 
  LayoutDashboard, Bed, UserCheck, Star, Clock, Shield, 
  Building2, Ambulance, ChevronRight, Heart
} from 'lucide-react';
import { useState } from 'react';

interface HospitalDashboardProps {
  hospitals: Hospital[];
}

export function HospitalDashboard({ hospitals }: HospitalDashboardProps) {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  return (
    <SectionCard
      id="dashboard"
      title="Hospital Resource Dashboard"
      subtitle="Real-time capacity monitoring across 15 Pune hospitals with specialties, ratings & insurance info."
      icon={<LayoutDashboard className="w-6 h-6 text-primary-foreground" />}
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Hospitals', value: hospitals.length, icon: Building2, color: 'text-primary' },
          { label: 'Available Beds', value: hospitals.reduce((sum, h) => sum + h.available_beds, 0), icon: Bed, color: 'text-emerald-500' },
          { label: 'Doctors On-Duty', value: hospitals.reduce((sum, h) => sum + h.doctors_available, 0), icon: UserCheck, color: 'text-blue-500' },
          { label: 'ICU Beds', value: hospitals.reduce((sum, h) => sum + h.icuBeds, 0), icon: Heart, color: 'text-rose-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-muted/30 rounded-xl p-4 border border-border/50"
          >
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Hospital Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hospitals.map((hospital, i) => (
          <motion.div
            key={hospital.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setSelectedHospital(selectedHospital?.id === hospital.id ? null : hospital)}
            className={`group cursor-pointer bg-card rounded-2xl p-5 border transition-all duration-300 ${
              selectedHospital?.id === hospital.id 
                ? 'border-primary shadow-lg shadow-primary/10' 
                : 'border-border/50 hover:border-primary/30 hover:shadow-md'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium ${
                    hospital.type === 'government' ? 'bg-blue-100 text-blue-700' :
                    hospital.type === 'trust' ? 'bg-purple-100 text-purple-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {hospital.type}
                  </span>
                  <StatusBadge status={hospital.status} />
                </div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {hospital.name}
                </h3>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-semibold">{hospital.rating}</span>
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-foreground">{hospital.available_beds}</div>
                <div className="text-[10px] text-muted-foreground">Beds</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-foreground">{hospital.doctors_available}</div>
                <div className="text-[10px] text-muted-foreground">Doctors</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-foreground">{hospital.icuBeds}</div>
                <div className="text-[10px] text-muted-foreground">ICU</div>
              </div>
            </div>

            {/* Capacity Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Occupancy</span>
                <span>{Math.round((1 - hospital.available_beds / hospital.total_beds) * 100)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    hospital.status === 'critical' ? 'bg-gradient-to-r from-rose-500 to-rose-400' :
                    hospital.status === 'busy' ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 
                    'bg-gradient-to-r from-emerald-500 to-emerald-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(1 - hospital.available_beds / hospital.total_beds) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.03 }}
                />
              </div>
            </div>

            {/* Specialties Preview */}
            <div className="flex flex-wrap gap-1 mb-3">
              {hospital.specialties.slice(0, 3).map((spec) => (
                <span 
                  key={spec.name}
                  className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                >
                  {spec.name}
                </span>
              ))}
              {hospital.specialties.length > 3 && (
                <span className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                  +{hospital.specialties.length - 3} more
                </span>
              )}
            </div>

            {/* Accreditations */}
            <div className="flex items-center gap-1 mb-3">
              <Shield className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">
                {hospital.accreditations.join(' • ')}
              </span>
            </div>

            {/* Features */}
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              {hospital.emergencyAvailable && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                  24/7 ER
                </span>
              )}
              <span className="flex items-center gap-1">
                <Ambulance className="w-3 h-3" />
                {hospital.ambulanceCount} Ambulances
              </span>
              {hospital.nicuAvailable && (
                <span className="text-purple-600">NICU</span>
              )}
            </div>

            {/* Expand indicator */}
            <div className="flex items-center justify-center mt-3 pt-3 border-t border-border/50">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {selectedHospital?.id === hospital.id ? 'Click to collapse' : 'Click for details'}
                <ChevronRight className={`w-3 h-3 transition-transform ${selectedHospital?.id === hospital.id ? 'rotate-90' : ''}`} />
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Expanded Detail Panel */}
      {selectedHospital && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-6 bg-gradient-to-br from-card to-muted/30 rounded-2xl p-6 border border-primary/20"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">{selectedHospital.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedHospital.address}</p>
              <div className="flex items-center gap-3 mt-2 text-sm">
                <span className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  {selectedHospital.rating} ({selectedHospital.reviewCount.toLocaleString()} reviews)
                </span>
                <span className="text-muted-foreground">Est. {selectedHospital.established}</span>
              </div>
            </div>
            <StatusBadge status={selectedHospital.status} />
          </div>

          {/* Wait Times Grid */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Department Wait Times
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {selectedHospital.specialties.map((spec) => (
                <div 
                  key={spec.name}
                  className="bg-card rounded-xl p-3 border border-border/50"
                >
                  <div className="text-xs font-medium text-foreground mb-1">{spec.name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-lg font-bold ${
                      (spec.waitTime || 0) > 45 ? 'text-rose-500' :
                      (spec.waitTime || 0) > 25 ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {spec.waitTime}
                    </span>
                    <span className="text-[10px] text-muted-foreground">min</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{spec.queue} in queue</div>
                </div>
              ))}
            </div>
          </div>

          {/* Insurance */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Accepted Insurance
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedHospital.insurance.map((ins) => (
                <span 
                  key={ins.name}
                  className={`text-xs px-3 py-1.5 rounded-full border ${
                    ins.cashless 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'bg-muted border-border text-muted-foreground'
                  }`}
                >
                  {ins.name}
                  {ins.cashless && <span className="ml-1 text-[10px]">✓ Cashless</span>}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <p className="text-xs text-muted-foreground mt-5 flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        Real Pune hospital data with simulated capacity metrics
      </p>
    </SectionCard>
  );
}
