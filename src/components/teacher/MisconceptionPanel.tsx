import React from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ArrowRight, Lightbulb, Users } from 'lucide-react';
import type { TeacherMisconception } from '../../types/teacher';
import './MisconceptionPanel.css';

interface MisconceptionPanelProps {
  misconceptions: TeacherMisconception[];
  onTriggerIntervention?: (misconception: TeacherMisconception) => void;
}

export const MisconceptionPanel: React.FC<MisconceptionPanelProps> = ({
  misconceptions,
  onTriggerIntervention,
}) => {
  return (
    <Card variant="default" className="misconception-panel">
      <CardHeader>
        <div className="panel-header-row">
          <div className="panel-title-with-icon">
            <div className="panel-icon-wrap">
              <Lightbulb size={18} />
            </div>
            <div>
              <h3 className="panel-title">Active Class Misconceptions</h3>
              <p className="panel-subtitle">
                AI diagnostic engine detected recurring conceptual errors across recent assignments
              </p>
            </div>
          </div>
          <Badge variant="warning">{misconceptions.length} Priority Topics</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="misconceptions-list">
          {misconceptions.map((item, idx) => (
            <div key={item.type || idx} className="misconception-item">
              <div className="misconception-info">
                <div className="misconception-name-row">
                  <span className="misconception-name">{item.label}</span>
                  <Badge variant={item.count >= 3 ? 'destructive' : 'warning'} size="sm">
                    <Users size={10} /> {item.count} {item.count === 1 ? 'student' : 'students'}
                  </Badge>
                </div>
                <p className="misconception-diagnosis">
                  {item.type.includes('inverse')
                    ? 'Students incorrectly applied addition when isolating terms, reversing mathematical sign conventions.'
                    : item.type.includes('subtraction')
                    ? 'Simple arithmetic calculation slip occurred during final step simplification.'
                    : 'Expression manipulation error during multi-term bracket expansion or distribution.'}
                </p>
              </div>

              <div className="misconception-action">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTriggerIntervention?.(item)}
                  className="intervention-trigger-btn"
                >
                  Create Group Mini-Lesson <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
