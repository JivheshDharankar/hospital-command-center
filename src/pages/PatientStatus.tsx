import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, Clock, Building2, User, AlertCircle, 
  CheckCircle, Stethoscope, Pill, TestTube, ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface JourneyData {
  id: string;
  status: string;
  department: string;
  admission_type: string;
  admitted_at: string;
  bed_id: string | null;
  attending_doctor: string | null;
  patient?: {
    name: string;
    mrn: string;
  };
  events?: Array<{
    id: string;
    event_type: string;
    event_time: string;
    department: string | null;
  }>;
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  triage: <AlertCircle className="w-4 h-4" />,
  admission: <Building2 className="w-4 h-4" />,
  transfer: <ArrowRight className="w-4 h-4" />,
  procedure: <Stethoscope className="w-4 h-4" />,
  medication: <Pill className="w-4 h-4" />,
  test: <TestTube className="w-4 h-4" />,
  discharge: <CheckCircle className="w-4 h-4" />
};

const STATUS_COLORS: Record<string, string> = {
  admitted: 'bg-blue-500',
  'in-treatment': 'bg-amber-500',
  discharged: 'bg-emerald-500',
  transferred: 'bg-purple-500'
};

export default function PatientStatus() {
  const { journeyId } = useParams<{ journeyId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t');

  const [journey, setJourney] = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJourney() {
      if (!journeyId || !token) {
        setError('Invalid access link');
        setLoading(false);
        return;
      }

      try {
        // Use the RPC function for secure token-based access
        const { data, error: fetchError } = await supabase
          .rpc('get_journey_by_token', {
            _journey_id: journeyId,
            _token: token
          });

        if (fetchError) throw fetchError;

        if (!data || data.length === 0) {
          setError('Journey not found or access denied');
          setLoading(false);
          return;
        }

        const journeyData = data[0];

        // Fetch patient info
        const { data: patientData } = await supabase
          .from('patients')
          .select('name, mrn')
          .eq('id', journeyData.patient_id)
          .single();

        // Fetch journey events
        const { data: eventsData } = await supabase
          .from('journey_events')
          .select('*')
          .eq('journey_id', journeyId)
          .order('event_time', { ascending: false });

        setJourney({
          ...journeyData,
          patient: patientData || undefined,
          events: eventsData || []
        });
      } catch (err) {
        console.error('Error fetching journey:', err);
        setError('Failed to load journey status');
      } finally {
        setLoading(false);
      }
    }

    fetchJourney();

    // Set up realtime subscription for updates
    if (journeyId) {
      const channel = supabase
        .channel(`journey-${journeyId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'patient_journeys', filter: `id=eq.${journeyId}` },
          () => {
            fetchJourney();
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'journey_events', filter: `journey_id=eq.${journeyId}` },
          () => {
            fetchJourney();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [journeyId, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-md mx-auto space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Access Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (!journey) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 px-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-6 h-6" />
            <span className="font-bold text-lg">MediQueue AI</span>
          </div>
          <p className="text-sm text-primary-foreground/80">Patient Status Portal</p>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* Patient Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 shadow-lg border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-lg">{journey.patient?.name || 'Patient'}</h2>
                {journey.patient?.mrn && (
                  <p className="text-sm text-muted-foreground">MRN: {journey.patient.mrn}</p>
                )}
              </div>
            </div>
            <Badge className={cn("text-white", STATUS_COLORS[journey.status])}>
              {journey.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Department</p>
              <p className="font-medium flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {journey.department}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Admission</p>
              <p className="font-medium flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDistanceToNow(new Date(journey.admitted_at), { addSuffix: true })}
              </p>
            </div>
            {journey.bed_id && (
              <div className="space-y-1">
                <p className="text-muted-foreground">Bed</p>
                <p className="font-medium">{journey.bed_id}</p>
              </div>
            )}
            {journey.attending_doctor && (
              <div className="space-y-1">
                <p className="text-muted-foreground">Doctor</p>
                <p className="font-medium">{journey.attending_doctor}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Timeline Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-6 shadow-lg border border-border"
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Journey Timeline
          </h3>

          {journey.events && journey.events.length > 0 ? (
            <div className="relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
              <div className="space-y-4">
                {journey.events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-3 relative"
                  >
                    <div className="z-10 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
                      {EVENT_ICONS[event.event_type] || <Activity className="w-3 h-3" />}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium capitalize">{event.event_type.replace(/_/g, ' ')}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(event.event_time), { addSuffix: true })}
                        </span>
                      </div>
                      {event.department && (
                        <p className="text-sm text-muted-foreground">{event.department}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No events recorded yet</p>
          )}
        </motion.div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground py-4">
          This page updates automatically. Last checked: {new Date().toLocaleTimeString()}
        </p>
      </main>
    </div>
  );
}
