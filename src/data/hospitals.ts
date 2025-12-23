import { Hospital } from '@/types/hospital';

export const initialHospitals: Hospital[] = [
  {
    id: '1',
    name: 'Ruby Hall Clinic',
    available_beds: 12,
    total_beds: 50,
    doctors_available: 8,
    status: 'normal',
    lat: 18.5362,
    lng: 73.8860,
    phone: '+91-20-26163391'
  },
  {
    id: '2',
    name: 'Jehangir Hospital',
    available_beds: 5,
    total_beds: 40,
    doctors_available: 6,
    status: 'busy',
    lat: 18.5196,
    lng: 73.8553,
    phone: '+91-20-66810000'
  },
  {
    id: '3',
    name: 'Sahyadri Hospital',
    available_beds: 2,
    total_beds: 35,
    doctors_available: 4,
    status: 'critical',
    lat: 18.5018,
    lng: 73.8636,
    phone: '+91-20-30603060'
  },
  {
    id: '4',
    name: 'KEM Hospital',
    available_beds: 18,
    total_beds: 60,
    doctors_available: 10,
    status: 'normal',
    lat: 18.4988,
    lng: 73.8251,
    phone: '+91-20-26126000'
  }
];

export const SAMPLE_NAMES = ['Rohan', 'Aditi', 'Kiran', 'Fatima', 'Sanjay', 'Meera', 'Arjun', 'Priya', 'Vikram', 'Neha'];
