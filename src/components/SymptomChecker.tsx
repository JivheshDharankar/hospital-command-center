import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SectionCard } from './SectionCard';
import { RiskBadge } from './RiskBadge';
import { analyzeSymptoms, getWhatIfAnalysis } from '@/utils/triage';
import { TriageResult } from '@/types/hospital';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState<TriageResult | null>(null);
  const { toast } = useToast();

  const handleAnalyze = () => {
    const analysis = analyzeSymptoms(symptoms);
    setResult(analysis);
    toast({
      title: 'Triage Complete',
      description: 'Symptom analysis has been performed.',
    });
  };

  return (
    <SectionCard
      id="patient"
      title="Patient Symptom Checker"
      subtitle="Simple rule-based triage demo. Not for clinical use; final decisions must always be taken by qualified clinicians."
    >
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">Symptom Details</label>
          <Textarea
            placeholder="E.g. severe chest pain, shortness of breath, weakness on one side..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="min-h-24 resize-none"
          />
        </div>
        
        <Button onClick={handleAnalyze}>
          <Search className="w-4 h-4 mr-2" />
          Analyse Symptoms
        </Button>

        {result && (
          <div className="bg-secondary/50 rounded-xl p-4 space-y-3 animate-fade-in">
            <div className="flex flex-wrap gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Risk Level: </span>
                <RiskBadge risk={result.risk} />
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Department: </span>
                <span className="font-semibold">{result.department}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{result.message}</p>
            
            {result.keywords.length > 0 && (
              <div className="pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Risk signals detected: </span>
                  {result.keywords.join(', ')}
                </p>
              </div>
            )}

            {getWhatIfAnalysis(result.risk) && (
              <div className="pt-2 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">What-if: </span>
                  {getWhatIfAnalysis(result.risk)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
