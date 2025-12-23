import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SectionCard } from './SectionCard';
import { Hospital } from '@/types/hospital';
import { findNearestHospitals, NearbyHospital } from '@/utils/geolocation';
import { MapPin, Navigation, Phone } from 'lucide-react';
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
      title="Find Nearby Hospital (Pune Demo)"
      subtitle="Use your current location to see the closest hospitals and open the route in Google Maps."
    >
      <Button onClick={handleLocate} disabled={isLoading}>
        <MapPin className="w-4 h-4 mr-2" />
        {isLoading ? 'Detecting...' : 'Use My Location'}
      </Button>

      {status && (
        <p className={`text-sm mt-3 ${nearbyHospitals.length > 0 ? 'text-success' : 'text-muted-foreground'}`}>
          {status}
        </p>
      )}

      {nearbyHospitals.length > 0 && (
        <div className="mt-4 space-y-3">
          {nearbyHospitals.map((hospital) => (
            <div
              key={hospital.id}
              className="bg-secondary/50 rounded-xl p-4 space-y-2 animate-fade-in"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{hospital.name}</h4>
                  <p className="text-sm text-muted-foreground">~{hospital.distance.toFixed(1)} km away</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <a href={`tel:${hospital.phone}`} className="flex items-center gap-1 text-primary hover:underline">
                  <Phone className="w-3 h-3" />
                  {hospital.phone}
                </a>
                <a
                  href={hospital.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <Navigation className="w-3 h-3" />
                  Open in Maps
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
