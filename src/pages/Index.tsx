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
import { useHospitals } from '@/hooks/useHospitals';
import { useQueueSimulation } from '@/hooks/useQueueSimulation';

const Index = () => {
  const { hospitals, updateHospital, getTotalOccupancy } = useHospitals();
  const { events, isRunning, toggleSimulation } = useQueueSimulation(hospitals);

  return (
    <div className="min-h-screen bg-background page-transition" id="top">
      <Navbar />
      <Hero />
      <StatsGrid />

      <div className="container mx-auto px-4 py-16 space-y-8">
        <QueueSimulation events={events} isRunning={isRunning} onToggle={toggleSimulation} />
      </div>

      <Features />
      <Departments />

      <div className="container mx-auto px-4 space-y-8 pb-16">
        <HospitalDashboard hospitals={hospitals} />
        <HospitalMap hospitals={hospitals} />
        <SurgeOrchestration occupancy={getTotalOccupancy()} />
        <CohortFinder />
        <SymptomChecker />
        <NearbyHospitals hospitals={hospitals} />
        <AdminPanel hospitals={hospitals} onUpdate={updateHospital} />
        <SystemArchitecture />
        <ContactForm />
      </div>

      <Footer />
    </div>
  );
};

export default Index;
