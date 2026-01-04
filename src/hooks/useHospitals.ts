import { useState, useCallback, useEffect } from 'react';
import { Hospital } from '@/types/hospital';
import { supabase } from '@/integrations/supabase/client';

// Map database snake_case fields to TypeScript camelCase
function mapDatabaseToHospital(row: any): Hospital {
  return {
    id: row.id,
    name: row.name,
    available_beds: row.available_beds,
    total_beds: row.total_beds,
    doctors_available: row.doctors_available,
    status: row.status as 'normal' | 'busy' | 'critical',
    lat: row.lat,
    lng: row.lng,
    phone: row.phone,
    address: row.address,
    type: row.type as 'government' | 'private' | 'trust',
    accreditations: row.accreditations || [],
    rating: Number(row.rating) || 4.0,
    reviewCount: row.review_count || 0,
    specialties: row.specialties || [],
    insurance: row.insurance || [],
    emergencyAvailable: row.emergency_available ?? true,
    ambulanceCount: row.ambulance_count || 2,
    icuBeds: row.icu_beds || 0,
    nicuAvailable: row.nicu_available ?? false,
    established: row.established,
    website: row.website,
  };
}

export function useHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch hospitals from database
  useEffect(() => {
    async function fetchHospitals() {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('hospitals')
        .select('*')
        .order('name');

      if (fetchError) {
        console.error('Error fetching hospitals:', fetchError);
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      const mapped = (data || []).map(mapDatabaseToHospital);
      setHospitals(mapped);
      setLoading(false);
    }

    fetchHospitals();
  }, []);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('hospitals-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hospitals' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newHospital = mapDatabaseToHospital(payload.new);
            setHospitals(prev => [...prev, newHospital].sort((a, b) => a.name.localeCompare(b.name)));
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapDatabaseToHospital(payload.new);
            setHospitals(prev => prev.map(h => h.id === updated.id ? updated : h));
          } else if (payload.eventType === 'DELETE') {
            setHospitals(prev => prev.filter(h => h.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update hospital in database (for admin use)
  const updateHospital = useCallback(async (
    id: string, 
    beds: number, 
    doctors: number,
    userId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Get current hospital to record previous beds
    const currentHospital = hospitals.find(h => h.id === id);
    if (!currentHospital) {
      return { success: false, error: 'Hospital not found' };
    }

    const previousBeds = currentHospital.available_beds;
    
    // Compute new status
    let status: 'normal' | 'busy' | 'critical' = 'normal';
    if (beds <= 2) status = 'critical';
    else if (beds <= 5) status = 'busy';

    // Update hospital in database
    const { error: updateError } = await supabase
      .from('hospitals')
      .update({
        available_beds: beds,
        doctors_available: doctors,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating hospital:', updateError);
      return { success: false, error: updateError.message };
    }

    // Record bed update for audit trail
    const { error: auditError } = await supabase
      .from('bed_updates')
      .insert({
        hospital_id: id,
        previous_beds: previousBeds,
        new_beds: beds,
        updated_by: userId || null,
      });

    if (auditError) {
      console.error('Error recording bed update:', auditError);
      // Non-fatal, update still succeeded
    }

    return { success: true };
  }, [hospitals]);

  const getHospitalStatus = useCallback((beds: number): Hospital['status'] => {
    if (beds <= 2) return 'critical';
    if (beds <= 5) return 'busy';
    return 'normal';
  }, []);

  const computePressureScore = useCallback((hospital: Hospital): number => {
    const occ = 1 - hospital.available_beds / hospital.total_beds;
    const score = Math.round(100 * (0.7 * occ + 0.3 * (1 - hospital.available_beds / (hospital.total_beds + 1))));
    return Math.min(100, Math.max(0, score));
  }, []);

  const getTotalOccupancy = useCallback(() => {
    const totalBeds = hospitals.reduce((sum, h) => sum + h.total_beds, 0);
    const totalAvail = hospitals.reduce((sum, h) => sum + h.available_beds, 0);
    return totalBeds ? 1 - totalAvail / totalBeds : 0;
  }, [hospitals]);

  return {
    hospitals,
    loading,
    error,
    updateHospital,
    getHospitalStatus,
    computePressureScore,
    getTotalOccupancy,
  };
}
