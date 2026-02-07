import { useEffect, useState, useRef } from 'react';
import { Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getRouteCoordinates } from '@/services/gpsSimulator';

interface Position {
  lat: number;
  lng: number;
}

interface AnimatedRouteProps {
  origin: Position;
  destination: Position;
  priority?: 'critical' | 'high' | 'normal';
  isActive?: boolean;
  showPulse?: boolean;
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f59e0b',
  normal: '#3b82f6'
};

export function AnimatedRoute({
  origin,
  destination,
  priority = 'normal',
  isActive = true,
  showPulse = true
}: AnimatedRouteProps) {
  const [dashOffset, setDashOffset] = useState(0);
  const animationRef = useRef<number>();
  const map = useMap();

  const routeCoordinates = getRouteCoordinates(origin, destination);
  const pathPositions: [number, number][] = routeCoordinates.map(p => [p.lat, p.lng]);

  const color = PRIORITY_COLORS[priority];

  // Animate dash offset for flowing effect
  useEffect(() => {
    if (!isActive) return;

    const animate = () => {
      setDashOffset(prev => (prev + 1) % 20);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <>
      {/* Background route line */}
      <Polyline
        positions={pathPositions}
        pathOptions={{
          color: color,
          weight: 4,
          opacity: 0.3,
          lineCap: 'round',
          lineJoin: 'round'
        }}
      />

      {/* Animated dashed line */}
      <Polyline
        positions={pathPositions}
        pathOptions={{
          color: color,
          weight: 3,
          opacity: 0.8,
          dashArray: '10, 10',
          dashOffset: String(dashOffset),
          lineCap: 'round',
          lineJoin: 'round'
        }}
      />

      {/* Origin pulse */}
      {showPulse && (
        <>
          <Circle
            center={[origin.lat, origin.lng]}
            radius={100}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: 0.3,
              weight: 2
            }}
          />
          <Circle
            center={[origin.lat, origin.lng]}
            radius={50}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: 0.6,
              weight: 0
            }}
          />
        </>
      )}

      {/* Destination pulse */}
      {showPulse && (
        <>
          <Circle
            center={[destination.lat, destination.lng]}
            radius={150}
            pathOptions={{
              color: '#10b981',
              fillColor: '#10b981',
              fillOpacity: 0.2,
              weight: 2
            }}
          />
          <Circle
            center={[destination.lat, destination.lng]}
            radius={80}
            pathOptions={{
              color: '#10b981',
              fillColor: '#10b981',
              fillOpacity: 0.4,
              weight: 0
            }}
          />
        </>
      )}
    </>
  );
}
