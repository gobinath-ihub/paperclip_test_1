import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { OnboardingTour } from './components/common/OnboardingTour';
import { StudentProvider } from './context/StudentContext';

// Student Pages
import { StudentHome } from './pages/student/StudentHome';
import { PracticePage } from './pages/student/PracticePage';
import { HistoryPage } from './pages/student/HistoryPage';
import { ResourcesPage } from './pages/student/ResourcesPage';
import { ProfilePage } from './pages/student/ProfilePage';

// Teacher Pages
import { TeacherHomePage } from './pages/teacher/TeacherHomePage';
import { StudentsPage } from './pages/teacher/StudentsPage';
import { AnalyticsPage } from './pages/teacher/AnalyticsPage';
import { InterventionsPage } from './pages/teacher/InterventionsPage';
import { StudentDetailPage } from './pages/teacher/StudentDetailPage';

// Not Found
import { NotFound } from './pages/NotFound';

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [showTour, setShowTour] = useState(false);

  // Sync role based on current URL
  useEffect(() => {
    if (location.pathname.startsWith('/teacher')) {
      setRole('teacher');
    } else if (location.pathname.startsWith('/student')) {
      setRole('student');
    }
  }, [location.pathname]);

  // Handle tour first-visit detection
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('et03_tour_completed');
    if (!hasSeenTour) {
      setShowTour(true);
    }
  }, []);

  const handleCloseTour = () => {
    localStorage.setItem('et03_tour_completed', 'true');
    setShowTour(false);
  };

  const handleRoleChange = (newRole: 'student' | 'teacher') => {
    setRole(newRole);
    if (newRole === 'teacher') {
      navigate('/teacher');
    } else {
      navigate('/student');
    }
  };

  return (
    <>
      <AppShell role={role} onRoleChange={handleRoleChange}>
        <Routes>
          {/* Default redirect to student experience */}
          <Route path="/" element={<Navigate to="/student" replace />} />

          {/* Student Routes */}
          <Route path="/student" element={<StudentHome />} />
          <Route path="/student/practice" element={<PracticePage />} />
          <Route path="/student/history" element={<HistoryPage />} />
          <Route path="/student/resources" element={<ResourcesPage />} />
          <Route path="/student/profile" element={<ProfilePage />} />

          {/* Teacher Routes */}
          <Route path="/teacher" element={<TeacherHomePage />} />
          <Route path="/teacher/students" element={<StudentsPage />} />
          <Route path="/teacher/analytics" element={<AnalyticsPage />} />
          <Route path="/teacher/interventions" element={<InterventionsPage />} />
          <Route path="/teacher/students/:studentId" element={<StudentDetailPage />} />

          {/* Fallback 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppShell>

      <OnboardingTour isOpen={showTour} onClose={handleCloseTour} />
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <StudentProvider>
        <AppContent />
      </StudentProvider>
    </BrowserRouter>
  );
}
