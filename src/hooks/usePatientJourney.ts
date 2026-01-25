import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface Patient {
  id: string;
  mrn: string;
  name: string;
  date_of_birth: string | null;
  phone: string | null;
  emergency_contact: string | null;
  blood_type: string | null;
  allergies: string[];
}

interface JourneyEvent {
  id: string;
  journey_id: string;
  event_type: 'triage' | 'admission' | 'transfer' | 'procedure' | 'medication' | 'test' | 'consultation' | 'discharge';
  event_time: string;
  department: string | null;
  details: Record<string, unknown>;
  staff_id: string | null;
}

interface PatientJourney {
  id: string;
  patient_id: string;
  hospital_id: string;
  admission_type: 'emergency' | 'scheduled' | 'transfer';
  status: 'admitted' | 'in-treatment' | 'discharged' | 'transferred';
  department: string;
  bed_id: string | null;
  attending_doctor: string | null;
  admitted_at: string;
  discharged_at: string | null;
  notes: string | null;
  patient?: Patient;
  events?: JourneyEvent[];
}

interface CreatePatient {
  mrn: string;
  name: string;
  date_of_birth?: string;
  phone?: string;
  emergency_contact?: string;
  blood_type?: string;
  allergies?: string[];
}

interface CreateJourney {
  patient_id: string;
  hospital_id: string;
  admission_type: 'emergency' | 'scheduled' | 'transfer';
  department: string;
  bed_id?: string;
  attending_doctor?: string;
  notes?: string;
}

interface CreateJourneyEvent {
  journey_id: string;
  event_type: JourneyEvent['event_type'];
  department?: string;
  details?: Record<string, unknown>;
  staff_id?: string;
}

interface UsePatientJourneyReturn {
  journeys: PatientJourney[];
  activeJourneys: PatientJourney[];
  loading: boolean;
  error: string | null;
  searchPatients: (query: string) => Promise<Patient[]>;
  getJourneyWithEvents: (journeyId: string) => Promise<PatientJourney | null>;
  createPatient: (patient: CreatePatient) => Promise<Patient | null>;
  createJourney: (journey: CreateJourney) => Promise<PatientJourney | null>;
  addJourneyEvent: (event: CreateJourneyEvent) => Promise<JourneyEvent | null>;
  updateJourneyStatus: (journeyId: string, status: PatientJourney['status']) => Promise<void>;
}

const mapPatient = (row: Record<string, unknown>): Patient => ({
  id: row.id as string,
  mrn: row.mrn as string,
  name: row.name as string,
  date_of_birth: row.date_of_birth as string | null,
  phone: row.phone as string | null,
  emergency_contact: row.emergency_contact as string | null,
  blood_type: row.blood_type as string | null,
  allergies: Array.isArray(row.allergies) ? row.allergies as string[] : []
});

const mapJourney = (row: Record<string, unknown>): PatientJourney => ({
  id: row.id as string,
  patient_id: row.patient_id as string,
  hospital_id: row.hospital_id as string,
  admission_type: row.admission_type as PatientJourney['admission_type'],
  status: row.status as PatientJourney['status'],
  department: row.department as string,
  bed_id: row.bed_id as string | null,
  attending_doctor: row.attending_doctor as string | null,
  admitted_at: row.admitted_at as string,
  discharged_at: row.discharged_at as string | null,
  notes: row.notes as string | null
});

const mapJourneyEvent = (row: Record<string, unknown>): JourneyEvent => ({
  id: row.id as string,
  journey_id: row.journey_id as string,
  event_type: row.event_type as JourneyEvent['event_type'],
  event_time: row.event_time as string,
  department: row.department as string | null,
  details: (row.details as Record<string, unknown>) || {},
  staff_id: row.staff_id as string | null
});

export function usePatientJourney(): UsePatientJourneyReturn {
  const [journeys, setJourneys] = useState<PatientJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJourneys = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('patient_journeys')
        .select('*')
        .order('admitted_at', { ascending: false })
        .limit(100);

      if (fetchError) throw fetchError;
      setJourneys((data || []).map(row => mapJourney(row as Record<string, unknown>)));
    } catch (err) {
      console.error('Error fetching journeys:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch journeys');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJourneys();

    const channel = supabase
      .channel('patient_journeys_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patient_journeys' }, () => {
        fetchJourneys();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchJourneys]);

  const searchPatients = useCallback(async (query: string): Promise<Patient[]> => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .or(`name.ilike.%${query}%,mrn.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error('Error searching patients:', error);
      return [];
    }
    return (data || []).map(row => mapPatient(row as Record<string, unknown>));
  }, []);

  const getJourneyWithEvents = useCallback(async (journeyId: string): Promise<PatientJourney | null> => {
    const { data: journey, error: journeyError } = await supabase
      .from('patient_journeys')
      .select('*')
      .eq('id', journeyId)
      .single();

    if (journeyError || !journey) return null;

    const { data: events } = await supabase
      .from('journey_events')
      .select('*')
      .eq('journey_id', journeyId)
      .order('event_time', { ascending: true });

    const { data: patient } = await supabase
      .from('patients')
      .select('*')
      .eq('id', journey.patient_id)
      .single();

    return {
      ...mapJourney(journey as Record<string, unknown>),
      patient: patient ? mapPatient(patient as Record<string, unknown>) : undefined,
      events: (events || []).map(e => mapJourneyEvent(e as Record<string, unknown>))
    };
  }, []);

  const createPatient = useCallback(async (patient: CreatePatient): Promise<Patient | null> => {
    const { data, error } = await supabase
      .from('patients')
      .insert([{
        mrn: patient.mrn,
        name: patient.name,
        date_of_birth: patient.date_of_birth,
        phone: patient.phone,
        emergency_contact: patient.emergency_contact,
        blood_type: patient.blood_type,
        allergies: patient.allergies as unknown as Json
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating patient:', error);
      return null;
    }
    return mapPatient(data as Record<string, unknown>);
  }, []);

  const createJourney = useCallback(async (journey: CreateJourney): Promise<PatientJourney | null> => {
    const { data, error } = await supabase
      .from('patient_journeys')
      .insert([{
        patient_id: journey.patient_id,
        hospital_id: journey.hospital_id,
        admission_type: journey.admission_type,
        department: journey.department,
        bed_id: journey.bed_id,
        attending_doctor: journey.attending_doctor,
        notes: journey.notes
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating journey:', error);
      return null;
    }
    return mapJourney(data as Record<string, unknown>);
  }, []);

  const addJourneyEvent = useCallback(async (event: CreateJourneyEvent): Promise<JourneyEvent | null> => {
    const { data, error } = await supabase
      .from('journey_events')
      .insert([{
        journey_id: event.journey_id,
        event_type: event.event_type,
        department: event.department,
        details: (event.details || {}) as unknown as Json,
        staff_id: event.staff_id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding journey event:', error);
      return null;
    }
    return mapJourneyEvent(data as Record<string, unknown>);
  }, []);

  const updateJourneyStatus = useCallback(async (journeyId: string, status: PatientJourney['status']) => {
    const updateData: Record<string, unknown> = { status };
    if (status === 'discharged') {
      updateData.discharged_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('patient_journeys')
      .update(updateData)
      .eq('id', journeyId);

    if (error) {
      console.error('Error updating journey status:', error);
    }
  }, []);

  const activeJourneys = journeys.filter(j => j.status !== 'discharged' && j.status !== 'transferred');

  return {
    journeys,
    activeJourneys,
    loading,
    error,
    searchPatients,
    getJourneyWithEvents,
    createPatient,
    createJourney,
    addJourneyEvent,
    updateJourneyStatus
  };
}
