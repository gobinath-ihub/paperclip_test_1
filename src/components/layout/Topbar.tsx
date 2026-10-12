import React from 'react';
import {
  Menu, Bell, Sun, Moon, Monitor,
  Flame, Coins, Zap, GraduationCap, Users,
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useStudent } from '../../context/StudentContext';
import './Topbar.css';

interface TopbarProps {
  role: 'student' | 'teacher';
  onRoleChange: (role: 'student' | 'teacher') => void;
  onMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ role, onRoleChange, onMenuToggle }) => {
  const { theme, setTheme } = useTheme();
  const { studentId, setStudentId } = useStudent();
  const [showThemeMenu, setShowThemeMenu] = React.useState(false);
  const themeRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const themeIcon = theme === 'dark' ? <Moon size={18} /> : theme === 'light' ? <Sun size={18} /> : <Monitor size={18} />;

  return (
    <header className="topbar glass-strong">
      <div className="topbar-left">
        <button
          className="topbar-menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <Menu size={22} />
        </button>
        <div className="topbar-title">
          <span className="topbar-brand">Loop Learning</span>
          <span className="topbar-tagline">Smart Learning, Brighter Future</span>
        </div>
      </div>

      <div className="topbar-right">
        {/* Gamification pills (student only) */}
        {role === 'student' && (
          <>
            <select
              className="topbar-student-select"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              title="Active Student ID (Realtime Supabase Sync)"
              aria-label="Active Student Profile"
            >
              <option value="demo-001">demo-001 • Alex Johnson</option>
              <option value="demo-002">demo-002 • Sarah Chen</option>
              <option value="demo-003">demo-003 • Marcus Williams</option>
              <option value="demo-004">demo-004 • Emily Rodriguez</option>
              <option value="demo-005">demo-005 • James Kim</option>
              <option value="demo-006">demo-006 • Priya Patel</option>
            </select>

            <div className="topbar-gamification">
              <div className="topbar-pill topbar-pill-streak">
                <Flame size={14} className="animate-flame" />
                <span>3</span>
              </div>
              <div className="topbar-pill topbar-pill-coins">
                <Coins size={14} />
                <span>150</span>
              </div>
              <div className="topbar-pill topbar-pill-xp">
                <Zap size={14} />
                <span>Lvl 4</span>
              </div>
            </div>
          </>
        )}

        {/* Engine status */}
        <div className="topbar-status">
          <span className="topbar-status-dot" />
          <span className="topbar-status-text">Online</span>
        </div>

        {/* Notifications */}
        <button className="topbar-icon-btn" aria-label="Notifications">
          <Bell size={18} />
        </button>

        {/* Theme switcher */}
        <div className="topbar-theme-wrapper" ref={themeRef}>
          <button
            className="topbar-icon-btn"
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            aria-label="Toggle theme"
            aria-expanded={showThemeMenu}
          >
            {themeIcon}
          </button>
          {showThemeMenu && (
            <div className="topbar-theme-menu glass animate-fade-in">
              <button
                className={`topbar-theme-option ${theme === 'light' ? 'active' : ''}`}
                onClick={() => { setTheme('light'); setShowThemeMenu(false); }}
              >
                <Sun size={14} /> Light
              </button>
              <button
                className={`topbar-theme-option ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => { setTheme('dark'); setShowThemeMenu(false); }}
              >
                <Moon size={14} /> Dark
              </button>
              <button
                className={`topbar-theme-option ${theme === 'system' ? 'active' : ''}`}
                onClick={() => { setTheme('system'); setShowThemeMenu(false); }}
              >
                <Monitor size={14} /> System
              </button>
            </div>
          )}
        </div>

        {/* Role Segmented Selection Control */}
        <div className="topbar-role-segmented" role="radiogroup" aria-label="Role selection">
          <button
            type="button"
            role="radio"
            aria-checked={role === 'student'}
            className={`role-segment-btn ${role === 'student' ? 'active' : ''}`}
            onClick={() => onRoleChange('student')}
            title="Switch to Student Workspace"
          >
            <span className="role-segment-avatar student-avatar">
              <GraduationCap size={14} />
            </span>
            <span className="role-segment-text">Student</span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={role === 'teacher'}
            className={`role-segment-btn ${role === 'teacher' ? 'active' : ''}`}
            onClick={() => onRoleChange('teacher')}
            title="Switch to Teacher Dashboard"
          >
            <span className="role-segment-avatar teacher-avatar">
              <Users size={14} />
            </span>
            <span className="role-segment-text">Teacher</span>
          </button>
        </div>
      </div>
    </header>
  );
};
