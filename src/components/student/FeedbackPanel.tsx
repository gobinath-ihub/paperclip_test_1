import React from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { Brain, AlertTriangle, Target, TrendingUp } from 'lucide-react';
import type { NormalizedFeedback } from '../../lib/api-adapters';
import type { CoachStatus } from '../../types/learning';
import './FeedbackPanel.css';

interface FeedbackPanelProps {
  feedback: NormalizedFeedback;
  coachStatus: CoachStatus;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ feedback, coachStatus }) => {
  const isCorrect = feedback.verdict === 'correct';

  return (
    <Card
      variant="elevated"
      className={`feedback-card ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}
    >
      <CardHeader>
        <div className="feedback-header">
          <div className="feedback-header-left">
            <Brain size={20} className="feedback-icon" />
            <h3 className="feedback-title">AI Learning Coach</h3>
          </div>
          <StatusBadge status={coachStatus} />
        </div>
      </CardHeader>

      <CardContent>
        {/* Verdict */}
        <div className={`feedback-verdict ${isCorrect ? 'verdict-correct' : 'verdict-incorrect'}`}>
          <span className="verdict-label">
            {isCorrect ? '✓ Correct!' : '✗ Let\'s fix one step.'}
          </span>
        </div>

        {/* Misconception */}
        {feedback.misconceptionLabel && !isCorrect && (
          <div className="feedback-misconception">
            <div className="misconception-header">
              <AlertTriangle size={16} />
              <span className="misconception-title">Mistake detected</span>
            </div>
            <p className="misconception-text">{feedback.misconceptionLabel}</p>
          </div>
        )}

        {/* Concept */}
        {feedback.misconceptionType && !isCorrect && (
          <div className="feedback-concept">
            <Target size={14} />
            <span>Concept: <strong>{feedback.misconceptionLabel || 'Inverse operations'}</strong></span>
          </div>
        )}

        {/* Confidence */}
        {feedback.confidence > 0 && (
          <div className="feedback-confidence">
            <TrendingUp size={14} />
            <span>Confidence: <strong>{Math.round(feedback.confidence * 100)}%</strong></span>
          </div>
        )}

        {/* Explanation */}
        {feedback.explanation && (
          <div className="feedback-explanation">
            <h4 className="feedback-section-title">Explanation</h4>
            <div className="explanation-steps">
              {feedback.explanation.split('\n').map((line, i) => (
                <p key={i} className={`explanation-line ${line.trim() === '' ? 'explanation-gap' : ''}`}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Feedback message */}
        {feedback.feedback && (
          <div className="feedback-message">
            <p>{feedback.feedback}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
