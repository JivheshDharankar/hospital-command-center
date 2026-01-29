import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import PatientJourneyTimeline from '@/components/PatientJourneyTimeline';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

export default function PatientTracking() {
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
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Patient Journey Tracking</h1>
              <p className="text-muted-foreground">Track patients through their entire hospital journey</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PatientJourneyTimeline />
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
