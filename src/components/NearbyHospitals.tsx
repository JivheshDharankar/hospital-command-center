import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SectionCard } from './SectionCard';
import { Hospital } from '@/types/hospital';
import { findNearestHospitals, NearbyHospital } from '@/utils/geolocation';
import { 
  MapPin, Navigation, Phone, ExternalLink, Loader2, 
  Star, Clock, Shield, Ambulance, Bed, Heart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from './StatusBadge';

interface NearbyHospitalsProps {
  hospitals: Hospital[];
}

export function NearbyHospitals({ hospitals }: NearbyHospitalsProps) {
  const [nearbyHospitals, setNearbyHospitals] = useState<NearbyHospital[]>([]);
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setStatus('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoading(true);
    setStatus('Detecting your location...');
    setNearbyHospitals([]);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setStatus(`Location detected: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        const nearest = findNearestHospitals(latitude, longitude, hospitals, 5);
        setNearbyHospitals(nearest);
        setIsLoading(false);
        toast({
          title: 'Location Found',
          description: `Found ${nearest.length} hospitals near you.`,
        });
      },
      () => {
        setStatus('Could not get your location (permission denied or error).');
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const getHospitalData = (id: string) => hospitals.find(h => h.id === id);

  return (
    <SectionCard
      id="locator"
      title="Find Nearby Hospitals"
      subtitle="Locate the nearest hospitals with real-time availability, specialties, and insurance information."
      icon={<MapPin className="w-6 h-6 text-primary-foreground" />}
    >
      <Button 
        onClick={handleLocate} 
        disabled={isLoading}
        size="lg"
        className="mb-4"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Detecting...
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4 mr-2" />
            Use My Location
          </>
        )}
      </Button>

      <AnimatePresence>
        {status && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-sm mb-4 flex items-center gap-2 ${
              nearbyHospitals.length > 0 ? 'text-emerald-600' : 'text-muted-foreground'
            }`}
          >
            {nearbyHospitals.length > 0 && (
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            )}
            {status}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {nearbyHospitals.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {nearbyHospitals.map((nearbyHospital, i) => {
              const hospital = getHospitalData(nearbyHospital.id);
              if (!hospital) return null;

              return (
                <motion.div
                  key={hospital.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative bg-card rounded-2xl p-5 border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
                >
                  {/* Distance & Rating Badge */}
                  <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                      <Navigation className="w-3 h-3" />
                      {nearbyHospital.distance.toFixed(1)} km
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 text-sm">
                      <Star className="w-3 h-3 fill-current" />
                      {hospital.rating}
                    </div>
                  </div>

                  {/* Header */}
                  <div className="pr-24 mb-4">
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
                    <h4 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                      {hospital.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">{hospital.address}</p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <Bed className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                      <div className="text-sm font-bold text-foreground">{hospital.available_beds}</div>
                      <div className="text-[10px] text-muted-foreground">Beds</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <Heart className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                      <div className="text-sm font-bold text-foreground">{hospital.icuBeds}</div>
                      <div className="text-[10px] text-muted-foreground">ICU</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <Clock className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                      <div className="text-sm font-bold text-foreground">
                        {hospital.specialties.find(s => s.name === 'Emergency')?.waitTime || '~'}
                      </div>
                      <div className="text-[10px] text-muted-foreground">ER Wait</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center">
                      <Ambulance className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                      <div className="text-sm font-bold text-foreground">{hospital.ambulanceCount}</div>
                      <div className="text-[10px] text-muted-foreground">Ambulances</div>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="mb-4">
                    <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Key Specialties
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {hospital.specialties.slice(0, 4).map((spec) => (
                        <span 
                          key={spec.name}
                          className="text-[10px] px-2 py-1 bg-primary/10 text-primary rounded-full flex items-center gap-1"
                        >
                          {spec.name}
                          <span className="text-primary/70">~{spec.waitTime}m</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Insurance Quick View */}
                  <div className="mb-4">
                    <div className="text-xs text-muted-foreground mb-2">Cashless Insurance</div>
                    <div className="flex flex-wrap gap-1">
                      {hospital.insurance.filter(i => i.cashless).slice(0, 4).map((ins) => (
                        <span 
                          key={ins.name}
                          className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full"
                        >
                          {ins.name}
                        </span>
                      ))}
                      {hospital.insurance.filter(i => i.cashless).length > 4 && (
                        <span className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                          +{hospital.insurance.filter(i => i.cashless).length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-border/50">
                    <a
                      href={`tel:${hospital.phone}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-xl text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-primary" />
                      {hospital.phone}
                    </a>
                    <a
                      href={nearbyHospital.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Get Directions
                    </a>
                    {hospital.website && (
                      <a
                        href={hospital.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                      >
                        Visit Website
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && nearbyHospitals.length === 0 && !status && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Click the button above to find hospitals near your current location with real-time availability
          </p>
        </div>
      )}
    </SectionCard>
  );
}
