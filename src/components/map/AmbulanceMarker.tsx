import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AmbulanceMarkerProps {
  id: string;
  registrationNumber: string;
  status: 'available' | 'dispatched' | 'returning' | 'maintenance';
  position: { lat: number; lng: number };
  heading?: number;
  crewCount: number;
  equipment: string[];
  lastUpdate: string;
  etaMinutes?: number;
  patientCondition?: string;
  destinationHospital?: string;
}

const STATUS_COLORS: Record<string, { bg: string; pulse: boolean }> = {
  available: { bg: '#10b981', pulse: false },
  dispatched: { bg: '#f59e0b', pulse: true },
  returning: { bg: '#3b82f6', pulse: false },
  maintenance: { bg: '#6b7280', pulse: false }
};

export function AmbulanceMarker({
  id,
  registrationNumber,
  status,
  position,
  heading = 0,
  crewCount,
  equipment,
  lastUpdate,
  etaMinutes,
  patientCondition,
  destinationHospital
}: AmbulanceMarkerProps) {
  const icon = useMemo(() => {
    const { bg, pulse } = STATUS_COLORS[status] || STATUS_COLORS.available;
    
    return L.divIcon({
      className: 'custom-ambulance-marker-animated',
      html: `
        <div class="relative" style="transform: rotate(${heading}deg)">
          <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform" style="background-color: ${bg}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 10H6"/>
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
              <path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14"/>
              <circle cx="17" cy="18" r="2"/>
              <circle cx="7" cy="18" r="2"/>
            </svg>
          </div>
          ${pulse ? `
            <div class="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-ping" style="background-color: ${bg}; opacity: 0.75"></div>
            <div class="absolute -top-1 -right-1 w-4 h-4 rounded-full" style="background-color: ${bg}"></div>
          ` : ''}
          ${etaMinutes !== undefined ? `
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold px-2 py-0.5 rounded-full bg-background border border-border shadow-sm">
              ${etaMinutes} min
            </div>
          ` : ''}
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -25]
    });
  }, [status, heading, etaMinutes]);

  const statusBadgeClass = cn(
    "text-white text-xs",
    status === 'available' && 'bg-emerald-500',
    status === 'dispatched' && 'bg-amber-500',
    status === 'returning' && 'bg-blue-500',
    status === 'maintenance' && 'bg-gray-500'
  );

  return (
    <Marker position={[position.lat, position.lng]} icon={icon}>
      <Popup>
        <div className="p-2 min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm">{registrationNumber}</span>
            <Badge className={statusBadgeClass}>
              {status}
            </Badge>
          </div>
          
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>Crew: {crewCount} members</p>
            <p>Equipment: {equipment.slice(0, 3).join(', ')}{equipment.length > 3 ? '...' : ''}</p>
            <p>Updated: {formatDistanceToNow(new Date(lastUpdate), { addSuffix: true })}</p>
          </div>

          {status === 'dispatched' && (
            <div className="mt-3 pt-2 border-t border-border space-y-1">
              {patientCondition && (
                <p className="text-xs">
                  <span className="text-muted-foreground">Condition:</span>{' '}
                  <span className="font-medium">{patientCondition}</span>
                </p>
              )}
              {destinationHospital && (
                <p className="text-xs">
                  <span className="text-muted-foreground">Destination:</span>{' '}
                  <span className="font-medium">{destinationHospital}</span>
                </p>
              )}
              {etaMinutes !== undefined && (
                <p className="text-xs font-bold text-amber-600">
                  ETA: {etaMinutes} minutes
                </p>
              )}
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
