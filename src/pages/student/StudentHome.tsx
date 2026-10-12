import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Skeleton } from '../../components/common/Skeleton';
import { useStudentHistory } from '../../hooks/useStudentHistory';
import { useStudent } from '../../context/StudentContext';
import {
  Sparkles, ArrowRight, BookOpen, Flame, Target, Trophy, Clock,
  CheckCircle2, AlertTriangle, Zap, ChevronRight,
  TrendingUp, Compass
} from 'lucide-react';
import './StudentHome.css';

interface LearningModule {
  id: string;
  title: string;
  level: string;
  description: string;
  mastery: number;
  status: 'completed' | 'in_progress' | 'locked';
  totalProblems: number;
  completedProblems: number;
}

const LEARNING_MODULES: LearningModule[] = [
  {
    id: 'mod-1',
    title: 'One-Step Equations & Inverse Basics',
    level: 'Foundational',
    description: 'Master addition and subtraction inverses to balance single-step equations.',
    mastery: 100,
    status: 'completed',
    totalProblems: 5,
    completedProblems: 5,
  },
  {
    id: 'mod-2',
    title: 'Two-Step Linear Equations',
    level: 'Core Topic',
    description: 'Isolate variables by undoing constant addition/subtraction, then dividing coefficients.',
    mastery: 75,
    status: 'in_progress',
    totalProblems: 8,
    completedProblems: 6,
  },
  {
    id: 'mod-3',
    title: 'Multi-Step & Distributive Property',
    level: 'Intermediate',
    description: 'Expand parentheses using distribution and combine like terms before solving.',
    mastery: 30,
    status: 'in_progress',
    totalProblems: 10,
    completedProblems: 3,
  },
  {
    id: 'mod-4',
    title: 'Variables on Both Sides',
    level: 'Advanced',
    description: 'Collect variable terms on one side and numerical constants on the other.',
    mastery: 0,
    status: 'locked',
    totalProblems: 8,
    completedProblems: 0,
  },
];

export const StudentHome: React.FC = () => {
  const navigate = useNavigate();
  const { studentId, profile } = useStudent();
  const { isLoading, history } = useStudentHistory(studentId);

  const studentName = profile?.name || `Student ${studentId}`;
  const masteryScore = profile?.mastery ?? history?.mastery ?? 78;
  const totalAttempts = profile?.total_attempts ?? history?.totalAttempts ?? 0;
  const correctionRate = profile?.correction_rate ?? history?.correctionRate ?? 70;
  const recentAttempts = history?.attempts.slice(0, 3) ?? [];

  return (
    <div className="student-home animate-fade-in">
      {/* Top Welcome & Navigation Header */}
      <div className="student-home-header">
        <div className="student-home-header-text">
          <span className="student-home-kicker">LEARNER DASHBOARD</span>
          <h1 className="student-home-title">Welcome back, {studentName} 👋</h1>
          <p className="student-home-subtitle">
            Track your algebra learning trajectory, tackle practice challenges, and review personalized feedback.
          </p>
        </div>
        <div className="student-home-header-actions">
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Zap size={18} />}
            onClick={() => navigate('/student/practice')}
          >
            Start Practice Session
          </Button>
        </div>
      </div>

      {/* Hero Active Mission Card */}
      <Card variant="elevated" className="home-hero-mission-card">
        <div className="home-hero-glow" />
        <div className="home-hero-content">
          <div className="home-hero-left">
            <div className="home-hero-badges">
              <Badge variant="brand" size="sm">ACTIVE FOCUS</Badge>
              <Badge variant="muted" size="sm">Grade 9 Mathematics</Badge>
              <span className="home-hero-streak">
                <Flame size={14} className="streak-flame" /> 3 Day Streak
              </span>
            </div>
            <h2 className="home-hero-topic">Two-Step Linear Equations</h2>
            <p className="home-hero-description">
              You are currently mastering step-by-step inverse operations ($ax + b = c$).
              Solve challenges, receive instant AI hints on misconceptions, and level up your mastery.
            </p>
            <div className="home-hero-progress-wrap">
              <div className="home-hero-progress-label">
                <span>Curriculum Mastery Progress</span>
                <span className="home-hero-progress-pct">{masteryScore}%</span>
              </div>
              <ProgressBar value={masteryScore} showPercentage={false} variant="primary" size="md" />
            </div>
          </div>
          <div className="home-hero-right">
            <div className="home-next-challenge-box">
              <span className="challenge-box-tag">NEXT CHALLENGE</span>
              <div className="challenge-box-equation">8x + 6 = 30</div>
              <p className="challenge-box-hint">First subtract 6 from both sides, then divide by 8 to find x.</p>
              <Button
                variant="primary"
                size="md"
                className="w-full"
                rightIcon={<ArrowRight size={16} />}
                onClick={() => navigate('/student/practice')}
              >
                Solve in Practice Mode
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Metric KPIs */}
      <div className="home-kpi-grid">
        <Card variant="glass" className="home-kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Overall Mastery</span>
            <div className="kpi-icon-wrap icon-primary">
              <Target size={20} />
            </div>
          </div>
          <div className="kpi-number">{masteryScore}%</div>
          <div className="kpi-subtext positive">
            <TrendingUp size={14} /> +4% this week
          </div>
        </Card>

        <Card variant="glass" className="home-kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Total Attempts</span>
            <div className="kpi-icon-wrap icon-info">
              <BookOpen size={20} />
            </div>
          </div>
          <div className="kpi-number">{totalAttempts}</div>
          <div className="kpi-subtext muted">
            Solved across modules
          </div>
        </Card>

        <Card variant="glass" className="home-kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Correction Rate</span>
            <div className="kpi-icon-wrap icon-success">
              <Trophy size={20} />
            </div>
          </div>
          <div className="kpi-number">{correctionRate}%</div>
          <div className="kpi-subtext positive">
            Learned from mistakes
          </div>
        </Card>

        <Card variant="glass" className="home-kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Current Streak</span>
            <div className="kpi-icon-wrap icon-warning">
              <Flame size={20} />
            </div>
          </div>
          <div className="kpi-number">3 Days</div>
          <div className="kpi-subtext warning">
            Next milestone: 5 days
          </div>
        </Card>
      </div>

      {/* Main 2-Column Section */}
      <div className="home-columns-grid">
        {/* Left Column: Learning Modules */}
        <div className="home-modules-column">
          <div className="section-title-row">
            <div>
              <h3 className="section-title">Curriculum Learning Path</h3>
              <p className="section-subtitle">Core algebraic concepts and progression</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ChevronRight size={14} />}
              onClick={() => navigate('/student/practice')}
            >
              Go to Practice
            </Button>
          </div>

          <div className="modules-list">
            {LEARNING_MODULES.map((mod) => (
              <Card
                key={mod.id}
                variant="elevated"
                className={`module-card ${mod.status === 'locked' ? 'module-locked' : ''}`}
              >
                <div className="module-card-body">
                  <div className="module-top-row">
                    <div className="module-title-wrap">
                      <span className="module-level-badge">{mod.level}</span>
                      <h4 className="module-title">{mod.title}</h4>
                    </div>
                    {mod.status === 'completed' ? (
                      <Badge variant="success" icon={<CheckCircle2 size={12} />}>Completed</Badge>
                    ) : mod.status === 'in_progress' ? (
                      <Badge variant="brand" icon={<Sparkles size={12} />}>In Progress</Badge>
                    ) : (
                      <Badge variant="muted">Locked</Badge>
                    )}
                  </div>

                  <p className="module-desc">{mod.description}</p>

                  <div className="module-footer-row">
                    <div className="module-progress-info">
                      <span className="module-progress-text">
                        {mod.completedProblems}/{mod.totalProblems} Problems Mastered
                      </span>
                      <ProgressBar
                        value={mod.mastery}
                        size="sm"
                        showPercentage={false}
                        variant={mod.mastery === 100 ? 'success' : 'primary'}
                      />
                    </div>

                    {mod.status !== 'locked' ? (
                      <Button
                        variant={mod.status === 'in_progress' ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => navigate('/student/practice')}
                      >
                        {mod.status === 'in_progress' ? 'Practice Now' : 'Review'}
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" disabled>
                        Unlocks Soon
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Activity & AI Coach Advice */}
        <div className="home-side-column">
          {/* AI Learning Coach Advice */}
          <Card variant="elevated" className="coach-advice-card">
            <CardHeader>
              <div className="coach-advice-header">
                <div className="coach-avatar-icon">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="coach-advice-title">AI Learning Coach Insights</h4>
                  <span className="coach-advice-sub">Adaptive Diagnostic Summary</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="coach-insight-block positive-insight">
                <span className="insight-tag">STRENGTH</span>
                <p className="insight-text">
                  Strong mastery in subtracting constant terms from both sides ($ax + b = c$).
                </p>
              </div>

              <div className="coach-insight-block focus-insight">
                <span className="insight-tag">FOCUS AREA</span>
                <p className="insight-text">
                  Take extra care when performing division after subtraction: double check arithmetic quotients like $24 \div 8 = 3$.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                leftIcon={<Compass size={14} />}
                onClick={() => navigate('/student/resources')}
              >
                Explore Curated Videos & Books
              </Button>
            </CardContent>
          </Card>

          {/* Recent Practice History Preview */}
          <Card variant="elevated" className="recent-activity-card">
            <CardHeader>
              <div className="recent-activity-header">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-muted" />
                  <h4 className="recent-activity-title">Recent Activity</h4>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/student/history')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton height="60px" borderRadius="var(--radius-md)" />
                  <Skeleton height="60px" borderRadius="var(--radius-md)" />
                  <Skeleton height="60px" borderRadius="var(--radius-md)" />
                </div>
              ) : recentAttempts.length > 0 ? (
                <div className="recent-attempts-list">
                  {recentAttempts.map((att, idx) => (
                    <div key={att.id || idx} className="recent-attempt-item">
                      <div className="recent-attempt-left">
                        {att.verdict === 'correct' ? (
                          <div className="attempt-badge-icon correct">
                            <CheckCircle2 size={16} />
                          </div>
                        ) : (
                          <div className="attempt-badge-icon incorrect">
                            <AlertTriangle size={16} />
                          </div>
                        )}
                        <div className="recent-attempt-details">
                          <span className="recent-attempt-q">
                            {att.question.length > 42 ? `${att.question.slice(0, 42)}...` : att.question}
                          </span>
                          <span className="recent-attempt-ans">
                            Your answer: <strong>{att.studentAnswer}</strong>
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={att.verdict === 'correct' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {att.verdict === 'correct' ? 'Correct' : 'Refined'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-recent-box">
                  <BookOpen size={24} className="text-muted" />
                  <p>No attempts recorded yet. Start a session!</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/student/practice')}
                  >
                    Start First Problem
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
