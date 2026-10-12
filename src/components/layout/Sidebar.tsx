import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, BookOpen, Clock, Library, User,
  LayoutDashboard, Users, BarChart3, Lightbulb,
  GraduationCap, X,
} from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  role: 'student' | 'teacher';
  isOpen: boolean;
  onClose: () => void;
}

const studentNav = [
  { to: '/student', icon: Home, label: 'Home', end: true },
  { to: '/student/practice', icon: BookOpen, label: 'Practice' },
  { to: '/student/history', icon: Clock, label: 'History' },
  { to: '/student/resources', icon: Library, label: 'Resources' },
  { to: '/student/profile', icon: User, label: 'Profile' },
];

const teacherNav = [
  { to: '/teacher', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/teacher/students', icon: Users, label: 'Students' },
  { to: '/teacher/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/teacher/interventions', icon: Lightbulb, label: 'Interventions' },
];

export const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, onClose }) => {
  const location = useLocation();
  const navItems = role === 'teacher' ? teacherNav : studentNav;

  return (
    <aside className={`sidebar glass-strong ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <GraduationCap size={24} />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">Loop Learning</span>
            <span className="sidebar-brand-sub">Live Learning</span>
          </div>
        </div>
        <button
          className="sidebar-close-btn"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="sidebar-nav" aria-label={`${role} navigation`}>
        <ul className="sidebar-nav-list">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `sidebar-nav-link ${isActive ? 'sidebar-nav-link-active' : ''}`
                }
                onClick={onClose}
              >
                <item.icon size={20} className="sidebar-nav-icon" />
                <span className="sidebar-nav-label">{item.label}</span>
                {(item.to === '/student' || item.to === '/teacher') &&
                  location.pathname === item.to && (
                    <span className="sidebar-nav-indicator" />
                  )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-badge">
          <span className="sidebar-footer-dot" />
          <span className="sidebar-footer-text">Learning engine online</span>
        </div>
      </div>
    </aside>
  );
};
