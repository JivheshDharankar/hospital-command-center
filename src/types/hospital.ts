export interface Specialty {
  name: string;
  available: boolean;
  waitTime?: number; // minutes
  queue?: number;
}

export interface Insurance {
  name: string;
  cashless: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  available_beds: number;
  total_beds: number;
  doctors_available: number;
  status: 'normal' | 'busy' | 'critical';
  lat: number;
  lng: number;
  phone: string;
  address: string;
  type: 'government' | 'private' | 'trust';
  accreditations: string[];
  rating: number;
  reviewCount: number;
  specialties: Specialty[];
  insurance: Insurance[];
  emergencyAvailable: boolean;
  ambulanceCount: number;
  icuBeds: number;
  nicuAvailable: boolean;
  established: number;
  website?: string;
}

export interface QueueEvent {
  id: string;
  time: string;
  patientName: string;
  risk: 'High' | 'Medium' | 'Low';
  department: string;
  hospital: string;
}

export interface TriageResult {
  risk: 'High' | 'Medium' | 'Low';
  department: string;
  message: string;
  keywords: string[];
}
