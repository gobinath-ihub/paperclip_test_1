import React from 'react';
import { StudentWorkspace } from '../../components/student/StudentWorkspace';
import './PracticePage.css';

export const PracticePage: React.FC = () => {
  return (
    <div className="practice-page animate-fade-in">
      <div className="practice-page-header">
        <span className="practice-kicker">INTERACTIVE WORKBENCH</span>
        <h1 className="practice-title">Adaptive Math Practice</h1>
        <p className="practice-subtitle">
          Solve equations step-by-step, receive real-time misconception diagnoses from the AI coach, and unlock targeted learning resources.
        </p>
      </div>

      <StudentWorkspace />
    </div>
  );
};
