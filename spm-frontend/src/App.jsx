import React, { useState, useContext } from 'react';
import { DatabaseProvider } from './context/DatabaseContext';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Layout from './components/Layout';

// Import Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RoleManagement from './pages/RoleManagement';
import UserManagement from './pages/UserManagement';
import RolePermissions from './pages/RolePermissions';
import ProjectManagement from './pages/ProjectManagement';
import TaskManagement from './pages/TaskManagement';
import ScoresRemarks from './pages/ScoresRemarks';
import Profile from './pages/Profile';

const AppContent = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'roles':
        return <RoleManagement />;
      case 'users':
        return <UserManagement />;
      case 'students':
        return <UserManagement roleFilter="Student" />;
      case 'faculty':
        return <UserManagement roleFilter="Faculty" />;
      case 'permissions':
        return <RolePermissions />;
      case 'projects':
        return <ProjectManagement />;
      case 'tasks':
        return <TaskManagement />;
      case 'scores':
        return <ScoresRemarks />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderActiveTab()}
    </Layout>
  );
};

function App() {
  return (
    <DatabaseProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </DatabaseProvider>
  );
}

export default App;
