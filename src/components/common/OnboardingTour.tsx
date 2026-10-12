import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { Sparkles, ArrowRight, ArrowLeft, X, CheckCircle2 } from 'lucide-react';
import './OnboardingTour.css';

interface TourStep {
  title: string;
  badge: string;
  description: string;
  tip: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    badge: 'Step 1 of 5',
    title: 'Review the Problem',
    description: 'Inspect the mathematical challenge, subject, topic, and grade. Each challenge tests specific algebraic foundations.',
    tip: 'Look for the topic badge to understand what core skill is being tested.',
  },
  {
    badge: 'Step 2 of 5',
    title: 'Input Your Work & Solution',
    description: 'Type your final answer and explain your steps in the working textarea. The AI coach reads your step-by-step reasoning.',
    tip: 'Showing your working helps the engine identify the exact step where an error occurred.',
  },
  {
    badge: 'Step 3 of 5',
    title: 'Get Adaptive Feedback',
    description: 'The AI diagnostician detects precise misconceptions (like arithmetic slips or inverse operation confusion) without judging.',
    tip: 'Notice your feedback is categorized and explains the "why" behind the misconception.',
  },
  {
    badge: 'Step 4 of 5',
    title: 'Retry & Prove Understanding',
    description: 'Click "Try this problem" to immediately load a follow-up retry question. Your previous feedback stays visible as a reference!',
    tip: 'Notice that your previous feedback is NEVER wiped away — you learn side-by-side.',
  },
  {
    badge: 'Step 5 of 5',
    title: 'Track Your Evidence & Growth',
    description: 'Watch your mastery gauge update in real-time. Review your past attempts and misconception history in the evidence panel.',
    tip: 'Continuous retries increase your correction rate and build permanent conceptual understanding.',
  },
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="tour-backdrop animate-fade-in" role="dialog" aria-modal="true">
      <div className="tour-modal">
        <Card variant="glass" className="tour-card">
          <div className="tour-header">
            <div className="tour-badge-row">
              <Badge variant="brand" icon={<Sparkles size={12} />}>
                {step.badge}
              </Badge>
              <button
                className="tour-close-btn"
                onClick={onClose}
                aria-label="Close tour"
              >
                <X size={18} />
              </button>
            </div>
            <h3 className="tour-title">{step.title}</h3>
          </div>

          <div className="tour-body">
            <p className="tour-description">{step.description}</p>
            <div className="tour-tip-box">
              <span className="tour-tip-label">💡 Pro Tip:</span>
              <p className="tour-tip-text">{step.tip}</p>
            </div>
          </div>

          <div className="tour-dots">
            {TOUR_STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`tour-dot ${idx === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(idx)}
              />
            ))}
          </div>

          <div className="tour-footer">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              <ArrowLeft size={16} /> Back
            </Button>
            <div className="tour-actions">
              <Button variant="outline" size="sm" onClick={onClose}>
                Skip Tour
              </Button>
              <Button variant="primary" size="sm" onClick={handleNext}>
                {isLast ? (
                  <>
                    <CheckCircle2 size={16} /> Finish
                  </>
                ) : (
                  <>
                    Next <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
