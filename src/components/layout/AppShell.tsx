import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNavigation } from './MobileNavigation';
import './AppShell.css';

interface AppShellProps {
  children: React.ReactNode;
  role: 'student' | 'teacher';
  onRoleChange: (role: 'student' | 'teacher') => void;
}

export const AppShell: React.FC<AppShellProps> = ({ children, role, onRoleChange }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="app-main">
        <Topbar
          role={role}
          onRoleChange={onRoleChange}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="app-content" id="main-content">
          {children}
        </main>
      </div>

      <MobileNavigation role={role} />

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
