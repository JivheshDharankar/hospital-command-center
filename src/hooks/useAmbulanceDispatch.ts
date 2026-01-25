import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

interface Ambulance {
  id: string;
  hospital_id: string;
  registration_number: string;
  status: 'available' | 'dispatched' | 'returning' | 'maintenance';
  current_lat: number | null;
  current_lng: number | null;
  last_update: string;
  crew_count: number;
  equipment: string[];
}

interface DispatchRequest {
  id: string;
  ambulance_id: string | null;
  origin_lat: number;
  origin_lng: number;
  origin_address: string | null;
  destination_hospital_id: string;
  patient_condition: string;
  priority: 'critical' | 'high' | 'normal';
  status: 'pending' | 'dispatched' | 'en-route' | 'arrived' | 'completed' | 'cancelled';
  requested_by: string | null;
  requested_at: string;
  dispatched_at: string | null;
  arrived_at: string | null;
  completed_at: string | null;
  eta_minutes: number | null;
  notes: string | null;
}

interface CreateDispatchRequest {
  origin_lat: number;
  origin_lng: number;
  origin_address?: string;
  destination_hospital_id: string;
  patient_condition: string;
  priority?: 'critical' | 'high' | 'normal';
  notes?: string;
}

interface UseAmbulanceDispatchReturn {
  ambulances: Ambulance[];
  dispatchRequests: DispatchRequest[];
  activeDispatches: DispatchRequest[];
  loading: boolean;
  error: string | null;
  createDispatchRequest: (request: CreateDispatchRequest) => Promise<DispatchRequest | null>;
  updateDispatchStatus: (requestId: string, status: DispatchRequest['status']) => Promise<void>;
  assignAmbulance: (requestId: string, ambulanceId: string) => Promise<void>;
  updateAmbulancePosition: (ambulanceId: string, lat: number, lng: number) => Promise<void>;
  calculateOptimalHospital: (lat: number, lng: number, condition: string) => Promise<string | null>;
}

const mapAmbulance = (row: Record<string, unknown>): Ambulance => ({
  id: row.id as string,
  hospital_id: row.hospital_id as string,
  registration_number: row.registration_number as string,
  status: row.status as Ambulance['status'],
  current_lat: row.current_lat as number | null,
  current_lng: row.current_lng as number | null,
  last_update: row.last_update as string,
  crew_count: row.crew_count as number,
  equipment: Array.isArray(row.equipment) ? row.equipment as string[] : []
});

const mapDispatchRequest = (row: Record<string, unknown>): DispatchRequest => ({
  id: row.id as string,
  ambulance_id: row.ambulance_id as string | null,
  origin_lat: row.origin_lat as number,
  origin_lng: row.origin_lng as number,
  origin_address: row.origin_address as string | null,
  destination_hospital_id: row.destination_hospital_id as string,
  patient_condition: row.patient_condition as string,
  priority: row.priority as DispatchRequest['priority'],
  status: row.status as DispatchRequest['status'],
  requested_by: row.requested_by as string | null,
  requested_at: row.requested_at as string,
  dispatched_at: row.dispatched_at as string | null,
  arrived_at: row.arrived_at as string | null,
  completed_at: row.completed_at as string | null,
  eta_minutes: row.eta_minutes as number | null,
  notes: row.notes as string | null
});

export function useAmbulanceDispatch(): UseAmbulanceDispatchReturn {
  const { user } = useAuthContext();
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [dispatchRequests, setDispatchRequests] = useState<DispatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAmbulances = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('ambulances')
      .select('*')
      .order('registration_number');

    if (fetchError) {
      console.error('Error fetching ambulances:', fetchError);
      return;
    }
    setAmbulances((data || []).map(row => mapAmbulance(row as Record<string, unknown>)));
  }, []);

  const fetchDispatchRequests = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('dispatch_requests')
      .select('*')
      .order('requested_at', { ascending: false })
      .limit(50);

    if (fetchError) {
      console.error('Error fetching dispatch requests:', fetchError);
      return;
    }
    setDispatchRequests((data || []).map(row => mapDispatchRequest(row as Record<string, unknown>)));
  }, []);

  useEffect(() => {
    Promise.all([fetchAmbulances(), fetchDispatchRequests()])
      .finally(() => setLoading(false));

    const ambulanceChannel = supabase
      .channel('ambulances_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ambulances' }, () => {
        fetchAmbulances();
      })
      .subscribe();

    const dispatchChannel = supabase
      .channel('dispatch_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dispatch_requests' }, () => {
        fetchDispatchRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ambulanceChannel);
      supabase.removeChannel(dispatchChannel);
    };
  }, [fetchAmbulances, fetchDispatchRequests]);

  const createDispatchRequest = useCallback(async (request: CreateDispatchRequest): Promise<DispatchRequest | null> => {
    if (!user) {
      setError('Must be logged in to create dispatch request');
      return null;
    }

    const { data, error: insertError } = await supabase
      .from('dispatch_requests')
      .insert([{ 
        origin_lat: request.origin_lat,
        origin_lng: request.origin_lng,
        origin_address: request.origin_address,
        destination_hospital_id: request.destination_hospital_id,
        patient_condition: request.patient_condition,
        priority: request.priority || 'normal',
        notes: request.notes,
        requested_by: user.id 
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating dispatch request:', insertError);
      setError(insertError.message);
      return null;
    }
    return mapDispatchRequest(data as Record<string, unknown>);
  }, [user]);

  const updateDispatchStatus = useCallback(async (requestId: string, status: DispatchRequest['status']) => {
    const updateData: Record<string, unknown> = { status };
    
    if (status === 'dispatched') updateData.dispatched_at = new Date().toISOString();
    if (status === 'arrived') updateData.arrived_at = new Date().toISOString();
    if (status === 'completed') updateData.completed_at = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('dispatch_requests')
      .update(updateData)
      .eq('id', requestId);

    if (updateError) {
      console.error('Error updating dispatch status:', updateError);
      setError(updateError.message);
    }
  }, []);

  const assignAmbulance = useCallback(async (requestId: string, ambulanceId: string) => {
    const { error: requestError } = await supabase
      .from('dispatch_requests')
      .update({ ambulance_id: ambulanceId, status: 'dispatched', dispatched_at: new Date().toISOString() })
      .eq('id', requestId);

    if (requestError) {
      console.error('Error assigning ambulance:', requestError);
      return;
    }

    await supabase
      .from('ambulances')
      .update({ status: 'dispatched' })
      .eq('id', ambulanceId);
  }, []);

  const updateAmbulancePosition = useCallback(async (ambulanceId: string, lat: number, lng: number) => {
    const { error: updateError } = await supabase
      .from('ambulances')
      .update({ current_lat: lat, current_lng: lng, last_update: new Date().toISOString() })
      .eq('id', ambulanceId);

    if (updateError) {
      console.error('Error updating ambulance position:', updateError);
    }
  }, []);

  const calculateOptimalHospital = useCallback(async (lat: number, lng: number, _condition: string): Promise<string | null> => {
    const { data: hospitals } = await supabase
      .from('hospitals')
      .select('id, lat, lng, status, available_beds, specialties')
      .neq('status', 'critical');

    if (!hospitals || hospitals.length === 0) return null;

    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const scored = hospitals.map(h => ({
      id: h.id,
      distance: calculateDistance(lat, lng, h.lat, h.lng),
      beds: h.available_beds,
      score: (1 / calculateDistance(lat, lng, h.lat, h.lng)) * (h.available_beds / 10)
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.id || null;
  }, []);

  const activeDispatches = dispatchRequests.filter(d => 
    ['pending', 'dispatched', 'en-route'].includes(d.status)
  );

  return {
    ambulances,
    dispatchRequests,
    activeDispatches,
    loading,
    error,
    createDispatchRequest,
    updateDispatchStatus,
    assignAmbulance,
    updateAmbulancePosition,
    calculateOptimalHospital
  };
}
