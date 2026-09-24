import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeBackground } from './components/layout/ThemeBackground';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/auth/AuthModal';
import { ParentQRModal } from './components/common/ParentQRModal';
import { StudentProfileModal } from './components/teacher/StudentProfileModal';

// Views
import { LandingPage } from './components/landing/LandingPage';
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { ClassManagement } from './components/teacher/ClassManagement';
import { StudentList } from './components/teacher/StudentList';
import { QuickAssessment } from './components/teacher/QuickAssessment';
import { TeacherAIInsights } from './components/teacher/TeacherAIInsights';
import { InterventionTracker } from './components/teacher/InterventionTracker';
import { EvidencePortfolio } from './components/teacher/EvidencePortfolio';
import { ReportsAndAnalytics } from './components/teacher/ReportsAndAnalytics';
import { StudentActivityLogView } from './components/teacher/StudentActivityLogView';
import { StudentWorld } from './components/student/StudentWorld';
import { ReadingHelper } from './components/student/ReadingHelper';
import { WritingCanvas } from './components/student/WritingCanvas';
import { SpeakingBuddy } from './components/student/SpeakingBuddy';
import { ListeningBay } from './components/student/ListeningBay';
import { FirstTimerGuide } from './components/student/FirstTimerGuide';
import { StudentTaskHistoryView } from './components/student/StudentTaskHistoryView';
import { StudentGrowthSummary } from './components/student/StudentGrowthSummary';
import { StudentPortfolioView } from './components/student/StudentPortfolioView';
import { LiveDemoFlow } from './components/demo/LiveDemoFlow';
import { DelimaLoginGate } from './components/auth/DelimaLoginGate';
import { Student } from './types';

const AppContent: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    qrModalStudent,
    setQrModalStudent,
    setSelectedStudentId,
    isAuthenticated,
    currentStudent,
    students,
  } = useApp();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [profileStudent, setProfileStudent] = useState<Student | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Requirement 7: student and teacher must log in with DELIMa or moe.edu.my before using the website
  if (!isAuthenticated) {
    return (
      <ThemeBackground>
        <DelimaLoginGate />
        <ToastContainer />
      </ThemeBackground>
    );
  }

  const handleAssignInterventionFromProfile = (student: Student) => {
    setProfileStudent(null);
    setSelectedStudentId(student.id);
    setCurrentView('intervention');
  };

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onOpenAuth={() => setIsAuthOpen(true)} />;

      case 'teacher-dashboard':
        return <TeacherDashboard />;

      case 'class-management':
        return <ClassManagement />;

      case 'student-list':
        return (
          <StudentList
            onOpenStudentProfile={(student) => setProfileStudent(student)}
          />
        );

      case 'quick-assess':
        return <QuickAssessment />;

      case 'ai-insights':
        return <TeacherAIInsights />;

      case 'intervention':
        return <InterventionTracker />;

      case 'evidence-portfolio':
        return <EvidencePortfolio />;

      case 'reports':
      case 'analytics':
        return <ReportsAndAnalytics />;

      case 'student-world':
        return <StudentWorld />;

      case 'first-timer':
        return <FirstTimerGuide />;

      case 'student-reading':
      case 'reading-helper':
        return <ReadingHelper />;

      case 'student-writing':
      case 'writing-canvas':
        return <WritingCanvas />;

      case 'student-speaking':
      case 'speaking-buddy':
        return <SpeakingBuddy />;

      case 'student-listening':
        return <ListeningBay />;

      case 'task-history':
        return <StudentTaskHistoryView />;

      case 'student-activity-log':
        return <StudentActivityLogView />;

      case 'parent-summary':
        return <StudentGrowthSummary student={currentStudent || students[0]} />;

      case 'student-portfolio':
        return <StudentPortfolioView />;

      case 'live-demo':
        return <LiveDemoFlow />;

      default:
        return <TeacherDashboard />;
    }
  };

  const isLanding = currentView === 'landing';

  return (
    <ThemeBackground>
      <div className="flex flex-col min-h-screen">
        {/* Global Navigation Header */}
        <Header
          onOpenAuth={() => setIsAuthOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        {/* Main Body */}
        <div className="flex flex-1 relative">
          {/* Persistent Sidebar (hidden on Landing page) */}
          {!isLanding && (
            <Sidebar
              isOpen={isMobileMenuOpen}
              onCloseMobile={() => setIsMobileMenuOpen(false)}
              onOpenAuth={() => setIsAuthOpen(true)}
            />
          )}

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
            {renderView()}
          </main>
        </div>

        {/* Global Toasts */}
        <ToastContainer />

        {/* Auth / Account Switcher Modal */}
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

        {/* Student Full PBD Profile Modal */}
        <StudentProfileModal
          student={profileStudent}
          onClose={() => setProfileStudent(null)}
          onAssignIntervention={handleAssignInterventionFromProfile}
        />

        {/* Parent QR Code Modal */}
        <ParentQRModal
          student={qrModalStudent}
          onClose={() => setQrModalStudent(null)}
        />
      </div>
    </ThemeBackground>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
