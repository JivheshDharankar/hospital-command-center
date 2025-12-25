import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionCard } from './SectionCard';
import { Hospital } from '@/types/hospital';
import { Settings, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
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
    setStatus({ message: `Updated ${hospital.name} successfully.`, success: true });
    
    toast({
      title: 'Hospital Updated',
      description: `${hospital.name} has been updated with ${bedsNum} beds and ${docsNum} doctors.`,
    });

    setHospitalId('');
    setBeds('');
    setDoctors('');
  };

  return (
    <SectionCard
      id="admin"
      title="Admin Panel"
      subtitle="Update live bed and doctor counts for each hospital in the demo dataset."
      icon={<Settings className="w-6 h-6 text-primary-foreground" />}
      className="bg-gradient-to-br from-card via-card to-primary-light/20"
    >
      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Hospital ID
          </label>
          <Input
            placeholder="1-15"
            value={hospitalId}
            onChange={(e) => setHospitalId(e.target.value)}
            className="rounded-xl border-border/50 focus:border-primary/50 h-12"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Available Beds
          </label>
          <Input
            placeholder="e.g. 15"
            type="number"
            value={beds}
            onChange={(e) => setBeds(e.target.value)}
            className="rounded-xl border-border/50 focus:border-primary/50 h-12"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Doctors on Duty
          </label>
          <Input
            placeholder="e.g. 8"
            type="number"
            value={doctors}
            onChange={(e) => setDoctors(e.target.value)}
            className="rounded-xl border-border/50 focus:border-primary/50 h-12"
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleUpdate} size="lg" className="w-full h-12">
            <RefreshCw className="w-4 h-4 mr-2" />
            Update
          </Button>
        </div>
      </div>

      {/* Status Message */}
      {status && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 p-3 rounded-xl mb-6 ${
            status.success 
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
          }`}
        >
          {status.success ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{status.message}</span>
        </motion.div>
      )}

      {/* Hospital Reference Cards */}
      <div>
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Hospital Reference
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {hospitals.map((h, i) => (
            <motion.button
              key={h.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setHospitalId(h.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${
                hospitalId === h.id
                  ? 'bg-primary/10 border-primary/30 shadow-sm'
                  : 'bg-muted/30 border-border/50 hover:bg-muted/50 hover:border-border'
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                hospitalId === h.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {h.id}
              </span>
              <span className="text-sm font-medium text-foreground truncate">
                {h.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
