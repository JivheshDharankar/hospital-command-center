import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import HospitalTransfers from '@/components/HospitalTransfers';
import { motion } from 'framer-motion';
import { ArrowRightLeft } from 'lucide-react';

export default function TransferCenter() {
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
            <div className="p-3 rounded-xl bg-amber-500/10">
              <ArrowRightLeft className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Inter-Hospital Transfers</h1>
              <p className="text-muted-foreground">Coordinate patient transfers between facilities</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <HospitalTransfers />
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
