// GPS Simulation Service for Demo Mode
// Simulates ambulance movement along routes for demonstrations

interface Position {
  lat: number;
  lng: number;
}

interface SimulationConfig {
  ambulanceId: string;
  origin: Position;
  destination: Position;
  speedKmh?: number;
  onPositionUpdate: (ambulanceId: string, position: Position, heading: number) => void;
  onArrival?: (ambulanceId: string) => void;
}

interface ActiveSimulation {
  intervalId: NodeJS.Timeout;
  currentPosition: Position;
  waypoints: Position[];
  currentWaypointIndex: number;
  config: SimulationConfig;
}

const activeSimulations = new Map<string, ActiveSimulation>();

// Haversine formula for distance calculation
function calculateDistance(pos1: Position, pos2: Position): number {
  const R = 6371; // Earth's radius in km
  const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
  const dLng = (pos2.lng - pos1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate bearing between two points
function calculateBearing(pos1: Position, pos2: Position): number {
  const dLng = (pos2.lng - pos1.lng) * Math.PI / 180;
  const lat1 = pos1.lat * Math.PI / 180;
  const lat2 = pos2.lat * Math.PI / 180;
  
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

// Generate waypoints between origin and destination
function generateWaypoints(origin: Position, destination: Position, numPoints: number = 20): Position[] {
  const waypoints: Position[] = [origin];
  
  for (let i = 1; i < numPoints; i++) {
    const t = i / numPoints;
    // Add some randomness to simulate real road paths
    const jitterLat = (Math.random() - 0.5) * 0.001;
    const jitterLng = (Math.random() - 0.5) * 0.001;
    
    waypoints.push({
      lat: origin.lat + (destination.lat - origin.lat) * t + jitterLat,
      lng: origin.lng + (destination.lng - origin.lng) * t + jitterLng
    });
  }
  
  waypoints.push(destination);
  return waypoints;
}

// Start GPS simulation for an ambulance
export function startGPSSimulation(config: SimulationConfig): string {
  const {
    ambulanceId,
    origin,
    destination,
    speedKmh = 60,
    onPositionUpdate,
    onArrival
  } = config;

  // Stop any existing simulation for this ambulance
  stopGPSSimulation(ambulanceId);

  const waypoints = generateWaypoints(origin, destination, 30);
  const totalDistance = calculateDistance(origin, destination);
  const estimatedTimeMinutes = (totalDistance / speedKmh) * 60;
  const updateIntervalMs = 2000; // Update every 2 seconds
  const waypointsPerUpdate = Math.max(1, Math.floor(waypoints.length / (estimatedTimeMinutes * 30)));

  let currentWaypointIndex = 0;

  const simulation: ActiveSimulation = {
    intervalId: setInterval(() => {
      const sim = activeSimulations.get(ambulanceId);
      if (!sim) return;

      currentWaypointIndex = Math.min(currentWaypointIndex + waypointsPerUpdate, waypoints.length - 1);
      const currentPosition = waypoints[currentWaypointIndex];
      const nextPosition = waypoints[Math.min(currentWaypointIndex + 1, waypoints.length - 1)];
      const heading = calculateBearing(currentPosition, nextPosition);

      onPositionUpdate(ambulanceId, currentPosition, heading);

      // Check if arrived
      if (currentWaypointIndex >= waypoints.length - 1) {
        stopGPSSimulation(ambulanceId);
        onArrival?.(ambulanceId);
      }
    }, updateIntervalMs),
    currentPosition: origin,
    waypoints,
    currentWaypointIndex: 0,
    config
  };

  activeSimulations.set(ambulanceId, simulation);

  // Emit initial position
  onPositionUpdate(ambulanceId, origin, calculateBearing(origin, waypoints[1]));

  return ambulanceId;
}

// Stop GPS simulation for an ambulance
export function stopGPSSimulation(ambulanceId: string): boolean {
  const simulation = activeSimulations.get(ambulanceId);
  if (simulation) {
    clearInterval(simulation.intervalId);
    activeSimulations.delete(ambulanceId);
    return true;
  }
  return false;
}

// Stop all active simulations
export function stopAllSimulations(): void {
  activeSimulations.forEach((_, ambulanceId) => {
    stopGPSSimulation(ambulanceId);
  });
}

// Get current position of a simulated ambulance
export function getSimulatedPosition(ambulanceId: string): Position | null {
  const simulation = activeSimulations.get(ambulanceId);
  if (simulation) {
    return simulation.waypoints[simulation.currentWaypointIndex];
  }
  return null;
}

// Check if an ambulance is being simulated
export function isSimulating(ambulanceId: string): boolean {
  return activeSimulations.has(ambulanceId);
}

// Get ETA for a simulated ambulance
export function getSimulatedETA(ambulanceId: string): number | null {
  const simulation = activeSimulations.get(ambulanceId);
  if (!simulation) return null;

  const remainingWaypoints = simulation.waypoints.length - simulation.currentWaypointIndex;
  const currentPos = simulation.waypoints[simulation.currentWaypointIndex];
  const destPos = simulation.waypoints[simulation.waypoints.length - 1];
  const remainingDistance = calculateDistance(currentPos, destPos);
  const speedKmh = simulation.config.speedKmh || 60;

  return Math.round((remainingDistance / speedKmh) * 60); // Return minutes
}

// Generate route coordinates for display on map
export function getRouteCoordinates(origin: Position, destination: Position): Position[] {
  return generateWaypoints(origin, destination, 50);
}
