import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionCard } from './SectionCard';
import { Hospital } from '@/types/hospital';
import { Settings, CheckCircle2, AlertCircle, RefreshCw, ShieldAlert, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AdminPanelProps {
  hospitals: Hospital[];
}

export function AdminPanel({ hospitals }: AdminPanelProps) {
  const [hospitalId, setHospitalId] = useState('');
  const [beds, setBeds] = useState('');
  const [doctors, setDoctors] = useState('');
  const [status, setStatus] = useState<{ message: string; success: boolean } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const { user, isAdmin, loading } = useAuthContext();
  const navigate = useNavigate();

  const handleUpdate = async () => {
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

    setIsUpdating(true);

    // Compute new status
    let newStatus: 'normal' | 'busy' | 'critical' = 'normal';
    if (bedsNum <= 2) newStatus = 'critical';
    else if (bedsNum <= 5) newStatus = 'busy';

    // Update hospital in database
    const { error: updateError } = await supabase
      .from('hospitals')
      .update({
        available_beds: bedsNum,
        doctors_available: docsNum,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', hospitalId);

    if (updateError) {
      console.error('Error updating hospital:', updateError);
      setStatus({ message: `Update failed: ${updateError.message}`, success: false });
      setIsUpdating(false);
      return;
    }

    // Record bed update for audit trail
    const { error: auditError } = await supabase
      .from('bed_updates')
      .insert({
        hospital_id: hospitalId,
        previous_beds: hospital.available_beds,
        new_beds: bedsNum,
        updated_by: user?.id || null,
      });

    if (auditError) {
      console.error('Error recording audit:', auditError);
      // Non-fatal, continue
    }

    setIsUpdating(false);
    setStatus({ message: `Updated ${hospital.name} successfully.`, success: true });
    
    toast({
      title: 'Hospital Updated',
      description: `${hospital.name} now has ${bedsNum} beds and ${docsNum} doctors.`,
    });

    setHospitalId('');
    setBeds('');
    setDoctors('');
  };

  // Loading state
  if (loading) {
    return (
      <SectionCard
        id="admin"
        title="Admin Panel"
        subtitle="Loading..."
        icon={<Settings className="w-6 h-6 text-primary-foreground" />}
      >
        <div className="flex items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full"
          />
        </div>
      </SectionCard>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <SectionCard
        id="admin"
        title="Admin Panel"
        subtitle="Sign in to access admin features."
        icon={<Settings className="w-6 h-6 text-primary-foreground" />}
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Authentication Required</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Please sign in to access the admin panel.
          </p>
          <Button onClick={() => navigate('/auth')}>
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        </div>
      </SectionCard>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <SectionCard
        id="admin"
        title="Admin Panel"
        subtitle="Admin access required."
        icon={<Settings className="w-6 h-6 text-primary-foreground" />}
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Admin Access Required</h3>
          <p className="text-sm text-muted-foreground">
            You need admin privileges to update hospital data. Contact the system administrator.
          </p>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      id="admin"
      title="Admin Panel"
      subtitle="Update live bed and doctor counts for each hospital."
      icon={<Settings className="w-6 h-6 text-primary-foreground" />}
      className="bg-gradient-to-br from-card via-card to-primary-light/20"
    >
      {/* Input Form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Hospital
          </label>
          <Input
            placeholder="Select below"
            value={hospitalId ? hospitals.find(h => h.id === hospitalId)?.name || hospitalId : ''}
            readOnly
            className="rounded-xl border-border/50 focus:border-primary/50 h-12 bg-muted/30"
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
          <Button 
            onClick={handleUpdate} 
            size="lg" 
            className="w-full h-12"
            disabled={isUpdating || !hospitalId}
          >
            {isUpdating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                />
                Updating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Update
              </>
            )}
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
          Select Hospital to Update
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {hospitals.map((h, i) => (
            <motion.button
              key={h.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => {
                setHospitalId(h.id);
                setBeds(h.available_beds.toString());
                setDoctors(h.doctors_available.toString());
              }}
              className={`flex flex-col gap-1 p-3 rounded-xl border transition-all duration-200 text-left ${
                hospitalId === h.id
                  ? 'bg-primary/10 border-primary/30 shadow-sm'
                  : 'bg-muted/30 border-border/50 hover:bg-muted/50 hover:border-border'
              }`}
            >
              <span className="text-sm font-medium text-foreground truncate">
                {h.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {h.available_beds} beds • {h.doctors_available} docs
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
