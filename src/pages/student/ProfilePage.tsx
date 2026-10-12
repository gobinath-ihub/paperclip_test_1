import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { useTheme } from '../../hooks/useTheme';
import {
  User, BookOpen, Sun, Moon, Monitor, Settings, Check
} from 'lucide-react';
import './ProfilePage.css';

import { useStudent } from '../../context/StudentContext';
import { fetchStudentProfile, updateStudentProfile, type SupabaseProfile } from '../../lib/supabase';

export const ProfilePage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { studentId, profile: contextProfile, refreshProfile } = useStudent();
  const [profileData, setProfileData] = useState<SupabaseProfile | null>(contextProfile);
  const [learningPace, setLearningPace] = useState<'guided' | 'standard' | 'accelerated'>('guided');
  const [notifications, setNotifications] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    fetchStudentProfile(studentId).then((data) => {
      if (data) {
        setProfileData(data);
        if (data.learning_pace) {
          setLearningPace(data.learning_pace as any);
        }
        if (typeof data.notifications_enabled === 'boolean') {
          setNotifications(data.notifications_enabled);
        }
      }
    });
  }, [studentId]);

  const handleSavePreferences = async () => {
    await updateStudentProfile(studentId, {
      learning_pace: learningPace,
      notifications_enabled: notifications,
    });
    await refreshProfile();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="profile-page animate-fade-in">
      <div className="profile-page-header">
        <div>
          <span className="profile-kicker">LEARNER PROFILE</span>
          <h1 className="profile-title">Account & Learning Preferences</h1>
          <p className="profile-subtitle">
            Manage your student profile settings, learning pace, and personalized AI coaching parameters.
          </p>
        </div>
      </div>

      <div className="profile-grid">
        {/* Left Column: Profile Card & Stats */}
        <div className="profile-main-col">
          <Card variant="glass" className="profile-hero-card">
            <div className="profile-avatar-row">
              <div className="profile-avatar">
                <User size={36} />
              </div>
              <div className="profile-identity">
                <div className="profile-name-row">
                  <h2 className="profile-name">{profileData?.name || 'Alex Johnson'}</h2>
                  <Badge variant="success">{profileData?.status === 'excelling' ? 'Excelling' : 'Active Learner'}</Badge>
                </div>
                <div className="profile-meta-tags">
                  <span className="profile-meta-item">ID: <strong>{profileData?.student_id || 'demo-001'}</strong></span>
                  <span className="profile-meta-dot">•</span>
                  <span className="profile-meta-item">Grade: <strong>Grade {profileData?.grade || '9'}</strong></span>
                  <span className="profile-meta-dot">•</span>
                  <span className="profile-meta-item">Cohort: <strong>{profileData?.cohort || 'Alpha-26'}</strong></span>
                </div>
              </div>
            </div>

            <div className="profile-stats-bar">
              <div className="profile-stat-box">
                <span className="stat-label">Mastery</span>
                <span className="stat-value text-primary">{profileData?.mastery ?? 68}%</span>
              </div>
              <div className="profile-stat-box">
                <span className="stat-label">Problems Solved</span>
                <span className="stat-value">{profileData?.total_attempts ?? 14}</span>
              </div>
              <div className="profile-stat-box">
                <span className="stat-label">Correction Rate</span>
                <span className="stat-value text-success">{profileData?.correction_rate ?? 72}%</span>
              </div>
              <div className="profile-stat-box">
                <span className="stat-label">Active Streak</span>
                <span className="stat-value text-warning">{profileData?.active_streak ?? 5} Days 🔥</span>
              </div>
            </div>
          </Card>

          {/* Academic Focus */}
          <Card variant="default">
            <CardHeader>
              <div className="section-title-row">
                <BookOpen size={18} className="text-primary" />
                <h3 className="section-title">Current Curricular Focus</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="focus-subject-item">
                <div className="focus-subject-header">
                  <div>
                    <h4 className="focus-title">Mathematics: Linear Equations in One Variable</h4>
                    <p className="focus-sub">Multi-step linear equations, distributive property & inverse operations</p>
                  </div>
                  <Badge variant="brand">68% Mastery</Badge>
                </div>
                <ProgressBar value={68} variant="primary" showPercentage={false} />
              </div>

              <div className="focus-milestones">
                <div className="milestone-item completed">
                  <span className="milestone-check">✓</span>
                  <span>Additive inverse property identification</span>
                </div>
                <div className="milestone-item completed">
                  <span className="milestone-check">✓</span>
                  <span>Combining like terms on single side</span>
                </div>
                <div className="milestone-item in-progress">
                  <span className="milestone-dot"></span>
                  <span>Distributing negative multipliers across parentheses (Current target)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Preferences & Settings */}
        <div className="profile-side-col">
          <Card variant="default">
            <CardHeader>
              <div className="section-title-row">
                <Settings size={18} className="text-primary" />
                <h3 className="section-title">App Preferences</h3>
              </div>
            </CardHeader>
            <CardContent className="preferences-content">
              {/* Theme Selection */}
              <div className="preference-group">
                <label className="pref-label">Interface Theme</label>
                <div className="theme-toggle-group">
                  <button
                    className={`theme-pill ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => setTheme('light')}
                  >
                    <Sun size={15} /> Light
                  </button>
                  <button
                    className={`theme-pill ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => setTheme('dark')}
                  >
                    <Moon size={15} /> Dark
                  </button>
                  <button
                    className={`theme-pill ${theme === 'system' ? 'active' : ''}`}
                    onClick={() => setTheme('system')}
                  >
                    <Monitor size={15} /> System
                  </button>
                </div>
              </div>

              {/* Learning Pace */}
              <div className="preference-group">
                <label className="pref-label">AI Coach Guidance Mode</label>
                <div className="pace-options">
                  <label className="pace-radio-option">
                    <input
                      type="radio"
                      name="pace"
                      value="guided"
                      checked={learningPace === 'guided'}
                      onChange={() => setLearningPace('guided')}
                    />
                    <div>
                      <strong>Guided Support (Recommended)</strong>
                      <p>Receives step-by-step worked solutions after consecutive mistakes.</p>
                    </div>
                  </label>

                  <label className="pace-radio-option">
                    <input
                      type="radio"
                      name="pace"
                      value="standard"
                      checked={learningPace === 'standard'}
                      onChange={() => setLearningPace('standard')}
                    />
                    <div>
                      <strong>Standard Feedback</strong>
                      <p>Identifies misconceptions with conceptual hints before revealing full steps.</p>
                    </div>
                  </label>

                  <label className="pace-radio-option">
                    <input
                      type="radio"
                      name="pace"
                      value="accelerated"
                      checked={learningPace === 'accelerated'}
                      onChange={() => setLearningPace('accelerated')}
                    />
                    <div>
                      <strong>Challenge Mode</strong>
                      <p>Minimal hints with higher-order algebraic problems.</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Notification Toggle */}
              <div className="preference-group">
                <div className="toggle-row">
                  <div>
                    <label className="pref-label">Streak & Mastery Notifications</label>
                    <p className="pref-help">Alert me when learning resources match my diagnosed misconceptions</p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle-checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="pref-footer-row">
                <Button variant="primary" size="md" onClick={handleSavePreferences}>
                  {savedSuccess ? (
                    <>
                      <Check size={16} /> Saved Successfully
                    </>
                  ) : (
                    'Save Preferences'
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};
