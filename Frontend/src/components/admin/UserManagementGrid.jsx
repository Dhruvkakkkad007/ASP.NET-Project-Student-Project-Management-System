import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import {
  Users, UserPlus, ToggleLeft, ToggleRight, Trash2,
  Phone, Mail, Shield, GraduationCap, UserCheck, Hash
} from 'lucide-react';

export const UserManagementGrid = () => {
  const { users, roles, userTypes, toggleUserActiveStatus, softDeleteUser, createNewUser, searchTerm } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  const [newUserForm, setNewUserForm] = useState({
    FullName: '',
    Email: '',
    Password: '',
    MobileNumber: '',
    RoleID: '3', // Default Student
    Department: 'Computer Science',
    ProfilePicturePath: ''
  });

  const activeUsers = users.filter(u => !u.IsDeleted);

  const filteredUsers = searchTerm
    ? activeUsers.filter(u =>
        u.FullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.UserCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.MobileNumber && u.MobileNumber.includes(searchTerm))
      )
    : activeUsers;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newUserForm.FullName || !newUserForm.Email) return;
    createNewUser(newUserForm);
    setShowAddModal(false);
    setNewUserForm({
      FullName: '',
      Email: '',
      Password: '',
      MobileNumber: '',
      RoleID: '3',
      Department: 'Computer Science',
      ProfilePicturePath: ''
    });
  };

  const roleColors = {
    1: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8', Icon: Shield },
    2: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', Icon: GraduationCap },
    3: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', Icon: UserCheck }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users size={24} style={{ color: 'var(--accent-primary)' }} />
            <span>User Management <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>(SPM_User)</span></span>
          </h1>
          <p className="page-subtitle">
            Manage user credentials, UserTypeID, MobileNumber, IsActive, and IsDeleted status per SPM_User schema.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <UserPlus size={16} />
          <span>Register New User</span>
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Profile & UserCode</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Role (SPM_Role)</th>
                <th>Dept</th>
                <th>IsActive</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => {
                const rc = roleColors[user.RoleID] || roleColors[3];
                return (
                  <tr key={user.UserID}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={user.ProfilePicturePath}
                          alt=""
                          style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${rc.color}40` }}
                        />
                        <div>
                          <span className="badge" style={{ background: 'rgba(255,255,255,0.08)', fontSize: '0.7rem' }}>
                            {user.UserCode}
                          </span>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            ID #{user.UserID}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{user.FullName}</td>
                    <td style={{ fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-sub)' }}>
                        <Mail size={12} style={{ color: 'var(--text-muted)' }} />
                        {user.Email}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-sub)' }}>
                        <Phone size={12} style={{ color: 'var(--text-muted)' }} />
                        {user.MobileNumber || '—'}
                      </div>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: rc.bg,
                          color: rc.color,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <rc.Icon size={12} />
                        {user.RoleName}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>{user.Department}</td>
                    <td>
                      <button
                        onClick={() => toggleUserActiveStatus(user.UserID)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          cursor: 'pointer',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          background: user.IsActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: user.IsActive ? '#34d399' : '#f87171',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          border: 'none'
                        }}
                      >
                        {user.IsActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        <span>{user.IsActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => softDeleteUser(user.UserID)}
                        title="Soft Delete (IsDeleted = true)"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <Modal isOpen={true} onClose={() => setShowAddModal(false)} title="Register New System User (SPM_User)">
          <form onSubmit={handleAddSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Full Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Raj Patel"
                  required
                  value={newUserForm.FullName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, FullName: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Mobile Number (MobileNumber)</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="+1 555-000-0000"
                  value={newUserForm.MobileNumber}
                  onChange={(e) => setNewUserForm({ ...newUserForm, MobileNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Email Address *</label>
              <input
                type="email"
                className="input-field"
                placeholder="e.g. raj.patel@university.edu"
                required
                value={newUserForm.Email}
                onChange={(e) => setNewUserForm({ ...newUserForm, Email: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password (SPM_User.Password)</label>
              <input
                type="password"
                className="input-field"
                placeholder="Set initial account password"
                value={newUserForm.Password}
                onChange={(e) => setNewUserForm({ ...newUserForm, Password: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">System Role (SPM_Role)</label>
                <select
                  className="input-field"
                  value={newUserForm.RoleID}
                  onChange={(e) => setNewUserForm({ ...newUserForm, RoleID: e.target.value })}
                >
                  <option value="1">Admin</option>
                  <option value="2">Faculty</option>
                  <option value="3">Student</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Department</label>
                <select
                  className="input-field"
                  value={newUserForm.Department}
                  onChange={(e) => setNewUserForm({ ...newUserForm, Department: e.target.value })}
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Data Science">Data Science</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Profile Image URL (ProfilePicturePath)</label>
              <input
                type="text"
                className="input-field"
                placeholder="https://..."
                value={newUserForm.ProfilePicturePath}
                onChange={(e) => setNewUserForm({ ...newUserForm, ProfilePicturePath: e.target.value })}
              />
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0 0', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <UserPlus size={16} />
                <span>Register User</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
