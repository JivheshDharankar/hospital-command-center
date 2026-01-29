import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import AmbulanceDispatch from '@/components/AmbulanceDispatch';
import { motion } from 'framer-motion';
import { Ambulance } from 'lucide-react';

export default function AmbulanceCenter() {
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
            <div className="p-3 rounded-xl bg-destructive/10">
              <Ambulance className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Ambulance Dispatch Center</h1>
              <p className="text-muted-foreground">Real-time fleet tracking and emergency dispatch management</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <AmbulanceDispatch />
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
