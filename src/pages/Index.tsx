import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { StatsGrid } from '@/components/StatsGrid';
import { QueueSimulation } from '@/components/QueueSimulation';
import { Features } from '@/components/Features';
import { Departments } from '@/components/Departments';
import { HospitalDashboard } from '@/components/HospitalDashboard';
import { HospitalMap } from '@/components/HospitalMap';
import { SurgeOrchestration } from '@/components/SurgeOrchestration';
import { CohortFinder } from '@/components/CohortFinder';
import { SymptomChecker } from '@/components/SymptomChecker';
import { NearbyHospitals } from '@/components/NearbyHospitals';
import { AdminPanel } from '@/components/AdminPanel';
import { SystemArchitecture } from '@/components/SystemArchitecture';
import { ContactForm } from '@/components/ContactForm';
import { Footer } from '@/components/Footer';
import { HospitalAlerts } from '@/components/HospitalAlerts';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { useHospitals } from '@/hooks/useHospitals';
import { useQueueSimulation } from '@/hooks/useQueueSimulation';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { hospitals, loading, error, getTotalOccupancy } = useHospitals();
  const { events, isRunning, toggleSimulation } = useQueueSimulation(hospitals);

  return (
    <div className="min-h-screen bg-background page-transition" id="top">
      <Navbar />
      <HospitalAlerts />
      <Hero />
      <StatsGrid />

      <div className="container mx-auto px-4 py-16 space-y-8">
        <QueueSimulation events={events} isRunning={isRunning} onToggle={toggleSimulation} />
      </div>

      <Features />
      <Departments />

      <div className="container mx-auto px-4 space-y-8 pb-16">
        {loading ? (
          <div className="space-y-8">
            <Skeleton className="h-96 w-full rounded-2xl" />
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
        ) : error ? (
          <div className="p-8 rounded-2xl bg-destructive/10 border border-destructive/20 text-center">
            <p className="text-destructive font-medium">Error loading hospitals: {error}</p>
          </div>
        ) : (
          <>
            <HospitalDashboard hospitals={hospitals} />
            <AnalyticsDashboard />
            <HospitalMap hospitals={hospitals} />
            <SurgeOrchestration occupancy={getTotalOccupancy()} />
            <CohortFinder />
            <SymptomChecker />
            <NearbyHospitals hospitals={hospitals} />
            <AdminPanel hospitals={hospitals} />
          </>
        )}
        <SystemArchitecture />
        <ContactForm />
      </div>

      <Footer />
    </div>
  );
};

export default Index;
