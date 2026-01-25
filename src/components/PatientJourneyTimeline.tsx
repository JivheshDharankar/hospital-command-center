import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Clock, Stethoscope, Pill, TestTube, 
  MessageSquare, LogOut, ArrowRight, Search,
  AlertTriangle, CheckCircle, Activity, Building2
} from 'lucide-react';
import { usePatientJourney } from '@/hooks/usePatientJourney';
import { SectionCard } from './SectionCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const EVENT_ICONS: Record<string, React.ReactNode> = {
  triage: <AlertTriangle className="w-4 h-4" />,
  admission: <Building2 className="w-4 h-4" />,
  transfer: <ArrowRight className="w-4 h-4" />,
  procedure: <Stethoscope className="w-4 h-4" />,
  medication: <Pill className="w-4 h-4" />,
  test: <TestTube className="w-4 h-4" />,
  consultation: <MessageSquare className="w-4 h-4" />,
  discharge: <LogOut className="w-4 h-4" />
};

const STATUS_COLORS: Record<string, string> = {
  admitted: 'bg-blue-500',
  'in-treatment': 'bg-amber-500',
  discharged: 'bg-emerald-500',
  transferred: 'bg-purple-500'
};

export default function PatientJourneyTimeline() {
  const { 
    activeJourneys, 
    loading, 
    searchPatients, 
    getJourneyWithEvents 
  } = usePatientJourney();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; mrn: string }>>([]);
  const [selectedJourney, setSelectedJourney] = useState<string | null>(null);
  const [journeyDetails, setJourneyDetails] = useState<Awaited<ReturnType<typeof getJourneyWithEvents>> | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      const results = await searchPatients(searchQuery);
      setSearchResults(results.map(p => ({ id: p.id, name: p.name, mrn: p.mrn })));
      setIsSearching(false);
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, searchPatients]);

  useEffect(() => {
    const loadDetails = async () => {
      if (selectedJourney) {
        const details = await getJourneyWithEvents(selectedJourney);
        setJourneyDetails(details);
      }
    };
    loadDetails();
  }, [selectedJourney, getJourneyWithEvents]);

  if (loading) {
    return (
      <SectionCard
        title="Patient Journey Tracking"
        subtitle="Loading patient data..."
        icon={<Activity className="w-6 h-6" />}
      >
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Patient Journey Tracking"
      subtitle="Real-time patient lifecycle from admission to discharge"
      icon={<Activity className="w-6 h-6" />}
    >
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Active Journeys List */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient name or MRN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            
            {/* Search Results Dropdown */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-1 glass-premium rounded-lg shadow-lg overflow-hidden"
                >
                  {searchResults.map(result => (
                    <button
                      key={result.id}
                      onClick={() => {
                        // Find journey for this patient
                        const journey = activeJourneys.find(j => j.patient_id === result.id);
                        if (journey) setSelectedJourney(journey.id);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-muted/50 transition-colors"
                    >
                      <p className="font-medium">{result.name}</p>
                      <p className="text-sm text-muted-foreground">MRN: {result.mrn}</p>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Active Journeys */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Active Admissions</h3>
            <Badge variant="secondary">{activeJourneys.length} patients</Badge>
          </div>

          <ScrollArea className="h-[400px]">
            <div className="space-y-2 pr-4">
              {activeJourneys.map((journey, index) => (
                <motion.button
                  key={journey.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedJourney(journey.id)}
                  className={cn(
                    "w-full p-4 rounded-lg text-left transition-all",
                    selectedJourney === journey.id 
                      ? "glass-premium ring-2 ring-primary" 
                      : "bg-muted/30 hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Patient #{journey.id.slice(0, 8)}</span>
                    </div>
                    <Badge className={cn("text-white", STATUS_COLORS[journey.status])}>
                      {journey.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {journey.department}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(journey.admitted_at), { addSuffix: true })}
                    </span>
                  </div>
                </motion.button>
              ))}

              {activeJourneys.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active patient journeys</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right: Timeline View */}
        <div className="glass-premium rounded-xl p-6">
          {journeyDetails ? (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    {journeyDetails.patient?.name || `Patient #${journeyDetails.id.slice(0, 8)}`}
                  </h3>
                  {journeyDetails.patient && (
                    <p className="text-sm text-muted-foreground">
                      MRN: {journeyDetails.patient.mrn}
                    </p>
                  )}
                </div>
                <Badge className={cn("text-white", STATUS_COLORS[journeyDetails.status])}>
                  {journeyDetails.status}
                </Badge>
              </div>

              {/* Journey Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Department</p>
                  <p className="font-medium">{journeyDetails.department}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Admission Type</p>
                  <p className="font-medium capitalize">{journeyDetails.admission_type}</p>
                </div>
                {journeyDetails.bed_id && (
                  <div>
                    <p className="text-muted-foreground">Bed</p>
                    <p className="font-medium">{journeyDetails.bed_id}</p>
                  </div>
                )}
                {journeyDetails.attending_doctor && (
                  <div>
                    <p className="text-muted-foreground">Attending Doctor</p>
                    <p className="font-medium">{journeyDetails.attending_doctor}</p>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="relative">
                <h4 className="font-semibold mb-4">Journey Timeline</h4>
                <div className="absolute left-[11px] top-12 bottom-0 w-0.5 bg-border" />
                
                <ScrollArea className="h-[200px]">
                  <div className="space-y-4 pr-4">
                    {journeyDetails.events?.map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-3 relative"
                      >
                        <div className="z-10 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
                          {EVENT_ICONS[event.event_type]}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <p className="font-medium capitalize">{event.event_type}</p>
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

                    {(!journeyDetails.events || journeyDetails.events.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No events recorded yet
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a patient to view their journey</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
