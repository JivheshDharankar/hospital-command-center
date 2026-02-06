import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWalkthrough } from '@/contexts/WalkthroughContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface TooltipPosition {
  top: number;
  left: number;
  arrowPosition: 'top' | 'bottom' | 'left' | 'right';
}

export function WalkthroughOverlay() {
  const { isActive, currentStep, steps, nextStep, previousStep, endWalkthrough } = useWalkthrough();
  const { t } = useLanguage();
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStepData = steps[currentStep];

  const updatePositions = useCallback(() => {
    if (!isActive || !currentStepData) return;

    const element = document.getElementById(currentStepData.targetId);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    setTargetRect(rect);

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 160;

    let top = 0;
    let left = 0;
    let arrowPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

    switch (currentStepData.position) {
      case 'top':
        top = rect.top - tooltipHeight - padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        arrowPosition = 'bottom';
        break;
      case 'bottom':
        top = rect.bottom + padding;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        arrowPosition = 'top';
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - padding;
        arrowPosition = 'right';
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + padding;
        arrowPosition = 'left';
        break;
    }

    // Keep tooltip in viewport
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));

    setTooltipPosition({ top, left, arrowPosition });
  }, [isActive, currentStepData]);

  useEffect(() => {
    updatePositions();
    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions, true);

    return () => {
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions, true);
    };
  }, [updatePositions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;

      switch (e.key) {
        case 'Escape':
          endWalkthrough();
          break;
        case 'ArrowRight':
        case 'Enter':
          nextStep();
          break;
        case 'ArrowLeft':
          previousStep();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, nextStep, previousStep, endWalkthrough]);

  if (!isActive || !tooltipPosition || !targetRect) return null;

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] pointer-events-none"
      >
        {/* Dark overlay with spotlight cutout */}
        <svg className="absolute inset-0 w-full h-full pointer-events-auto">
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <motion.rect
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="12"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
            onClick={endWalkthrough}
          />
        </svg>

        {/* Spotlight border glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute rounded-xl border-2 border-primary shadow-glow-lg pointer-events-none"
          style={{
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
        />

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, y: tooltipPosition.arrowPosition === 'top' ? -10 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="absolute w-80 pointer-events-auto"
          style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
        >
          <div className="relative bg-card border border-border rounded-2xl shadow-2xl p-5">
            {/* Arrow */}
            <div
              className={`absolute w-3 h-3 bg-card border-border rotate-45 ${
                tooltipPosition.arrowPosition === 'top'
                  ? 'top-[-7px] left-1/2 -translate-x-1/2 border-t border-l'
                  : tooltipPosition.arrowPosition === 'bottom'
                  ? 'bottom-[-7px] left-1/2 -translate-x-1/2 border-b border-r'
                  : tooltipPosition.arrowPosition === 'left'
                  ? 'left-[-7px] top-1/2 -translate-y-1/2 border-t border-l'
                  : 'right-[-7px] top-1/2 -translate-y-1/2 border-b border-r'
              }`}
            />

            {/* Close button */}
            <button
              onClick={endWalkthrough}
              className="absolute top-3 right-3 p-1 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Content */}
            <div className="pr-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t(currentStepData.title)}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(currentStepData.description)}
              </p>
            </div>

            {/* Progress and navigation */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {steps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-primary'
                        : index < currentStep
                        ? 'bg-primary/40'
                        : 'bg-muted'
                    }`}
                    animate={{
                      scale: index === currentStep ? 1.2 : 1,
                    }}
                  />
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center gap-2">
                {!isFirstStep && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={previousStep}
                    className="h-8 px-3"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    {t('common.previous')}
                  </Button>
                )}
                <Button size="sm" onClick={nextStep} className="h-8 px-4">
                  {isLastStep ? (
                    t('common.finish')
                  ) : (
                    <>
                      {t('common.next')}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function StartTourButton() {
  const { startWalkthrough, hasCompletedTour } = useWalkthrough();
  const { t } = useLanguage();

  return (
    <Button
      onClick={startWalkthrough}
      variant="outline"
      size="sm"
      className="gap-2 rounded-full border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
    >
      <Play className="w-4 h-4" />
      {t('hero.startTour')}
    </Button>
  );
}
