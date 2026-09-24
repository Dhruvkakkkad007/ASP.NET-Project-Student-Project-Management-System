import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MetricCard } from '../common/MetricCard';
import { Users, FolderGit2, Briefcase, ShieldCheck, UserPlus, Plus, Activity } from 'lucide-react';

export const AdminDashboard = () => {
  const { users, projects, allocations, setActiveTab } = useApp();

  const activeUsersCount = users.filter(u => u.IsActive && !u.IsDeleted).length;
  const activeProjectsCount = projects.filter(p => p.IsActive).length;
  const activeAllocationsCount = allocations.filter(a => a.Status === 'Active').length;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ShieldCheck size={24} style={{ color: 'var(--accent-primary)' }} />
            <span>Admin System Administration Portal</span>
          </h1>
          <p className="page-subtitle">Manage SPM_User records, configure SPM_Role assignments, and oversee SPM_ProjectMaster catalog definitions.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setActiveTab('allocations-api')}>
            <Briefcase size={16} />
            <span>Project Allocations (FK API)</span>
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveTab('projects')}>
            <Plus size={16} />
            <span>New Project Template</span>
          </button>
          <button className="btn btn-primary" onClick={() => setActiveTab('users')}>
            <UserPlus size={16} />
            <span>Manage System Users</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Active Users"
          value={activeUsersCount}
          subtitle="SPM_User (IsActive=1, IsDeleted=0)"
          icon={Users}
          color="indigo"
        />
        <MetricCard
          title="Project Catalog"
          value={activeProjectsCount}
          subtitle="SPM_ProjectMaster (IsActive=1)"
          icon={FolderGit2}
          color="emerald"
        />
        <MetricCard
          title="Project Allocations"
          value={activeAllocationsCount}
          subtitle="SPM_ProjectAllocation (Active)"
          icon={Briefcase}
          color="amber"
        />
        <MetricCard
          title="System Health"
          value="100%"
          subtitle="All database tables operational"
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Overview Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Recent System Users Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Recent User Registrations <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)' }}>(SPM_User)</span></h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('users')}>View All</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {users.slice(0, 5).map(user => (
              <div
                key={user.UserID}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src={user.ProfilePicturePath} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#fff' }}>{user.FullName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
                      <span>{user.UserCode}</span>
                      <span>•</span>
                      <span>{user.MobileNumber || user.Email}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-sub)' }}>
                    {user.RoleName}
                  </span>
                  <span className={`badge ${user.IsActive ? 'badge-completed' : 'badge-cancelled'}`}>
                    {user.IsActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Master Projects Quick Panel */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>SPM_ProjectMaster Catalog</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('projects')}>View Catalog</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {projects.slice(0, 4).map(proj => (
              <div
                key={proj.ProjectID}
                style={{
                  padding: '0.85rem',
                  background: 'rgba(15, 23, 42, 0.5)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{proj.ProjectTitle}</div>
                  <span className="badge badge-ongoing">{proj.Department}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tech: {proj.TechStack}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
