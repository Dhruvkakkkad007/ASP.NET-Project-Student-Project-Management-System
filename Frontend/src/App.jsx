import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Login } from './components/auth/Login';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserManagementGrid } from './components/admin/UserManagementGrid';
import { RoleManagement } from './components/admin/RoleManagement';
import { ProjectCatalog } from './components/admin/ProjectCatalog';

// Faculty Components
import { FacultyDashboard } from './components/faculty/FacultyDashboard';

// Student Components
import { StudentDashboard } from './components/student/StudentDashboard';
import { KanbanBoard } from './components/student/KanbanBoard';
// Foreign Key API Consuming Modules
import { ProjectAllocationModule } from './components/allocations/ProjectAllocationModule';
import { ProjectTaskModule } from './components/tasks/ProjectTaskModule';

import { CheckCircle2 } from 'lucide-react';

const AppContent = () => {
  const { isAuthenticated, currentRoleID, activeTab, toastMessage } = useApp();

  // If user is not authenticated, display the Login Screen
  if (!isAuthenticated) {
    return <Login />;
  }

  const renderActiveView = () => {
    // Shared Foreign Key API Consumption modules
    if (activeTab === 'allocations-api') return <ProjectAllocationModule />;
    if (activeTab === 'tasks-api') return <ProjectTaskModule />;

    if (currentRoleID === 1) { // Admin
      switch (activeTab) {
        case 'users': return <UserManagementGrid />;
        case 'roles': return <RoleManagement />;
        case 'projects': return <ProjectCatalog />;
        case 'dashboard':
        default: return <AdminDashboard />;
      }
    } else if (currentRoleID === 2) { // Faculty
      switch (activeTab) {
        case 'tasks':
        case 'evaluation':
        case 'dashboard':
        default: return <FacultyDashboard />;
      }
    } else { // Student
      switch (activeTab) {
        case 'kanban': return <KanbanBoard />;
        case 'timeline': return <TaskTimeline />;
        case 'dashboard':
        default: return <StudentDashboard />;
      }
    }
  };

  return (
    <div className="app-container">
      {/* Left Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="main-layout">
        <Navbar />

        <main className="page-content">
          {renderActiveView()}
        </main>
      </div>

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="toast-container">
          <CheckCircle2 size={18} style={{ color: '#344399' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
