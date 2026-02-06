import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface WalkthroughStep {
  id: string;
  targetId: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
}

interface WalkthroughContextType {
  isActive: boolean;
  currentStep: number;
  steps: WalkthroughStep[];
  startWalkthrough: () => void;
  endWalkthrough: () => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  hasCompletedTour: boolean;
  markTourComplete: () => void;
}

const walkthroughSteps: WalkthroughStep[] = [
  {
    id: 'welcome',
    targetId: 'hero-section',
    title: 'walkthrough.welcome',
    description: 'walkthrough.welcomeDesc',
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'dashboard',
    targetId: 'dashboard',
    title: 'walkthrough.dashboard',
    description: 'walkthrough.dashboardDesc',
    position: 'top',
    highlight: true,
  },
  {
    id: 'symptom-checker',
    targetId: 'patient',
    title: 'walkthrough.symptomChecker',
    description: 'walkthrough.symptomCheckerDesc',
    position: 'top',
    highlight: true,
  },
  {
    id: 'surge-orchestration',
    targetId: 'surge-orchestration',
    title: 'walkthrough.surgeOrch',
    description: 'walkthrough.surgeOrchDesc',
    position: 'top',
    highlight: true,
  },
  {
    id: 'hospital-map',
    targetId: 'hospital-map',
    title: 'walkthrough.hospitalMap',
    description: 'walkthrough.hospitalMapDesc',
    position: 'top',
    highlight: true,
  },
  {
    id: 'analytics',
    targetId: 'historical-analytics',
    title: 'walkthrough.analytics',
    description: 'walkthrough.analyticsDesc',
    position: 'top',
    highlight: true,
  },
  {
    id: 'complete',
    targetId: 'hero-section',
    title: 'walkthrough.complete',
    description: 'walkthrough.completeDesc',
    position: 'bottom',
    highlight: false,
  },
];

const WalkthroughContext = createContext<WalkthroughContextType | undefined>(undefined);

export function WalkthroughProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('mediqueue-tour-completed');
    setHasCompletedTour(completed === 'true');
  }, []);

  const scrollToElement = useCallback((targetId: string) => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const startWalkthrough = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
    scrollToElement(walkthroughSteps[0].targetId);
  }, [scrollToElement]);

  const endWalkthrough = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < walkthroughSteps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      scrollToElement(walkthroughSteps[nextStepIndex].targetId);
    } else {
      endWalkthrough();
      markTourComplete();
    }
  }, [currentStep, scrollToElement, endWalkthrough]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
      scrollToElement(walkthroughSteps[prevStepIndex].targetId);
    }
  }, [currentStep, scrollToElement]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < walkthroughSteps.length) {
      setCurrentStep(step);
      scrollToElement(walkthroughSteps[step].targetId);
    }
  }, [scrollToElement]);

  const markTourComplete = useCallback(() => {
    setHasCompletedTour(true);
    localStorage.setItem('mediqueue-tour-completed', 'true');
  }, []);

  return (
    <WalkthroughContext.Provider
      value={{
        isActive,
        currentStep,
        steps: walkthroughSteps,
        startWalkthrough,
        endWalkthrough,
        nextStep,
        previousStep,
        goToStep,
        hasCompletedTour,
        markTourComplete,
      }}
    >
      {children}
    </WalkthroughContext.Provider>
  );
}

export function useWalkthrough() {
  const context = useContext(WalkthroughContext);
  if (!context) {
    throw new Error('useWalkthrough must be used within a WalkthroughProvider');
  }
  return context;
}
