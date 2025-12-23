import { useState, useCallback, useRef } from 'react';
import { QueueEvent, Hospital } from '@/types/hospital';
import { SAMPLE_NAMES } from '@/data/hospitals';

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

  const pushEvent = useCallback(() => {
    const name = randomItem(SAMPLE_NAMES);
    const risk = randomRisk();
    const dept = risk === 'High' ? 'Emergency' : risk === 'Medium' ? 'General Medicine' : 'OPD';
    const hospital = pickHospitalForRisk(risk);
    const time = new Date().toLocaleTimeString('en-IN', { hour12: false });

    const newEvent: QueueEvent = {
      id: `${Date.now()}-${Math.random()}`,
      time,
      patientName: name,
      risk,
      department: dept,
      hospital,
    };

    setEvents(prev => [newEvent, ...prev.slice(0, 19)]);
  }, [pickHospitalForRisk]);

  const toggleSimulation = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setIsRunning(false);
    } else {
      setEvents([]);
      timerRef.current = setInterval(pushEvent, 2000);
      setIsRunning(true);
    }
  }, [pushEvent]);

  return { events, isRunning, toggleSimulation };
}
