import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Send, RotateCcw } from 'lucide-react';
import type { ChallengeState } from '../../types/student';
import './CurrentChallenge.css';

interface CurrentChallengeProps {
  challenge: ChallengeState;
  studentId: string;
  isLoading: boolean;
  onStudentIdChange: (id: string) => void;
  onFieldChange: (field: keyof ChallengeState, value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export const CurrentChallenge: React.FC<CurrentChallengeProps> = ({
  challenge,
  studentId,
  isLoading,
  onStudentIdChange,
  onFieldChange,
  onSubmit,
  onReset,
}) => {
  const canSubmit = challenge.studentAnswer.trim() && challenge.working.trim() && !isLoading;

  return (
    <Card variant="elevated" className="challenge-card">
      <CardHeader>
        <div className="challenge-header">
          <h3 className="challenge-title">Current Challenge</h3>
          <Badge variant="brand" size="md">Attempt {challenge.attemptNumber}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* Problem metadata */}
        <div className="challenge-meta">
          <Badge variant="info">{challenge.subject}</Badge>
          <Badge variant="muted">Grade {challenge.grade}</Badge>
          <Badge variant="muted">{challenge.topic}</Badge>
        </div>

        {/* Question */}
        <div className="challenge-question">
          <label className="challenge-label" htmlFor="challenge-question">Question</label>
          <textarea
            id="challenge-question"
            className="challenge-textarea challenge-question-input"
            value={challenge.question}
            onChange={(e) => onFieldChange('question', e.target.value)}
            rows={3}
            placeholder="Enter the mathematical question..."
            aria-label="Mathematical question"
          />
        </div>

        {/* Student ID */}
        <div className="challenge-field">
          <label className="challenge-label" htmlFor="student-id">Student ID</label>
          <input
            id="student-id"
            type="text"
            className="challenge-input"
            value={studentId}
            onChange={(e) => onStudentIdChange(e.target.value)}
            placeholder="Enter your student ID"
            aria-label="Student ID"
          />
        </div>

        {/* Answer */}
        <div className="challenge-field">
          <label className="challenge-label" htmlFor="student-answer">Your answer</label>
          <input
            id="student-answer"
            type="text"
            className="challenge-input"
            value={challenge.studentAnswer}
            onChange={(e) => onFieldChange('studentAnswer', e.target.value)}
            placeholder="Enter your answer"
            disabled={isLoading}
            aria-label="Your answer"
          />
        </div>

        {/* Working */}
        <div className="challenge-field">
          <label className="challenge-label" htmlFor="student-working">Show your working</label>
          <textarea
            id="student-working"
            className="challenge-textarea"
            value={challenge.working}
            onChange={(e) => onFieldChange('working', e.target.value)}
            rows={5}
            placeholder="Show your working..."
            disabled={isLoading}
            aria-label="Show your working"
          />
        </div>
      </CardContent>

      <CardFooter className="challenge-footer">
        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={!canSubmit}
          isLoading={isLoading}
          leftIcon={isLoading ? undefined : <Send size={16} />}
          size="lg"
        >
          {isLoading ? 'Analyzing your working...' : 'Get adaptive feedback'}
        </Button>
        <Button
          variant="outline"
          onClick={onReset}
          disabled={isLoading}
          leftIcon={<RotateCcw size={16} />}
        >
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
};
