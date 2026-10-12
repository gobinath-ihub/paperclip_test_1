import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Check, Send, User, Sparkles } from 'lucide-react';
import type { InterventionRecommendation } from '../../types/teacher';
import './InterventionPanel.css';

const DEFAULT_INTERVENTIONS: InterventionRecommendation[] = [
  {
    studentId: 'demo-003',
    studentName: 'Marcus Williams',
    concept: 'Distributive Property with Negatives',
    observedIssue: 'Dropped negative multiplier across parentheses (-2(x - 4) written as -2x - 8).',
    recommendedIntervention: 'Use color-coded distribution boxes and assign 3 scaffolded practice problems before resuming multi-step equations.',
    practiceCount: 8,
  },
  {
    studentId: 'demo-005',
    studentName: 'James Kim',
    concept: 'Inverse Operations on Constant Terms',
    observedIssue: 'Added instead of subtracted when isolating variable term on the left side of the equation.',
    recommendedIntervention: 'Interactive visual balance scale demonstration to reinforce inverse symmetry.',
    practiceCount: 11,
  },
  {
    studentId: 'demo-001',
    studentName: 'Alex Johnson',
    concept: 'Variable Isolation Sign Conventions',
    observedIssue: 'Subtracted constant correctly but incorrectly divided by negative coefficient.',
    recommendedIntervention: 'One-click targeted mini-assignment: 5 sign-inversion drill problems.',
    practiceCount: 14,
  },
];

interface InterventionPanelProps {
  interventions?: InterventionRecommendation[];
}

export const InterventionPanel: React.FC<InterventionPanelProps> = ({
  interventions = DEFAULT_INTERVENTIONS,
}) => {
  const [activeList, setActiveList] = useState(interventions);
  const [assignedMap, setAssignedMap] = useState<Record<string, boolean>>({});

  const handleAssign = (studentId: string) => {
    setAssignedMap((prev) => ({ ...prev, [studentId]: true }));
  };

  const handleDismiss = (studentId: string) => {
    setActiveList((prev) => prev.filter((item) => item.studentId !== studentId));
  };

  return (
    <div className="intervention-panel-container">
      <div className="intervention-header">
        <div className="intervention-title-wrap">
          <div className="intervention-icon-wrap">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="intervention-main-title">Pedagogical Recommendations & Interventions</h3>
            <p className="intervention-sub">
              Automated triggers generated when students trigger &ge; 2 consecutive misconception loops
            </p>
          </div>
        </div>
        <Badge variant="brand">{activeList.length} Active Alerts</Badge>
      </div>

      <div className="interventions-grid">
        {activeList.map((item) => {
          const isAssigned = assignedMap[item.studentId];
          return (
            <Card key={item.studentId} variant="elevated" className="intervention-card">
              <div className="intervention-card-header">
                <div className="student-badge-row">
                  <div className="intervention-student-info">
                    <User size={14} className="text-primary" />
                    <span className="intervention-student-name">{item.studentName}</span>
                    <span className="intervention-student-id">({item.studentId})</span>
                  </div>
                  <Badge variant="warning" size="sm">
                    {item.practiceCount} Attempts
                  </Badge>
                </div>
                <h4 className="intervention-concept">{item.concept}</h4>
              </div>

              <div className="intervention-card-body">
                <div className="issue-box">
                  <span className="field-tag text-destructive">Observed Pattern</span>
                  <p className="issue-text">{item.observedIssue}</p>
                </div>

                <div className="action-box">
                  <span className="field-tag text-primary">Prescribed Intervention</span>
                  <p className="action-text">{item.recommendedIntervention}</p>
                </div>
              </div>

              <div className="intervention-card-footer">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDismiss(item.studentId)}
                >
                  Dismiss
                </Button>
                <Button
                  variant={isAssigned ? 'outline' : 'primary'}
                  size="sm"
                  disabled={isAssigned}
                  onClick={() => handleAssign(item.studentId)}
                >
                  {isAssigned ? (
                    <>
                      <Check size={14} /> Assigned to Student
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Assign Targeted Practice
                    </>
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
