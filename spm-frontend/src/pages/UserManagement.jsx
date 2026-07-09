import React, { useState, useContext, useEffect } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import GlassCard from '../components/common/GlassCard';
import CustomButton from '../components/common/CustomButton';
import { Search, Plus, Edit2, Trash2, ArrowLeft, Save, Filter, UserPlus } from 'lucide-react';

const UserManagement = ({ roleFilter = null }) => {
  const { users, roles, addUser, updateUser, deleteUser } = useContext(DatabaseContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState(roleFilter || 'All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'add' | 'edit'
  const [selectedUser, setSelectedUser] = useState(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [userRoleId, setUserRoleId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');

  // Sync roleFilter prop if it changes
  useEffect(() => {
    if (roleFilter) {
      setSelectedRoleFilter(roleFilter);
    }
  }, [roleFilter]);

  // Filters calculation
  const filteredUsers = users.filter(user => {
    // 1. Search Query
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      user.FullName.toLowerCase().includes(query) ||
      user.Email.toLowerCase().includes(query) ||
      user.MobileNumber.includes(query);

    // 2. Role Filter
    let matchesRole = true;
    if (selectedRoleFilter !== 'All') {
      const targetRole = roles.find(r => r.RoleName === selectedRoleFilter);
      matchesRole = user.RoleId === targetRole?.RoleId;
    }

    // 3. Status Filter
    let matchesStatus = true;
    if (selectedStatusFilter !== 'All') {
      const targetStatus = selectedStatusFilter === 'Active';
      matchesStatus = user.IsActive === targetStatus;
    }

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddNewClick = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setMobileNumber('');
    
    // Set default role in form
    if (roleFilter) {
      const targetRole = roles.find(r => r.RoleName === roleFilter);
      setUserRoleId(targetRole ? targetRole.RoleId.toString() : '3');
    } else {
      setUserRoleId('3'); // Default to Student
    }
    
    setIsActive(true);
    setError('');
    setViewMode('add');
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFullName(user.FullName);
    setEmail(user.Email);
    setPassword(user.Password);
    setMobileNumber(user.MobileNumber);
    setUserRoleId(user.RoleId.toString());
    setIsActive(user.IsActive);
    setError('');
    setViewMode('edit');
  };

  const handleDeleteClick = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !password.trim() || !mobileNumber.trim() || !userRoleId) {
      setError('Please fill in all fields.');
      return;
    }

    // Check duplicate email
    const isDuplicateEmail = users.some(
      u => u.Email.toLowerCase() === email.trim().toLowerCase() && 
      (viewMode === 'add' || u.UserId !== selectedUser?.UserId)
    );

    if (isDuplicateEmail) {
      setError('A user with this email address already exists.');
      return;
    }

    const payload = {
      FullName: fullName.trim(),
      Email: email.trim(),
      Password: password,
      MobileNumber: mobileNumber.trim(),
      RoleId: Number(userRoleId),
      IsActive: isActive
    };

    if (viewMode === 'add') {
      addUser(payload);
    } else {
      updateUser(selectedUser.UserId, payload);
    }

    setViewMode('list');
  };

  // Get Page Titles dynamically
  const getPageTitle = () => {
    if (roleFilter === 'Student') return 'Student Profiles Management';
    if (roleFilter === 'Faculty') return 'Faculty Supervisor Profiles';
    return 'User Accounts Management';
  };

  const getPageSub = () => {
    if (roleFilter === 'Student') return 'Register students, manage contact details, and oversee statuses.';
    if (roleFilter === 'Faculty') return 'Review supervising advisors, expertise fields, and details.';
    return 'Configure all user details, passwords, dynamic role permissions, and active settings.';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">
            {getPageTitle()}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            {getPageSub()}
          </p>
        </div>
      </div>

      {viewMode === 'list' ? (
        <GlassCard>
          {/* Filters Toolbar */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
            
            {/* Left side: search and dropdown filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 max-w-4xl">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="Search name, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl focus:outline-none focus:ring-0 smooth-transition"
                />
              </div>

              {/* Hide role filter if we are locked into a specific role */}
              {!roleFilter ? (
                <div className="relative">
                  <select
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl focus:outline-none smooth-transition cursor-pointer appearance-none"
                  >
                    <option value="All">All Roles</option>
                    {roles.map(r => (
                      <option key={r.RoleId} value={r.RoleName}>{r.RoleName}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center px-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-indigo-500 text-xs font-semibold">
                  Locked to Role: {roleFilter}
                </div>
              )}

              <div className="relative">
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl focus:outline-none smooth-transition cursor-pointer appearance-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            {/* Right side: Add User Button */}
            <CustomButton
              variant="primary"
              onClick={handleAddNewClick}
              icon={Plus}
              size="sm"
            >
              Add {roleFilter || 'User'}
            </CustomButton>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2 w-12">#</th>
                  <th className="pb-3">User Profile</th>
                  <th className="pb-3">Mobile</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-4 w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/30 dark:divide-white/5">
                {filteredUsers.map((user, index) => {
                  const roleObj = roles.find(r => r.RoleId === user.RoleId);
                  return (
                    <tr key={user.UserId} className="hover:bg-slate-100/30 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 pl-2 text-xs font-semibold text-slate-400">{index + 1}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.ProfilePicturePath} 
                            alt={user.FullName} 
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-white/10 bg-slate-100"
                          />
                          <div>
                            <h5 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                              {user.FullName}
                            </h5>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {user.Email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-xs font-semibold text-slate-500">
                        {user.MobileNumber}
                      </td>
                      <td className="py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                          {roleObj ? roleObj.RoleName : 'Student'}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.IsActive 
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' 
                            : 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                        }`}>
                          {user.IsActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 text-right pr-4">
                        <div className="flex justify-end items-center gap-1.5">
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-1.5 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg smooth-transition"
                            title="Edit User Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user.UserId)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg smooth-transition"
                            title="Delete User"
                            disabled={user.Email === 'admin@spms.com'} // Lock main admin
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                      No accounts found matching current query and filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      ) : (
        /* Add / Edit Form */
        <GlassCard className="max-w-3xl">
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setViewMode('list')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 font-heading">
              {viewMode === 'add' ? `Register New ${roleFilter || 'User'}` : 'Modify Account Parameters'}
            </h3>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                placeholder="e.g. Rohan Mehta"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 smooth-transition"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="rohan@spms.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 smooth-transition"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="pass" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                Password
              </label>
              <input
                id="pass"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 smooth-transition"
              />
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <label htmlFor="mobile" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                Mobile Number
              </label>
              <input
                id="mobile"
                type="text"
                required
                placeholder="e.g. 9876543210"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 smooth-transition"
              />
            </div>

            {/* Role Dropdown */}
            <div className="space-y-2">
              <label htmlFor="role" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                Assigned Role
              </label>
              {roleFilter ? (
                <div className="px-4 py-3.5 bg-indigo-500/5 border border-indigo-500/10 text-indigo-500 font-semibold rounded-xl text-sm">
                  {roleFilter}
                </div>
              ) : (
                <select
                  id="role"
                  value={userRoleId}
                  onChange={(e) => setUserRoleId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none smooth-transition cursor-pointer appearance-none"
                >
                  {roles.map(r => (
                    <option key={r.RoleId} value={r.RoleId}>{r.RoleName}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Status Selector */}
            <div className="space-y-2">
              <label htmlFor="status" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                Account Status
              </label>
              <select
                id="status"
                value={isActive ? 'Active' : 'Inactive'}
                onChange={(e) => setIsActive(e.target.value === 'Active')}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none smooth-transition cursor-pointer appearance-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="col-span-1 md:col-span-2 flex gap-3 pt-4 border-t border-slate-200/50 dark:border-white/5 mt-4">
              <CustomButton
                type="submit"
                variant="primary"
                icon={Save}
                size="sm"
              >
                Save Details
              </CustomButton>
              <CustomButton
                type="button"
                variant="secondary"
                onClick={() => setViewMode('list')}
                size="sm"
              >
                Cancel
              </CustomButton>
            </div>

          </form>
        </GlassCard>
      )}
    </div>
  );
};

export default UserManagement;
