import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { Hospital } from '@/types/hospital';
import { SectionCard } from './SectionCard';
import { StatusBadge } from './StatusBadge';
import { 
  MapIcon, Star, Bed, Phone, Clock, Navigation, 
  X, Maximize2, Minimize2, Building2, Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';

interface HospitalMapProps {
  hospitals: Hospital[];
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = { lat: 18.5204, lng: 73.8567 }; // Pune center

const getMarkerIcon = (status: Hospital['status']) => {
  const colors = {
    normal: '#10b981',
    busy: '#f59e0b', 
    critical: '#ef4444',
  };
  
  return {
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    fillColor: colors[status],
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: 1.8,
    anchor: { x: 12, y: 22 } as google.maps.Point,
  };
};

// Inner component that handles the Google Maps rendering
function GoogleMapsContent({ hospitals, apiKey }: { hospitals: Hospital[]; apiKey: string }) {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [hoveredHospital, setHoveredHospital] = useState<Hospital | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: 'google-map-script',
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setMapCenter({ lat: hospital.lat, lng: hospital.lng });
    if (map) {
      map.panTo({ lat: hospital.lat, lng: hospital.lng });
      map.setZoom(14);
    }
  };

  const statusCounts = {
    normal: hospitals.filter(h => h.status === 'normal').length,
    busy: hospitals.filter(h => h.status === 'busy').length,
    critical: hospitals.filter(h => h.status === 'critical').length,
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted/30 rounded-2xl">
        <p className="text-muted-foreground">Unable to load map</p>
      </div>
    );
  }

  return (
    <>
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <span className="text-sm text-foreground">Normal ({statusCounts.normal})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
          <span className="text-sm text-foreground">Busy ({statusCounts.busy})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50 animate-pulse" />
          <span className="text-sm text-foreground">Critical ({statusCounts.critical})</span>
        </div>
        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <motion.div 
        className="relative rounded-2xl overflow-hidden border border-border/50 shadow-lg"
        animate={{ height: isExpanded ? 600 : 400 }}
        transition={{ duration: 0.3 }}
      >
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={12}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              styles: [
                { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
                { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
                { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
                { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
                { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
                { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
                { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
                { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
                { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
                { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
                { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
                { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
                { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
                { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
                { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
                { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
                { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
                { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] },
              ],
              disableDefaultUI: false,
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
            }}
          >
            {hospitals.map((hospital) => (
              <MarkerF
                key={hospital.id}
                position={{ lat: hospital.lat, lng: hospital.lng }}
                icon={getMarkerIcon(hospital.status)}
                onClick={() => handleMarkerClick(hospital)}
                onMouseOver={() => setHoveredHospital(hospital)}
                onMouseOut={() => setHoveredHospital(null)}
              />
            ))}

            {hoveredHospital && !selectedHospital && (
              <InfoWindowF
                position={{ lat: hoveredHospital.lat, lng: hoveredHospital.lng }}
                onCloseClick={() => setHoveredHospital(null)}
              >
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm text-gray-900">{hoveredHospital.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      hoveredHospital.status === 'normal' ? 'bg-emerald-100 text-emerald-700' :
                      hoveredHospital.status === 'busy' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {hoveredHospital.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Bed className="w-3 h-3" />
                      <span>{hoveredHospital.available_beds} beds available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-3 h-3 text-amber-500" />
                      <span>{hoveredHospital.rating} ({hoveredHospital.reviewCount.toLocaleString()} reviews)</span>
                    </div>
                  </div>
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        ) : (
          <div className="flex items-center justify-center h-full bg-muted/30">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Selected Hospital Detail Panel */}
        <AnimatePresence>
          {selectedHospital && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="absolute top-4 right-4 w-80 bg-card/95 backdrop-blur-md rounded-2xl shadow-2xl border border-border/50 z-[1000] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium ${
                        selectedHospital.type === 'government' ? 'bg-blue-100 text-blue-700' :
                        selectedHospital.type === 'trust' ? 'bg-purple-100 text-purple-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {selectedHospital.type}
                      </span>
                      <StatusBadge status={selectedHospital.status} />
                    </div>
                    <h3 className="font-bold text-foreground">{selectedHospital.name}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedHospital(null)}
                    className="p-1 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex items-center gap-1 mt-2 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-semibold">{selectedHospital.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({selectedHospital.reviewCount.toLocaleString()} reviews)
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-foreground">{selectedHospital.available_beds}</div>
                    <div className="text-[10px] text-muted-foreground">Beds</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-foreground">{selectedHospital.doctors_available}</div>
                    <div className="text-[10px] text-muted-foreground">Doctors</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-foreground">{selectedHospital.icuBeds}</div>
                    <div className="text-[10px] text-muted-foreground">ICU</div>
                  </div>
                </div>

                {/* ER Wait Time */}
                <div className="flex items-center justify-between bg-muted/30 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">ER Wait Time</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {selectedHospital.specialties.find(s => s.name === 'Emergency')?.waitTime || '~'} min
                  </span>
                </div>

                {/* Address */}
                <div className="text-xs text-muted-foreground">
                  <Building2 className="w-3 h-3 inline mr-1" />
                  {selectedHospital.address}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <a
                    href={`tel:${selectedHospital.phone}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-muted rounded-xl text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedHospital.lat},${selectedHospital.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    Directions
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Hospital Quick Select */}
      <div className="mt-4">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Quick Select Hospital
        </h4>
        <div className="flex flex-wrap gap-2">
          {hospitals.map((hospital) => (
            <button
              key={hospital.id}
              onClick={() => handleMarkerClick(hospital)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                selectedHospital?.id === hospital.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/30 border-border/50 hover:border-primary/30 text-foreground'
              }`}
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                hospital.status === 'normal' ? 'bg-emerald-500' :
                hospital.status === 'busy' ? 'bg-amber-500' : 'bg-rose-500'
              }`} />
              {hospital.name.split(' ').slice(0, 2).join(' ')}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export function HospitalMap({ hospitals }: HospitalMapProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-maps-key');
        if (error) throw error;
        if (data?.apiKey) {
          setApiKey(data.apiKey);
        } else {
          setError('API key not found');
        }
      } catch (err) {
        console.error('Failed to fetch API key:', err);
        setError('Failed to load map');
      } finally {
        setLoading(false);
      }
    };
    fetchApiKey();
  }, []);

  if (loading) {
    return (
      <SectionCard
        id="map"
        title="Hospital Map View"
        subtitle="Interactive map showing all 15 Pune hospitals with real-time status indicators."
        icon={<MapIcon className="w-6 h-6 text-primary-foreground" />}
      >
        <div className="flex items-center justify-center h-[400px] bg-muted/30 rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </SectionCard>
    );
  }

  if (error || !apiKey) {
    return (
      <SectionCard
        id="map"
        title="Hospital Map View"
        subtitle="Interactive map showing all 15 Pune hospitals with real-time status indicators."
        icon={<MapIcon className="w-6 h-6 text-primary-foreground" />}
      >
        <div className="flex items-center justify-center h-[400px] bg-muted/30 rounded-2xl">
          <p className="text-muted-foreground">Unable to load map</p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      id="map"
      title="Hospital Map View"
      subtitle="Interactive map showing all 15 Pune hospitals with real-time status indicators."
      icon={<MapIcon className="w-6 h-6 text-primary-foreground" />}
    >
      <GoogleMapsContent hospitals={hospitals} apiKey={apiKey} />
    </SectionCard>
  );
}
