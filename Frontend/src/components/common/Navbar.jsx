import React from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Bell, Shield, GraduationCap, UserCheck, LogOut } from 'lucide-react';

export const Navbar = () => {
  const { currentRoleID, currentUser, logout, searchTerm, setSearchTerm } = useApp();

  const roleLabels = {
    1: { name: 'Admin Portal', icon: Shield, color: '#818cf8', bg: 'rgba(99, 102, 241, 0.15)' },
    2: { name: 'Faculty Portal', icon: GraduationCap, color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)' },
    3: { name: 'Student Portal', icon: UserCheck, color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)' }
  };

  const activeRoleInfo = roleLabels[currentRoleID] || roleLabels[3];
  const RoleIcon = activeRoleInfo.icon;

  return (
    <header
      style={{
        height: '70px',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      {/* Search Input Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '320px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search projects, tasks, users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '36px', height: '38px', borderRadius: 'var(--radius-full)' }}
          />
        </div>
      </div>

      {/* Right Controls: Role Switcher, Persona & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Active Portal Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            background: activeRoleInfo.bg,
            border: `1px solid ${activeRoleInfo.color}40`,
            color: activeRoleInfo.color,
            fontSize: '0.825rem',
            fontWeight: 600
          }}
        >
          <RoleIcon size={16} />
          <span>{activeRoleInfo.name}</span>
        </div>

        {/* Notifications Icon */}
        <div style={{ position: 'relative', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <Bell size={20} />
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--accent-primary)'
            }}
          />
        </div>

        {/* Profile Avatar & Details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--border-color)' }}>
          <img
            src={currentUser?.ProfilePicturePath}
            alt={currentUser?.FullName}
            style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-full)', objectFit: 'cover', border: '2px solid var(--border-light)' }}
          />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{currentUser?.FullName}</div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="badge" style={{ padding: '1px 5px', fontSize: '0.65rem', background: 'rgba(255,255,255,0.08)' }}>
                {currentUser?.UserCode}
              </span>
            </div>
          </div>
        </div>

        {/* Logout Action Button */}
        <button
          onClick={logout}
          title="Sign Out of SPM System"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.8rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
