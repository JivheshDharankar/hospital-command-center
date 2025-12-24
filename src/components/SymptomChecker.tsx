import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SectionCard } from './SectionCard';
import { RiskBadge } from './RiskBadge';
import { analyzeSymptoms, getWhatIfAnalysis } from '@/utils/triage';
import { TriageResult } from '@/types/hospital';
import { Stethoscope, Sparkles, AlertTriangle, Building2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState<TriageResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = () => {
    if (!symptoms.trim()) {
      toast({
        title: 'Enter Symptoms',
        description: 'Please describe your symptoms first.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const analysis = analyzeSymptoms(symptoms);
      setResult(analysis);
      setIsAnalyzing(false);
      toast({
        title: 'Triage Complete',
        description: 'Symptom analysis has been performed.',
      });
    }, 800);
  };

  return (
    <SectionCard
      id="patient"
      title="Patient Symptom Checker"
      subtitle="Simple rule-based triage demo. Not for clinical use; final decisions must always be taken by qualified clinicians."
      icon={<Stethoscope className="w-6 h-6 text-primary-foreground" />}
    >
      <div className="space-y-5">
        <div className="relative">
          <label className="text-sm font-medium text-foreground mb-2 block">
            Describe Your Symptoms
          </label>
          <Textarea
            placeholder="E.g. severe chest pain, shortness of breath, weakness on one side, high fever..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="min-h-28 resize-none rounded-xl border-border/50 focus:border-primary/50 transition-colors"
          />
          <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
            {symptoms.length} characters
          </div>
        </div>
        
        <Button 
          onClick={handleAnalyze} 
          size="lg"
          disabled={isAnalyzing}
          className="relative overflow-hidden"
        >
          {isAnalyzing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
              />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Analyse Symptoms
            </>
          )}
        </Button>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl p-6 border border-border/50 space-y-4"
            >
              {/* Result Header */}
              <div className="flex flex-wrap items-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="flex items-center gap-3"
                >
                  <AlertTriangle className={`w-5 h-5 ${
                    result.risk === 'High' ? 'text-rose-500' :
                    result.risk === 'Medium' ? 'text-amber-500' : 'text-emerald-500'
                  }`} />
                  <span className="text-sm font-medium text-muted-foreground">Risk Level</span>
                  <RiskBadge risk={result.risk} />
                </motion.div>
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="flex items-center gap-3"
                >
                  <Building2 className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Department</span>
                  <span className="font-semibold text-foreground bg-primary/10 px-3 py-1 rounded-full text-sm">
                    {result.department}
                  </span>
                </motion.div>
              </div>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-muted-foreground bg-card rounded-xl p-4 border border-border/50"
              >
                {result.message}
              </motion.p>
              
              {/* Risk Signals */}
              {result.keywords.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="pt-4 border-t border-border/50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">Risk signals detected</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((keyword, i) => (
                      <motion.span
                        key={keyword}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + i * 0.05 }}
                        className="text-xs px-3 py-1.5 bg-rose-500/10 text-rose-600 rounded-full border border-rose-500/20"
                      >
                        {keyword}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* What-if */}
              {getWhatIfAnalysis(result.risk) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="pt-4 border-t border-border/50 bg-card rounded-xl p-4"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 block">
                    What-if Analysis
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {getWhatIfAnalysis(result.risk)}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionCard>
  );
}
