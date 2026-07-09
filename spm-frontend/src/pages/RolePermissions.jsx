import React, { useState, useContext } from 'react';
import { DatabaseContext } from '../context/DatabaseContext';
import GlassCard from '../components/common/GlassCard';
import CustomButton from '../components/common/CustomButton';
import { ShieldAlert, Save, HelpCircle, Check, X } from 'lucide-react';

const INITIAL_PERMISSIONS = {
  Admin: {
    Roles: { view: true, create: true, edit: true, delete: true },
    Users: { view: true, create: true, edit: true, delete: true },
    Projects: { view: true, create: true, edit: true, delete: true },
    Tasks: { view: true, create: true, edit: true, delete: true }
  },
  Faculty: {
    Roles: { view: false, create: false, edit: false, delete: false },
    Users: { view: true, create: false, edit: false, delete: false },
    Projects: { view: true, create: true, edit: true, delete: false },
    Tasks: { view: true, create: true, edit: true, delete: true }
  },
  Student: {
    Roles: { view: false, create: false, edit: false, delete: false },
    Users: { view: false, create: false, edit: false, delete: false },
    Projects: { view: true, create: false, edit: false, delete: false },
    Tasks: { view: true, create: false, edit: false, delete: false }
  }
};

const RolePermissions = () => {
  const { roles } = useContext(DatabaseContext);
  const [permissions, setPermissions] = useState(INITIAL_PERMISSIONS);
  const [activeRole, setActiveRole] = useState('Faculty');
  const [savedMessage, setSavedMessage] = useState(false);

  const modules = ['Roles', 'Users', 'Projects', 'Tasks'];
  const actions = ['view', 'create', 'edit', 'delete'];

  const handleToggle = (role, module, action) => {
    if (role === 'Admin') return; // Admin permissions are locked

    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: {
          ...prev[role][module],
          [action]: !prev[role][module][action]
        }
      }
    }));
  };

  const handleSave = () => {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">
            Role & Permissions Matrix
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Configure action access limits (View, Create, Edit, Delete) across system modules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Role Selector */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pl-1">Select Role Class</span>
          {roles.map(r => (
            <button
              key={r.RoleId}
              onClick={() => setActiveRole(r.RoleName)}
              className={`w-full text-left px-4 py-3.5 rounded-2xl border transition-all ${
                activeRole === r.RoleName
                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500 font-bold dark:text-indigo-400'
                  : 'bg-white/50 dark:bg-white/5 border-slate-200/50 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <h5 className="text-sm">{r.RoleName}</h5>
              <p className="text-[10px] opacity-70 mt-1 font-normal">{r.Description || 'No description.'}</p>
            </button>
          ))}
        </div>

        {/* Right Side: Permissions Matrix */}
        <GlassCard className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6 border-b border-slate-200/50 dark:border-white/5 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-200 font-heading">
                {activeRole} Access Policy
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {activeRole === 'Admin' 
                  ? '⚠️ System-critical Admin permissions are locked and cannot be disabled.' 
                  : 'Toggle modules access items below to adjust roles capabilities.'}
              </p>
            </div>
            
            {activeRole !== 'Admin' && (
              <CustomButton
                variant="primary"
                onClick={handleSave}
                icon={Save}
                size="sm"
              >
                Apply Policies
              </CustomButton>
            )}
          </div>

          {savedMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              ✓ Security matrices applied successfully to {activeRole} role.
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">System Module</th>
                  {actions.map(act => (
                    <th key={act} className="pb-3 text-center uppercase tracking-widest">{act}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/30 dark:divide-white/5">
                {modules.map(mod => (
                  <tr key={mod} className="hover:bg-slate-100/30 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 pl-2 font-semibold text-sm text-slate-800 dark:text-slate-200">{mod}</td>
                    {actions.map(act => {
                      const isAllowed = permissions[activeRole]?.[mod]?.[act];
                      const isAdminRole = activeRole === 'Admin';
                      return (
                        <td key={act} className="py-4 text-center">
                          <button
                            type="button"
                            disabled={isAdminRole}
                            onClick={() => handleToggle(activeRole, mod, act)}
                            className={`w-9 h-9 rounded-xl border flex items-center justify-center mx-auto transition-all ${
                              isAllowed
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                                : 'bg-rose-500/5 border-rose-500/10 text-rose-500 dark:text-rose-500/60'
                            } ${isAdminRole ? 'opacity-80 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                          >
                            {isAllowed ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex gap-3 text-amber-600 dark:text-amber-500 text-xs leading-relaxed">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <div>
              <strong className="block mb-0.5">Policy Notice</strong>
              Permission changes affect endpoints authentication policies globally. Assure you align changes with ASP.NET core routing attributes definitions.
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};

export default RolePermissions;
