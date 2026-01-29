import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QueueSimulation } from '@/components/QueueSimulation';
import { AdminPanel } from '@/components/AdminPanel';
import AmbulanceDispatch from '@/components/AmbulanceDispatch';
import HospitalTransfers from '@/components/HospitalTransfers';
import { useHospitals } from '@/hooks/useHospitals';
import { useQueueSimulation } from '@/hooks/useQueueSimulation';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Ambulance, ArrowRightLeft, Settings, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const { hospitals, loading } = useHospitals();
  const { events, isRunning, toggleSimulation } = useQueueSimulation(hospitals);
  const { stats } = useDashboardStats();

  const quickStats = [
    { label: 'Total Hospitals', value: stats?.totalHospitals ?? 0, icon: Activity, color: 'text-primary' },
    { label: 'Critical Units', value: stats?.criticalUnits ?? 0, icon: Users, color: 'text-destructive' },
    { label: 'Avg Triage (s)', value: stats?.avgTriageSeconds ?? 0, icon: Settings, color: 'text-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Command Center</h1>
            <p className="text-muted-foreground">Manage hospital operations, dispatch, and transfers</p>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {quickStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className={`p-3 rounded-xl bg-accent ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Tabbed Interface */}
          <Tabs defaultValue="queue" className="space-y-6">
            <TabsList className="glass p-1 h-auto flex-wrap">
              <TabsTrigger value="queue" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Activity className="w-4 h-4" />
                Queue Simulation
              </TabsTrigger>
              <TabsTrigger value="ambulance" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Ambulance className="w-4 h-4" />
                Ambulance Dispatch
              </TabsTrigger>
              <TabsTrigger value="transfers" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <ArrowRightLeft className="w-4 h-4" />
                Transfers
              </TabsTrigger>
              <TabsTrigger value="hospitals" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Settings className="w-4 h-4" />
                Hospital Management
              </TabsTrigger>
            </TabsList>

            <TabsContent value="queue">
              {loading ? (
                <Skeleton className="h-96 w-full rounded-2xl" />
              ) : (
                <QueueSimulation events={events} isRunning={isRunning} onToggle={toggleSimulation} />
              )}
            </TabsContent>

            <TabsContent value="ambulance">
              <AmbulanceDispatch />
            </TabsContent>

            <TabsContent value="transfers">
              <HospitalTransfers />
            </TabsContent>

            <TabsContent value="hospitals">
              {loading ? (
                <Skeleton className="h-96 w-full rounded-2xl" />
              ) : (
                <AdminPanel hospitals={hospitals} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
