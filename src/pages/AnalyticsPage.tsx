import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import HistoricalAnalytics from '@/components/HistoricalAnalytics';
import { SurgeOrchestration } from '@/components/SurgeOrchestration';
import { CohortFinder } from '@/components/CohortFinder';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-3 rounded-xl bg-primary/10">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
              <p className="text-muted-foreground">Historical trends, surge predictions, and cohort analysis</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <HistoricalAnalytics />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SurgeOrchestration />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CohortFinder />
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
