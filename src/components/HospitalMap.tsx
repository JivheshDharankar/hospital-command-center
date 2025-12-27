import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, ScaleControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Hospital } from '@/types/hospital';
import { SectionCard } from './SectionCard';
import { StatusBadge } from './StatusBadge';
import { 
  MapIcon, Star, Bed, Phone, Clock, Navigation, 
  X, Maximize2, Minimize2, Building2, Users, Search,
  Filter, Locate, Layers, AlertCircle, CheckCircle, AlertTriangle
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface HospitalMapProps {
  hospitals: Hospital[];
}

const defaultCenter: [number, number] = [18.5204, 73.8567];

// Custom marker icons with pulse animation
const createMarkerIcon = (status: Hospital['status'], isSelected: boolean = false) => {
  const colors = {
    normal: { bg: '#10b981', glow: '#10b98150' },
    busy: { bg: '#f59e0b', glow: '#f59e0b50' }, 
    critical: { bg: '#ef4444', glow: '#ef444450' },
  };
  
  const { bg, glow } = colors[status];
  const size = isSelected ? 44 : 36;
  const pulseAnimation = status === 'critical' ? `
    <style>
      @keyframes pulse-marker {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.3); opacity: 0.5; }
      }
      .pulse-ring { animation: pulse-marker 1.5s ease-in-out infinite; }
    </style>
    <div class="pulse-ring" style="
      position: absolute;
      width: ${size + 16}px;
      height: ${size + 16}px;
      background: ${glow};
      border-radius: 50%;
      top: -8px;
      left: -8px;
    "></div>
  ` : '';
  
  return L.divIcon({
    className: 'custom-marker-container',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        ${pulseAnimation}
        <div style="
          position: relative;
          width: ${size}px;
          height: ${size}px;
          background: linear-gradient(135deg, ${bg}, ${bg}dd);
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 6px 20px ${glow}, 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        ">
          <div style="
            width: ${size / 3}px;
            height: ${size / 3}px;
            background: white;
            border-radius: 50%;
            transform: rotate(45deg);
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
          "></div>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

// Map controller for smooth animations
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo(center, zoom, { 
      duration: 1.2,
      easeLinearity: 0.25
    });
  }, [center, zoom, map]);
  
  return null;
}

// Locate user component
function LocateControl({ onLocate }: { onLocate: (pos: [number, number]) => void }) {
  const map = useMap();
  
  const handleLocate = () => {
    map.locate({ setView: false, maxZoom: 14 });
    map.on('locationfound', (e) => {
      onLocate([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, 14);
    });
  };
  
  return (
    <Button
      size="icon"
      variant="secondary"
      className="absolute bottom-24 right-3 z-[1000] shadow-lg"
      onClick={handleLocate}
    >
      <Locate className="w-4 h-4" />
    </Button>
  );
}

export function HospitalMap({ hospitals }: HospitalMapProps) {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [mapZoom, setMapZoom] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Hospital['status'] | 'all'>('all');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapStyle, setMapStyle] = useState<'dark' | 'light' | 'satellite'>('dark');

  // Filter hospitals
  const filteredHospitals = useMemo(() => {
    return hospitals.filter(h => {
      const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           h.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || h.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [hospitals, searchQuery, statusFilter]);

  const handleMarkerClick = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setMapCenter([hospital.lat, hospital.lng]);
    setMapZoom(15);
  };

  const statusCounts = {
    normal: hospitals.filter(h => h.status === 'normal').length,
    busy: hospitals.filter(h => h.status === 'busy').length,
    critical: hospitals.filter(h => h.status === 'critical').length,
  };

  // Tile layer URLs
  const tileUrls = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  };

  return (
    <SectionCard
      id="map"
      title="Hospital Map View"
      subtitle="Interactive map showing all Pune hospitals with real-time status indicators."
      icon={<MapIcon className="w-6 h-6 text-primary-foreground" />}
    >
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search hospitals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/30 border-border/50"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
            className="text-xs"
          >
            All ({hospitals.length})
          </Button>
          <Button
            variant={statusFilter === 'normal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('normal')}
            className="text-xs gap-1"
          >
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            Normal ({statusCounts.normal})
          </Button>
          <Button
            variant={statusFilter === 'busy' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('busy')}
            className="text-xs gap-1"
          >
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            Busy ({statusCounts.busy})
          </Button>
          <Button
            variant={statusFilter === 'critical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('critical')}
            className="text-xs gap-1"
          >
            <AlertCircle className="w-3 h-3 text-rose-500" />
            Critical ({statusCounts.critical})
          </Button>
        </div>

        {/* Map Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMapStyle(s => s === 'dark' ? 'light' : s === 'light' ? 'satellite' : 'dark')}
            className="gap-2"
          >
            <Layers className="w-4 h-4" />
            {mapStyle.charAt(0).toUpperCase() + mapStyle.slice(1)}
          </Button>
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

      {/* Results count */}
      {(searchQuery || statusFilter !== 'all') && (
        <div className="mb-3 flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {filteredHospitals.length} hospital{filteredHospitals.length !== 1 ? 's' : ''} found
          </Badge>
          {searchQuery && (
            <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')} className="h-6 text-xs">
              Clear search
            </Button>
          )}
        </div>
      )}

      {/* Map Container */}
      <motion.div 
        className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl"
        animate={{ height: isExpanded ? 700 : 500 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        <MapContainer
          center={defaultCenter}
          zoom={12}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          scrollWheelZoom={true}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url={tileUrls[mapStyle]}
          />
          
          <ZoomControl position="bottomright" />
          <ScaleControl position="bottomleft" imperial={false} />
          <MapController center={mapCenter} zoom={mapZoom} />
          <LocateControl onLocate={setUserLocation} />
          
          {/* User location marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={L.divIcon({
                className: 'user-location-marker',
                html: `
                  <div style="
                    width: 20px;
                    height: 20px;
                    background: #3b82f6;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 0 20px #3b82f680;
                  "></div>
                `,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              })}
            />
          )}
          
          {/* Hospital markers */}
          {filteredHospitals.map((hospital) => (
            <Marker
              key={hospital.id}
              position={[hospital.lat, hospital.lng]}
              icon={createMarkerIcon(hospital.status, selectedHospital?.id === hospital.id)}
              eventHandlers={{
                click: () => handleMarkerClick(hospital),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-2 min-w-[240px] bg-card text-foreground">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-bold text-sm">{hospital.name}</h3>
                    <StatusBadge status={hospital.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-2 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold">{hospital.available_beds}</div>
                      <div className="text-[10px] text-muted-foreground">Beds</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold">{hospital.doctors_available}</div>
                      <div className="text-[10px] text-muted-foreground">Doctors</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded-lg">
                      <div className="text-lg font-bold">{hospital.icuBeds}</div>
                      <div className="text-[10px] text-muted-foreground">ICU</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs mb-2">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="font-semibold">{hospital.rating}</span>
                    <span className="text-muted-foreground">({hospital.reviewCount.toLocaleString()} reviews)</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => handleMarkerClick(hospital)}
                  >
                    View Details
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Selected Hospital Detail Panel */}
        <AnimatePresence>
          {selectedHospital && (
            <motion.div
              initial={{ opacity: 0, x: 350, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 350, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute top-4 right-4 w-80 bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 z-[1000] overflow-hidden"
            >
              {/* Header with gradient */}
              <div className={`p-4 ${
                selectedHospital.status === 'normal' ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5' :
                selectedHospital.status === 'busy' ? 'bg-gradient-to-br from-amber-500/20 to-amber-500/5' :
                'bg-gradient-to-br from-rose-500/20 to-rose-500/5'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {selectedHospital.type}
                      </Badge>
                      <StatusBadge status={selectedHospital.status} />
                    </div>
                    <h3 className="font-bold text-foreground text-lg leading-tight">{selectedHospital.name}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedHospital(null)}
                    className="p-2 hover:bg-muted rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < Math.floor(selectedHospital.rating) ? 'text-amber-500 fill-current' : 'text-muted-foreground/30'}`} 
                    />
                  ))}
                  <span className="text-sm font-semibold ml-1">{selectedHospital.rating}</span>
                  <span className="text-xs text-muted-foreground">
                    ({selectedHospital.reviewCount.toLocaleString()})
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: selectedHospital.available_beds, label: 'Beds', color: 'text-emerald-500' },
                    { value: selectedHospital.doctors_available, label: 'Doctors', color: 'text-blue-500' },
                    { value: selectedHospital.icuBeds, label: 'ICU', color: 'text-purple-500' },
                    { value: selectedHospital.ambulanceCount, label: 'Amb.', color: 'text-rose-500' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-muted/50 rounded-xl p-2 text-center">
                      <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* ER Wait Time */}
                <div className="flex items-center justify-between bg-muted/30 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">ER Wait Time</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">
                      {selectedHospital.specialties.find(s => s.name === 'Emergency')?.waitTime || '~'}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">min</span>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Building2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{selectedHospital.address}</span>
                </div>

                {/* Specialties */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Key Specialties
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedHospital.specialties.slice(0, 5).map((spec, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">
                        {spec.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <a
                    href={`tel:${selectedHospital.phone}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-muted rounded-xl text-sm font-medium text-foreground hover:bg-muted/80 transition-all hover:scale-[1.02]"
                  >
                    <Phone className="w-4 h-4" />
                    Call Now
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedHospital.lat},${selectedHospital.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all hover:scale-[1.02]"
                  >
                    <Navigation className="w-4 h-4" />
                    Directions
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map Legend (bottom left) */}
        <div className="absolute bottom-16 left-3 bg-card/90 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-border/50 z-[1000]">
          <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Status</h4>
          <div className="space-y-1.5">
            {[
              { status: 'normal', label: 'Normal', color: 'bg-emerald-500' },
              { status: 'busy', label: 'Busy', color: 'bg-amber-500' },
              { status: 'critical', label: 'Critical', color: 'bg-rose-500 animate-pulse' },
            ].map(({ status, label, color }) => (
              <div key={status} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-xs text-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Hospital Quick Select */}
      <div className="mt-4">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Quick Select Hospital
        </h4>
        <div className="flex flex-wrap gap-2">
          {filteredHospitals.map((hospital) => (
            <motion.button
              key={hospital.id}
              onClick={() => handleMarkerClick(hospital)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`text-xs px-3 py-2 rounded-full border transition-all ${
                selectedHospital?.id === hospital.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                  : 'bg-muted/30 border-border/50 hover:border-primary/50 text-foreground hover:shadow-md'
              }`}
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                hospital.status === 'normal' ? 'bg-emerald-500' :
                hospital.status === 'busy' ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'
              }`} />
              {hospital.name.split(' ').slice(0, 2).join(' ')}
            </motion.button>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
