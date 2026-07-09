import React, { useState, useContext } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import GlassCard from '../components/common/GlassCard';
import CustomButton from '../components/common/CustomButton';
import { Search, Plus, Edit2, Trash2, ArrowLeft, Save } from 'lucide-react';

const RoleManagement = () => {
  const { roles, addRole, updateRole, deleteRole } = useContext(DatabaseContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'add' | 'edit'
  const [selectedRole, setSelectedRole] = useState(null);

  // Form Fields
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Search filter
  const filteredRoles = roles.filter(role => 
    role.RoleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (role.Description && role.Description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddNewClick = () => {
    setRoleName('');
    setDescription('');
    setError('');
    setViewMode('add');
  };

  const handleEditClick = (role) => {
    setSelectedRole(role);
    setRoleName(role.RoleName);
    setDescription(role.Description || '');
    setError('');
    setViewMode('edit');
  };

  const handleDeleteClick = (roleId) => {
    if (window.confirm('Are you sure you want to delete this role? Any users with this role might lose access.')) {
      deleteRole(roleId);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!roleName.trim()) {
      setError('Role name is required.');
      return;
    }

    // Check duplicate
    const isDuplicate = roles.some(
      r => r.RoleName.toLowerCase() === roleName.trim().toLowerCase() && 
      (viewMode === 'add' || r.RoleId !== selectedRole?.RoleId)
    );

    if (isDuplicate) {
      setError('A role with this name already exists.');
      return;
    }

    if (viewMode === 'add') {
      addRole({ RoleName: roleName.trim(), Description: description.trim() });
    } else {
      updateRole(selectedRole.RoleId, { RoleName: roleName.trim(), Description: description.trim() });
    }

    setViewMode('list');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">
            Role Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Define system authorization groups and describe access layers.
          </p>
        </div>
      </div>

      {viewMode === 'list' ? (
        <GlassCard>
          {/* Table Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl focus:outline-none focus:ring-0 smooth-transition"
              />
            </div>
            <CustomButton
              variant="primary"
              onClick={handleAddNewClick}
              icon={Plus}
              size="sm"
            >
              Add Role
            </CustomButton>
          </div>

          {/* Roles Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2 w-16">#</th>
                  <th className="pb-3 w-56">Role Name</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3 text-right pr-4 w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/30 dark:divide-white/5">
                {filteredRoles.map((role, index) => (
                  <tr key={role.RoleId} className="hover:bg-slate-100/30 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 pl-2 text-xs font-semibold text-slate-400">{index + 1}</td>
                    <td className="py-4">
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                        {role.RoleName}
                      </span>
                    </td>
                    <td className="py-4 text-xs text-slate-500 max-w-sm truncate">
                      {role.Description || 'No description provided.'}
                    </td>
                    <td className="py-4 text-right pr-4">
                      <div className="flex justify-end items-center gap-1.5">
                        <button
                          onClick={() => handleEditClick(role)}
                          className="p-1.5 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg smooth-transition"
                          title="Edit Role"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(role.RoleId)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg smooth-transition"
                          title="Delete Role"
                          disabled={role.RoleName === 'Admin'} // Protect admin role from deletion
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRoles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">
                      No roles found matching the search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      ) : (
        /* Add / Edit Form Screen */
        <GlassCard className="max-w-2xl">
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setViewMode('list')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 font-heading">
              {viewMode === 'add' ? 'Add New Role' : 'Edit Role Details'}
            </h3>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="roleName" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                Role Name
              </label>
              <input
                id="roleName"
                type="text"
                required
                placeholder="e.g. Moderator"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 smooth-transition"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase pl-1">
                Description
              </label>
              <textarea
                id="description"
                rows="4"
                placeholder="Brief summary of duties and restrictions for this role..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:bg-white focus:border-indigo-500/50 dark:focus:bg-[#12131a] dark:focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 smooth-transition resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <CustomButton
                type="submit"
                variant="primary"
                icon={Save}
                size="sm"
              >
                Save Role
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

export default RoleManagement;
