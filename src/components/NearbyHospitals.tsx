import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SectionCard } from './SectionCard';
import { Hospital } from '@/types/hospital';
import { findNearestHospitals, NearbyHospital } from '@/utils/geolocation';
import { MapPin, Navigation, Phone, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
        const nearest = findNearestHospitals(latitude, longitude, hospitals);
        setNearbyHospitals(nearest);
        setIsLoading(false);
        toast({
          title: 'Location Found',
          description: 'Nearby hospitals have been identified.',
        });
      },
      () => {
        setStatus('Could not get your location (permission denied or error).');
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <SectionCard
      id="locator"
      title="Find Nearby Hospital"
      subtitle="Use your current location to see the closest hospitals and open the route in Google Maps."
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
            className="grid gap-4"
          >
            {nearbyHospitals.map((hospital, i) => (
              <motion.div
                key={hospital.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-card rounded-2xl p-5 border border-border/50 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                {/* Distance Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  <Navigation className="w-3 h-3" />
                  {hospital.distance.toFixed(1)} km
                </div>

                <div className="pr-24">
                  <h4 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                    {hospital.name}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Closest facility based on your location
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={`tel:${hospital.phone}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-xl text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-primary" />
                    {hospital.phone}
                  </a>
                  <a
                    href={hospital.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in Maps
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && nearbyHospitals.length === 0 && !status && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Click the button above to find hospitals near your current location
          </p>
        </div>
      )}
    </SectionCard>
  );
}
