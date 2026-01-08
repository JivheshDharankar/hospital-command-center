import { useState, useCallback, useRef, useEffect } from 'react';
import { QueueEvent, Hospital } from '@/types/hospital';
import { SAMPLE_NAMES } from '@/data/hospitals';
import { supabase } from '@/integrations/supabase/client';

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomRisk(): 'High' | 'Medium' | 'Low' {
  const r = Math.random();
  if (r < 0.15) return 'High';
  if (r < 0.5) return 'Medium';
  return 'Low';
}

export function useQueueSimulation(hospitals: Hospital[]) {
  const [events, setEvents] = useState<QueueEvent[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial events and subscribe to realtime
  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('queue_events')
        .select('*')
        .order('event_time', { ascending: false })
        .limit(20);

      if (data) {
        setEvents(data.map(row => ({
          id: row.id,
          time: new Date(row.event_time).toLocaleTimeString('en-IN', { hour12: false }),
          patientName: row.patient_name,
          risk: row.risk as 'High' | 'Medium' | 'Low',
          department: row.department,
          hospital: row.hospital_name,
        })));
      }
    };

    fetchEvents();

    // Subscribe to realtime inserts
    const channel = supabase
      .channel('queue-events-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'queue_events',
        },
        (payload) => {
          const row = payload.new as any;
          const newEvent: QueueEvent = {
            id: row.id,
            time: new Date(row.event_time).toLocaleTimeString('en-IN', { hour12: false }),
            patientName: row.patient_name,
            risk: row.risk as 'High' | 'Medium' | 'Low',
            department: row.department,
            hospital: row.hospital_name,
          };
          setEvents(prev => [newEvent, ...prev.slice(0, 19)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const pickHospitalForRisk = useCallback((risk: 'High' | 'Medium' | 'Low') => {
    if (!hospitals.length) return 'No hospital';
    let chosen: Hospital;
    if (risk === 'High') {
      chosen = hospitals.reduce((a, b) => a.available_beds < b.available_beds ? a : b);
    } else {
      chosen = hospitals.reduce((a, b) => a.available_beds > b.available_beds ? a : b);
    }
    return chosen.name;
  }, [hospitals]);

  const pushEvent = useCallback(async () => {
    const name = randomItem(SAMPLE_NAMES);
    const risk = randomRisk();
    const dept = risk === 'High' ? 'Emergency' : risk === 'Medium' ? 'General Medicine' : 'OPD';
    const hospital = pickHospitalForRisk(risk);

    // Insert to database - realtime subscription will update UI
    await supabase.from('queue_events').insert({
      patient_name: name,
      risk,
      department: dept,
      hospital_name: hospital,
    });
  }, [pickHospitalForRisk]);

  const toggleSimulation = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setIsRunning(false);
    } else {
      timerRef.current = setInterval(pushEvent, 2000);
      setIsRunning(true);
    }
  }, [pushEvent]);

  return { events, isRunning, toggleSimulation };
}
