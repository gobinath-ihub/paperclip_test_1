import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home, BookOpen, Clock, Library, User,
  LayoutDashboard, Users, BarChart3, Lightbulb,
} from 'lucide-react';
import './MobileNavigation.css';

interface MobileNavigationProps {
  role: 'student' | 'teacher';
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
  { to: '/teacher/interventions', icon: Lightbulb, label: 'Actions' },
];

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ role }) => {
  const navItems = role === 'teacher' ? teacherNav : studentNav;

  return (
    <nav className="mobile-nav glass-strong" aria-label="Mobile navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `mobile-nav-link ${isActive ? 'mobile-nav-link-active' : ''}`
          }
        >
          <item.icon size={20} />
          <span className="mobile-nav-label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
