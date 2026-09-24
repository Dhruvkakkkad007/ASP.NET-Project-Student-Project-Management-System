import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Shield, GraduationCap, UserCheck, Users } from 'lucide-react';

export const RoleManagement = () => {
  const { roles, users } = useApp();

  const roleIcons = {
    1: Shield,
    2: GraduationCap,
    3: UserCheck
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ShieldCheck size={24} style={{ color: 'var(--accent-primary)' }} />
            <span>Role & Authorization Management (`SPM_UserRole` / `SPM_Role`)</span>
          </h1>
          <p className="page-subtitle">Configure system security roles, permission matrices, and assigned user counts.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {roles.map(role => {
          const Icon = roleIcons[role.RoleID] || Shield;
          const assignedUsers = users.filter(u => u.RoleID === role.RoleID && !u.IsDeleted);

          return (
            <div key={role.RoleID} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    background: role.RoleID === 1 ? 'rgba(99, 102, 241, 0.15)' : role.RoleID === 2 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: role.RoleID === 1 ? '#818cf8' : role.RoleID === 2 ? '#34d399' : '#fbbf24',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{role.RoleName} Role</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Role ID #{role.RoleID}</div>
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                {role.Description}
              </p>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Users size={14} />
                    Assigned Persona Accounts ({assignedUsers.length})
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                  {assignedUsers.map(u => (
                    <div
                      key={u.UserID}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(15, 23, 42, 0.4)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img src={u.ProfilePicturePath} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                        <span style={{ color: '#fff' }}>{u.FullName}</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{u.UserCode}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
