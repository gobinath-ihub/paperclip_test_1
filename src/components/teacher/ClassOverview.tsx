import React from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { BarChart3 } from 'lucide-react';
import type { TeacherInsights } from '../../types/teacher';
import './ClassOverview.css';

interface ClassOverviewProps {
  insights: TeacherInsights;
}

export const ClassOverview: React.FC<ClassOverviewProps> = ({ insights }) => {
  const excellingCount = insights.students.filter((s) => s.mastery >= 80).length;
  const activeCount = insights.students.filter((s) => s.mastery >= 60 && s.mastery < 80).length;
  const strugglingCount = insights.students.filter((s) => s.mastery < 60).length;
  const total = insights.students.length || 1;

  const excellingPct = Math.round((excellingCount / total) * 100);
  const activePct = Math.round((activeCount / total) * 100);
  const strugglingPct = Math.round((strugglingCount / total) * 100);

  return (
    <Card variant="default" className="class-overview-card">
      <CardHeader>
        <div className="overview-header-row">
          <div className="overview-title-group">
            <BarChart3 size={18} className="text-primary" />
            <h3 className="overview-card-title">Class Mastery Distribution</h3>
          </div>
          <span className="overview-meta">Cohort Grade 9 • 34 Students</span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Tier Bar visualization */}
        <div className="distribution-stacked-bar">
          <div
            className="stacked-segment excelling-seg"
            style={{ width: `${excellingPct}%` }}
            title={`Excelling: ${excellingCount} students (${excellingPct}%)`}
          />
          <div
            className="stacked-segment active-seg"
            style={{ width: `${activePct}%` }}
            title={`On-Track: ${activeCount} students (${activePct}%)`}
          />
          <div
            className="stacked-segment struggling-seg"
            style={{ width: `${strugglingPct}%` }}
            title={`Needs Help: ${strugglingCount} students (${strugglingPct}%)`}
          />
        </div>

        {/* Legend / Tiers */}
        <div className="distribution-legend-grid">
          <div className="legend-item excelling">
            <div className="legend-dot excelling-dot"></div>
            <div className="legend-info">
              <span className="legend-name">Mastery ≥ 80%</span>
              <strong className="legend-count">{excellingCount} students ({excellingPct}%)</strong>
              <span className="legend-desc">Consistently solving retries correctly</span>
            </div>
          </div>

          <div className="legend-item active-tier">
            <div className="legend-dot active-dot"></div>
            <div className="legend-info">
              <span className="legend-name">On-Track (60 - 79%)</span>
              <strong className="legend-count">{activeCount} students ({activePct}%)</strong>
              <span className="legend-desc">Correcting after 1-2 adaptive hints</span>
            </div>
          </div>

          <div className="legend-item struggling">
            <div className="legend-dot struggling-dot"></div>
            <div className="legend-info">
              <span className="legend-name">Needs Help (&lt; 60%)</span>
              <strong className="legend-count">{strugglingCount} students ({strugglingPct}%)</strong>
              <span className="legend-desc">Repeated misconception triggers</span>
            </div>
          </div>
        </div>

        {/* Topic Breakdown */}
        <div className="topic-mastery-list">
          <h4 className="topic-breakdown-title">Topic Progress in Linear Equations</h4>
          <div className="topic-prog-item">
            <div className="topic-prog-label">
              <span>One-Step Equations (Addition/Subtraction)</span>
              <strong>92%</strong>
            </div>
            <ProgressBar value={92} variant="success" size="sm" showPercentage={false} />
          </div>

          <div className="topic-prog-item">
            <div className="topic-prog-label">
              <span>Two-Step Equations (Multiplication/Division)</span>
              <strong>78%</strong>
            </div>
            <ProgressBar value={78} variant="primary" size="sm" showPercentage={false} />
          </div>

          <div className="topic-prog-item">
            <div className="topic-prog-label">
              <span>Equations with Variables on Both Sides</span>
              <strong>58%</strong>
            </div>
            <ProgressBar value={58} variant="warning" size="sm" showPercentage={false} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
