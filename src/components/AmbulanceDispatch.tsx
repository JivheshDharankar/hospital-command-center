import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Ambulance, MapPin, Phone, Clock, AlertTriangle,
  Navigation, CheckCircle, XCircle, Loader2, Plus,
  Building2
} from 'lucide-react';
import { useAmbulanceDispatch } from '@/hooks/useAmbulanceDispatch';
import { useHospitals } from '@/hooks/useHospitals';
import { SectionCard } from './SectionCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-emerald-500',
  dispatched: 'bg-amber-500',
  returning: 'bg-blue-500',
  maintenance: 'bg-gray-500'
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-destructive',
  high: 'bg-amber-500',
  normal: 'bg-blue-500'
};

// Custom ambulance icon
const createAmbulanceIcon = (status: string) => {
  const color = status === 'available' ? '#10b981' : status === 'dispatched' ? '#f59e0b' : '#6b7280';
  return L.divIcon({
    className: 'custom-ambulance-marker',
    html: `
      <div class="relative">
        <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg" style="background-color: ${color}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 10H6"/>
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14"/>
            <circle cx="17" cy="18" r="2"/>
            <circle cx="7" cy="18" r="2"/>
          </svg>
        </div>
        ${status === 'dispatched' ? '<div class="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping"></div>' : ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

export default function AmbulanceDispatch() {
  const { 
    ambulances, 
    activeDispatches, 
    loading, 
    createDispatchRequest,
    updateDispatchStatus,
    assignAmbulance,
    calculateOptimalHospital
  } = useAmbulanceDispatch();
  
  const { hospitals } = useHospitals();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newDispatch, setNewDispatch] = useState<{
    origin_lat: number;
    origin_lng: number;
    origin_address: string;
    destination_hospital_id: string;
    patient_condition: string;
    priority: 'critical' | 'high' | 'normal';
    notes: string;
  }>({
    origin_lat: 18.5204,
    origin_lng: 73.8567,
    origin_address: '',
    destination_hospital_id: '',
    patient_condition: '',
    priority: 'normal',
    notes: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  const mapCenter: [number, number] = [18.5204, 73.8567]; // Pune center

  const availableAmbulances = useMemo(() => 
    ambulances.filter(a => a.status === 'available'),
    [ambulances]
  );

  const handleCreateDispatch = async () => {
    if (!newDispatch.destination_hospital_id || !newDispatch.patient_condition) return;
    
    setIsCreating(true);
    const result = await createDispatchRequest({
      origin_lat: newDispatch.origin_lat,
      origin_lng: newDispatch.origin_lng,
      origin_address: newDispatch.origin_address,
      destination_hospital_id: newDispatch.destination_hospital_id,
      patient_condition: newDispatch.patient_condition,
      priority: newDispatch.priority,
      notes: newDispatch.notes
    });
    
    if (result) {
      setDialogOpen(false);
      setNewDispatch({
        origin_lat: 18.5204,
        origin_lng: 73.8567,
        origin_address: '',
        destination_hospital_id: '',
        patient_condition: '',
        priority: 'normal',
        notes: ''
      });
    }
    setIsCreating(false);
  };

  const handleAutoSelectHospital = async () => {
    const hospitalId = await calculateOptimalHospital(
      newDispatch.origin_lat, 
      newDispatch.origin_lng, 
      newDispatch.patient_condition
    );
    if (hospitalId) {
      setNewDispatch(prev => ({ ...prev, destination_hospital_id: hospitalId }));
    }
  };

  if (loading) {
    return (
      <SectionCard
        title="Ambulance Dispatch"
        subtitle="Loading fleet data..."
        icon={<Ambulance className="w-6 h-6" />}
      >
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Smart Ambulance Dispatch"
      subtitle="GPS-based routing with real-time fleet tracking"
      icon={<Ambulance className="w-6 h-6" />}
    >
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-premium p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-emerald-500">{availableAmbulances.length}</p>
          <p className="text-sm text-muted-foreground">Available</p>
        </div>
        <div className="glass-premium p-4 rounded-xl text-center">
          <p className="text-2xl font-bold text-amber-500">
            {ambulances.filter(a => a.status === 'dispatched').length}
          </p>
          <p className="text-sm text-muted-foreground">Dispatched</p>
        </div>
        <div className="glass-premium p-4 rounded-xl text-center">
          <p className="text-2xl font-bold">{activeDispatches.length}</p>
          <p className="text-sm text-muted-foreground">Active Requests</p>
        </div>
        <div className="glass-premium p-4 rounded-xl text-center">
          <p className="text-2xl font-bold">{ambulances.length}</p>
          <p className="text-sm text-muted-foreground">Total Fleet</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Map */}
        <div className="h-[400px] rounded-xl overflow-hidden border border-border">
          <MapContainer
            center={mapCenter}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            
            {/* Ambulance markers */}
            {ambulances.map(ambulance => (
              ambulance.current_lat && ambulance.current_lng && (
                <Marker
                  key={ambulance.id}
                  position={[ambulance.current_lat, ambulance.current_lng]}
                  icon={createAmbulanceIcon(ambulance.status)}
                >
                  <Popup>
                    <div className="p-2">
                      <p className="font-bold">{ambulance.registration_number}</p>
                      <Badge className={cn("mt-1", STATUS_COLORS[ambulance.status])}>
                        {ambulance.status}
                      </Badge>
                      <p className="text-sm mt-2">Crew: {ambulance.crew_count}</p>
                    </div>
                  </Popup>
                </Marker>
              )
            ))}

            {/* Hospital markers */}
            {hospitals.map(hospital => (
              <Circle
                key={hospital.id}
                center={[hospital.lat, hospital.lng]}
                radius={200}
                pathOptions={{
                  color: hospital.status === 'critical' ? '#ef4444' : 
                         hospital.status === 'busy' ? '#f59e0b' : '#10b981',
                  fillOpacity: 0.3
                }}
              />
            ))}
          </MapContainer>
        </div>

        {/* Dispatch Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Active Dispatches</h3>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  New Dispatch
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Emergency Dispatch</DialogTitle>
                  <DialogDescription>
                    Enter emergency details to dispatch an ambulance
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Latitude</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={newDispatch.origin_lat}
                        onChange={(e) => setNewDispatch(prev => ({ 
                          ...prev, 
                          origin_lat: parseFloat(e.target.value) 
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Longitude</Label>
                      <Input
                        type="number"
                        step="0.0001"
                        value={newDispatch.origin_lng}
                        onChange={(e) => setNewDispatch(prev => ({ 
                          ...prev, 
                          origin_lng: parseFloat(e.target.value) 
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Address (Optional)</Label>
                    <Input
                      placeholder="Enter pickup address"
                      value={newDispatch.origin_address}
                      onChange={(e) => setNewDispatch(prev => ({ 
                        ...prev, 
                        origin_address: e.target.value 
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Patient Condition</Label>
                    <Input
                      placeholder="e.g., Cardiac arrest, Trauma, etc."
                      value={newDispatch.patient_condition}
                      onChange={(e) => setNewDispatch(prev => ({ 
                        ...prev, 
                        patient_condition: e.target.value 
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={newDispatch.priority}
                      onValueChange={(value: 'critical' | 'high' | 'normal') => 
                        setNewDispatch(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Destination Hospital</Label>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleAutoSelectHospital}
                      >
                        <Navigation className="w-3 h-3 mr-1" />
                        Auto-select
                      </Button>
                    </div>
                    <Select
                      value={newDispatch.destination_hospital_id}
                      onValueChange={(value) => 
                        setNewDispatch(prev => ({ ...prev, destination_hospital_id: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select hospital" />
                      </SelectTrigger>
                      <SelectContent>
                        {hospitals.map(hospital => (
                          <SelectItem key={hospital.id} value={hospital.id}>
                            <span className="flex items-center gap-2">
                              <span className={cn(
                                "w-2 h-2 rounded-full",
                                hospital.status === 'critical' ? 'bg-destructive' :
                                hospital.status === 'busy' ? 'bg-amber-500' : 'bg-emerald-500'
                              )} />
                              {hospital.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      placeholder="Additional information..."
                      value={newDispatch.notes}
                      onChange={(e) => setNewDispatch(prev => ({ 
                        ...prev, 
                        notes: e.target.value 
                      }))}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateDispatch}
                    disabled={!newDispatch.destination_hospital_id || !newDispatch.patient_condition || isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Ambulance className="w-4 h-4 mr-2" />
                        Dispatch
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <ScrollArea className="h-[320px]">
            <div className="space-y-3 pr-4">
              <AnimatePresence>
                {activeDispatches.map((dispatch, index) => {
                  const hospital = hospitals.find(h => h.id === dispatch.destination_hospital_id);
                  const ambulance = ambulances.find(a => a.id === dispatch.ambulance_id);
                  
                  return (
                    <motion.div
                      key={dispatch.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass-premium p-4 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={PRIORITY_COLORS[dispatch.priority]}>
                          {dispatch.priority}
                        </Badge>
                        <Badge variant="outline">{dispatch.status}</Badge>
                      </div>
                      
                      <p className="font-medium">{dispatch.patient_condition}</p>
                      
                      {hospital && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Building2 className="w-3 h-3" />
                          {hospital.name}
                        </p>
                      )}
                      
                      {ambulance && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Ambulance className="w-3 h-3" />
                          {ambulance.registration_number}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-3">
                        {dispatch.status === 'pending' && availableAmbulances.length > 0 && (
                          <Select
                            onValueChange={(ambulanceId) => assignAmbulance(dispatch.id, ambulanceId)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Assign ambulance" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableAmbulances.map(amb => (
                                <SelectItem key={amb.id} value={amb.id}>
                                  {amb.registration_number}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        
                        {dispatch.status === 'dispatched' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateDispatchStatus(dispatch.id, 'arrived')}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Arrived
                          </Button>
                        )}
                        
                        {dispatch.status === 'arrived' && (
                          <Button 
                            size="sm"
                            onClick={() => updateDispatchStatus(dispatch.id, 'completed')}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Complete
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {activeDispatches.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Ambulance className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active dispatches</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </SectionCard>
  );
}
