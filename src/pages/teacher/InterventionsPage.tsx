import React from 'react';
import { InterventionPanel } from '../../components/teacher/InterventionPanel';
import { Card } from '../../components/common/Card';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import './InterventionsPage.css';

export const InterventionsPage: React.FC = () => {
  return (
    <div className="interventions-page animate-fade-in">
      <div className="interventions-page-header">
        <div>
          <span className="interventions-kicker">PROACTIVE SUPPORT</span>
          <h1 className="interventions-title">Automated Teacher Interventions</h1>
          <p className="interventions-subtitle">
            Review AI-diagnosed recurring misconceptions and dispatch targeted practice modules to students before learning gaps compound.
          </p>
        </div>
      </div>

      <div className="intervention-kpis-bar">
        <Card variant="glass" className="stat-pill">
          <div className="pill-icon text-warning">
            <AlertCircle size={20} />
          </div>
          <div>
            <span className="pill-num">3</span>
            <span className="pill-lbl">Urgent Interventions</span>
          </div>
        </Card>

        <Card variant="glass" className="stat-pill">
          <div className="pill-icon text-primary">
            <Clock size={20} />
          </div>
          <div>
            <span className="pill-num">8</span>
            <span className="pill-lbl">In Progress</span>
          </div>
        </Card>

        <Card variant="glass" className="stat-pill">
          <div className="pill-icon text-success">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="pill-num">24</span>
            <span className="pill-lbl">Successfully Resolved</span>
          </div>
        </Card>
      </div>

      <InterventionPanel />
    </div>
  );
};
