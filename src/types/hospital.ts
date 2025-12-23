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
