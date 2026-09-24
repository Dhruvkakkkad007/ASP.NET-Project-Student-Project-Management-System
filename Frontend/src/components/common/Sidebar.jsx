import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FolderGit2,
  KanbanSquare,
  Award,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
  LogOut
} from 'lucide-react';

export const Sidebar = () => {
  const { currentRoleID, activeTab, setActiveTab, logout, currentUser } = useApp();

  const getMenuItems = () => {
    const apiModules = [
      { id: 'allocations-api', label: 'Allocations (FK API)', icon: Briefcase },
      { id: 'tasks-api', label: 'Project Tasks (FK API)', icon: Layers }
    ];

    if (currentRoleID === 1) { // Admin
      return [
        { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'roles', label: 'Role Assignment', icon: ShieldCheck },
        { id: 'projects', label: 'Project Catalog', icon: FolderGit2 },
        ...apiModules
      ];
    } else if (currentRoleID === 2) { // Faculty
      return [
        { id: 'dashboard', label: 'Allocations Overview', icon: Briefcase },
        { id: 'tasks', label: 'Task Management', icon: Layers },
        { id: 'evaluation', label: 'Evaluation & Grading', icon: Award },
        ...apiModules
      ];
    } else { // Student
      return [
        { id: 'dashboard', label: 'My Progress Dashboard', icon: LayoutDashboard },
        { id: 'kanban', label: 'Interactive Task Board', icon: KanbanSquare },
        { id: 'timeline', label: 'Task Lifecycle Timeline', icon: Clock },
        ...apiModules
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside
      style={{
        width: '260px',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem'
      }}
    >
      {/* Brand Logo */}
      <div style={{ padding: '0 0.75rem 1.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: 'var(--shadow-glow)',
            flexShrink: 0
          }}
        >
          <Sparkles size={22} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em' }}>
            SPM System
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Student Project Management
          </div>
        </div>
      </div>

      {/* Dynamic Navigation Menu */}
      <nav style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', padding: '0 0.75rem 0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Menu Navigation
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.75rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                color: isActive ? '#fff' : 'var(--text-sub)',
                background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.05) 100%)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s ease',
                textAlign: 'left',
                cursor: 'pointer'
              }}
            >
              <Icon size={18} style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Info & Logout */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Current User Info */}
        {currentUser && (
          <div
            className="glass-panel"
            style={{
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}
          >
            <img
              src={currentUser.ProfilePicturePath}
              alt={currentUser.FullName}
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.FullName}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                {currentUser.UserCode}
              </div>
            </div>
          </div>
        )}

        {/* Sign Out Button */}
        <button
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-md)',
            color: '#f87171',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>

        {/* System Status */}
        <div
          className="glass-panel"
          style={{
            padding: '0.75rem',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-sub)' }}>React SPA • Vite</span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b' }}>SPM Database Schema v1.0</div>
        </div>
      </div>
    </aside>
  );
};
