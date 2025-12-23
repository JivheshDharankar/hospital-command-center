import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionCard } from './SectionCard';
import { Hospital } from '@/types/hospital';
import { Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminPanelProps {
  hospitals: Hospital[];
  onUpdate: (id: string, beds: number, doctors: number) => void;
}

export function AdminPanel({ hospitals, onUpdate }: AdminPanelProps) {
  const [hospitalId, setHospitalId] = useState('');
  const [beds, setBeds] = useState('');
  const [doctors, setDoctors] = useState('');
  const [status, setStatus] = useState<{ message: string; success: boolean } | null>(null);
  const { toast } = useToast();

  const handleUpdate = () => {
    const bedsNum = parseInt(beds, 10);
    const docsNum = parseInt(doctors, 10);

    if (!hospitalId || isNaN(bedsNum) || isNaN(docsNum)) {
      setStatus({ message: 'Please enter a valid hospital ID, beds, and doctors.', success: false });
      return;
    }

    const hospital = hospitals.find(h => h.id === hospitalId);
    if (!hospital) {
      setStatus({ message: 'Hospital ID not found in dataset.', success: false });
      return;
    }

    onUpdate(hospitalId, bedsNum, docsNum);
    setStatus({ message: `Updated ${hospital.name} (beds: ${bedsNum}, doctors: ${docsNum}).`, success: true });
    
    toast({
      title: 'Hospital Updated',
      description: `${hospital.name} has been updated successfully.`,
    });

    setHospitalId('');
    setBeds('');
    setDoctors('');
  };

  return (
    <SectionCard
      id="admin"
      title="Admin Panel (Demo)"
      subtitle="Update live bed and doctor counts for each hospital in the demo dataset."
      className="rounded-[2rem]"
    >
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <Input
          placeholder="Hospital ID (1-4)"
          value={hospitalId}
          onChange={(e) => setHospitalId(e.target.value)}
          className="rounded-full"
        />
        <Input
          placeholder="Available beds"
          type="number"
          value={beds}
          onChange={(e) => setBeds(e.target.value)}
          className="rounded-full"
        />
        <Input
          placeholder="Doctors on duty"
          type="number"
          value={doctors}
          onChange={(e) => setDoctors(e.target.value)}
          className="rounded-full"
        />
        <Button onClick={handleUpdate} className="md:px-8">
          <Settings className="w-4 h-4 mr-2" />
          Update
        </Button>
      </div>

      {status && (
        <p className={`text-sm ${status.success ? 'text-success' : 'text-destructive'}`}>
          {status.message}
        </p>
      )}

      <div className="mt-4 text-xs text-muted-foreground">
        <p className="font-medium mb-2">Hospital IDs for reference:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {hospitals.map(h => (
            <span key={h.id} className="bg-secondary px-2 py-1 rounded">
              {h.id}: {h.name}
            </span>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
