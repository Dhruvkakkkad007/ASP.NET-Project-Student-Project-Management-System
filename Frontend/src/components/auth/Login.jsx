import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, GraduationCap, UserCheck, Lock, Mail, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export const Login = () => {
  const { login } = useApp();
  const [selectedRoleID, setSelectedRoleID] = useState(3); // Default Student (3)
  const [emailOrCode, setEmailOrCode] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const roles = [
    {
      roleID: 1,
      roleName: 'Admin',
      icon: Shield,
      color: '#818cf8',
      bg: 'rgba(99, 102, 241, 0.12)',
      border: 'rgba(99, 102, 241, 0.3)',
      placeholderEmail: 'admin@university.edu',
      placeholderCode: 'ADM-001'
    },
    {
      roleID: 2,
      roleName: 'Faculty',
      icon: GraduationCap,
      color: '#34d399',
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.3)',
      placeholderEmail: 's.jenkins@university.edu',
      placeholderCode: 'FAC-101'
    },
    {
      roleID: 3,
      roleName: 'Student',
      icon: UserCheck,
      color: '#fbbf24',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.3)',
      placeholderEmail: 'alex.rivera@student.edu',
      placeholderCode: 'STU-2021-042'
    }
  ];

  const currentRoleInfo = roles.find(r => r.roleID === selectedRoleID) || roles[2];

  const handleRoleSelect = (roleID) => {
    setSelectedRoleID(roleID);
    setErrorMessage(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage(null);
    const result = login(emailOrCode, password, selectedRoleID);
    if (!result.success) {
      setErrorMessage(result.message);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: 'radial-gradient(ellipse at top left, #1e1b4b 0%, #0f172a 50%, #020617 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Ambient Glow Elements */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '25%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '25%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ width: '100%', maxWidth: '480px', zIndex: 10 }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: '#fff',
              boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.5)',
              marginBottom: '1rem'
            }}
          >
            <Sparkles size={30} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
            SPM System Portal
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Student Project Management System
          </p>
        </div>

        {/* Centered Login Card */}
        <div
          className="glass-panel"
          style={{
            padding: '2.25rem',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>
              Account Sign In
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Select your role tab and enter your registered credentials.
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              padding: '0.35rem',
              background: 'rgba(15, 23, 42, 0.7)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              border: '1px solid var(--border-color)'
            }}
          >
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRoleID === role.roleID;
              return (
                <button
                  key={role.roleID}
                  type="button"
                  onClick={() => handleRoleSelect(role.roleID)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.65rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? `1px solid ${role.color}` : '1px solid transparent',
                    background: isSelected ? role.bg : 'transparent',
                    color: isSelected ? role.color : 'var(--text-sub)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.8rem',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={18} />
                  <span>{role.roleName}</span>
                </button>
              );
            })}
          </div>

          {/* Error Feedback Alert */}
          {errorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                fontSize: '0.85rem',
                marginBottom: '1.25rem'
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={14} style={{ color: 'var(--accent-primary)' }} />
                Email Address or User Code
              </label>
              <input
                type="text"
                className="input-field"
                placeholder={`e.g. ${currentRoleInfo.placeholderEmail} or ${currentRoleInfo.placeholderCode}`}
                required
                value={emailOrCode}
                onChange={(e) => setEmailOrCode(e.target.value)}
              />
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Lock size={14} style={{ color: 'var(--accent-primary)' }} />
                Account Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Enter account password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                height: '46px',
                fontSize: '0.95rem',
                fontWeight: 700,
                marginTop: '0.5rem',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Footer Info */}
          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.725rem',
              color: 'var(--text-muted)'
            }}
          >
            <span>Darshan University • 2401CS521</span>
            <span>Semester - 5 SPM Database Design</span>
          </div>
        </div>
      </div>
    </div>
  );
};
