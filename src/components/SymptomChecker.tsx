import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SectionCard } from './SectionCard';
import { RiskBadge } from './RiskBadge';
import { TriageResult } from '@/types/hospital';
import { Stethoscope, Sparkles, AlertTriangle, Building2, Info, Mic, MicOff, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface AITriageResponse {
  urgency_level: 'low' | 'medium' | 'high' | 'emergency';
  recommended_department: string;
  message: string;
  risk_signals: string[];
  what_if_analysis: string;
}

function mapUrgencyToRisk(urgency: AITriageResponse['urgency_level']): TriageResult['risk'] {
  switch (urgency) {
    case 'emergency':
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    default:
      return 'Low';
  }
}

export function SymptomChecker() {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState<TriageResult | null>(null);
  const [whatIfAnalysis, setWhatIfAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  // Voice input handling
  const handleVoiceResult = useCallback((transcript: string, isFinal: boolean) => {
    if (isFinal) {
      setSymptoms(prev => prev + (prev ? ' ' : '') + transcript);
    }
  }, []);

  const handleVoiceError = useCallback((error: string) => {
    toast({
      title: t('symptomChecker.micPermission'),
      description: t('symptomChecker.micPermissionDesc'),
      variant: 'destructive',
    });
  }, [toast, t]);

  const voiceLang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-US';
  
  const {
    isListening,
    isSupported: isVoiceSupported,
    interimTranscript,
    startListening,
    stopListening,
  } = useVoiceInput({
    language: voiceLang,
    continuous: true,
    onResult: handleVoiceResult,
    onError: handleVoiceError,
  });

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      toast({
        title: t('symptomChecker.enterSymptoms'),
        description: t('symptomChecker.enterSymptomsDesc'),
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setWhatIfAnalysis('');

    try {
      const { data, error } = await supabase.functions.invoke<AITriageResponse>('analyze-symptoms', {
        body: { symptoms: symptoms.trim() },
      });

      if (error) throw error;

      if (data) {
        setResult({
          risk: mapUrgencyToRisk(data.urgency_level),
          department: data.recommended_department,
          message: data.message,
          keywords: data.risk_signals || [],
        });
        setWhatIfAnalysis(data.what_if_analysis || '');
        toast({
          title: t('symptomChecker.analysisComplete'),
          description: t('symptomChecker.analysisCompleteDesc'),
        });
      }
    } catch (err) {
      console.error('Error analyzing symptoms:', err);
      toast({
        title: t('symptomChecker.analysisFailed'),
        description: t('symptomChecker.analysisFailedDesc'),
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <SectionCard
      id="patient"
      title={t('symptomChecker.title')}
      subtitle={t('symptomChecker.subtitle')}
      icon={<Stethoscope className="w-6 h-6 text-primary-foreground" />}
    >
      <div className="space-y-5">
        <div className="relative">
          <label className="text-sm font-medium text-foreground mb-2 block">
            {t('symptomChecker.describeSymptoms')}
          </label>
          <div className="relative">
            <Textarea
              placeholder={t('symptomChecker.placeholder')}
              value={symptoms + (interimTranscript ? (symptoms ? ' ' : '') + interimTranscript : '')}
              onChange={(e) => setSymptoms(e.target.value)}
              className="min-h-28 resize-none rounded-xl border-border/50 focus:border-primary/50 transition-colors pr-14"
            />
            
            {/* Voice Input Button */}
            {isVoiceSupported && (
              <Button
                type="button"
                variant={isListening ? 'default' : 'ghost'}
                size="icon"
                onClick={toggleVoiceInput}
                className={cn(
                  "absolute top-2 right-2 transition-all",
                  isListening && "bg-destructive hover:bg-destructive/90 animate-pulse"
                )}
                title={isListening ? t('symptomChecker.stopRecording') : t('symptomChecker.startRecording')}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-sm text-destructive"
                >
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span>{t('symptomChecker.voiceInput')}...</span>
                  {/* Waveform Animation */}
                  <div className="flex items-center gap-0.5 h-4">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-destructive rounded-full"
                        animate={{
                          height: [8, 16, 8],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {symptoms.length} {t('common.characters')}
            </div>
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
              {t('symptomChecker.analyzing')}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              {t('symptomChecker.analyze')}
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
                    result.risk === 'High' ? 'text-destructive' :
                    result.risk === 'Medium' ? 'text-warning' : 'text-success'
                  }`} />
                  <span className="text-sm font-medium text-muted-foreground">{t('symptomChecker.riskLevel')}</span>
                  <RiskBadge risk={result.risk} />
                </motion.div>
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="flex items-center gap-3"
                >
                  <Building2 className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">{t('symptomChecker.department')}</span>
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
                    <span className="text-sm font-medium text-foreground">{t('symptomChecker.riskSignals')}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((keyword, i) => (
                      <motion.span
                        key={keyword}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + i * 0.05 }}
                        className="text-xs px-3 py-1.5 bg-destructive/10 text-destructive rounded-full border border-destructive/20"
                      >
                        {keyword}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* What-if */}
              {whatIfAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="pt-4 border-t border-border/50 bg-card rounded-xl p-4"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 block">
                    {t('symptomChecker.whatIfAnalysis')}
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {whatIfAnalysis}
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
