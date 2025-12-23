import { useState, useCallback } from 'react';
import { Hospital } from '@/types/hospital';
import { initialHospitals } from '@/data/hospitals';

export function useHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>(initialHospitals);

  const updateHospital = useCallback((id: string, beds: number, doctors: number) => {
    setHospitals(prev => prev.map(h => {
      if (h.id === id) {
        let status: Hospital['status'] = 'normal';
        if (beds <= 5) status = 'busy';
        if (beds <= 2) status = 'critical';
        return { ...h, available_beds: beds, doctors_available: doctors, status };
      }
      return h;
    }));
  }, []);

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
    updateHospital,
    getHospitalStatus,
    computePressureScore,
    getTotalOccupancy,
  };
}
