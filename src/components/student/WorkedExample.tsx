import React from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { BookOpen, ChevronRight } from 'lucide-react';
import './WorkedExample.css';

interface WorkedExampleProps {
  content: string;
}

export const WorkedExample: React.FC<WorkedExampleProps> = ({ content }) => {
  const steps = content.split('\n').filter((line) => line.trim());

  return (
    <Card variant="default" className="worked-example-card">
      <CardHeader>
        <div className="worked-example-header">
          <BookOpen size={18} className="worked-example-icon" />
          <h3 className="worked-example-title">Worked Example</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="worked-example-steps">
          {steps.map((step, i) => {
            const isStepHeader = step.toLowerCase().startsWith('step');
            return (
              <div
                key={i}
                className={`worked-step ${isStepHeader ? 'worked-step-header' : 'worked-step-line'}`}
              >
                {isStepHeader && <ChevronRight size={14} className="worked-step-arrow" />}
                <span>{step}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
