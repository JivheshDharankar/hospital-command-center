import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import ResourceAllocationDashboard from '@/components/ResourceAllocationDashboard';

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24">
        <ResourceAllocationDashboard />
      </main>
      <Footer />
    </div>
  );
}
