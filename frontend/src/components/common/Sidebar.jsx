import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  GitFork,
  CheckSquare,
  Users,
  Shield,
  ShieldAlert,
  UserCheck,
  Tag,
  Flag,
  X,
  GraduationCap,
  ClipboardList,
  Star,
  ArrowRightLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, hasRole } = useAuth();

  const navSections = [
    {
      title: 'Main',
      items: [
        {
          name: 'Dashboard',
          path: '/dashboard',
          icon: LayoutDashboard,
          roles: ['Admin', 'Faculty', 'Student'],
        },
        {
          name: 'Projects',
          path: '/projects',
          icon: FolderKanban,
          roles: ['Admin', 'Faculty', 'Student'],
        },
        {
          name: 'Project Allocations',
          path: '/allocations',
          icon: GitFork,
          roles: ['Admin', 'Student'],
        },
        {
          name: 'Tasks & Progress',
          path: '/tasks',
          icon: CheckSquare,
          roles: ['Admin', 'Faculty', 'Student'],
        },
      ],
    },
    {
      title: 'Faculty Panel',
      items: [
        {
          name: 'My Students',
          path: '/faculty/students',
          icon: Users,
          roles: ['Faculty'],
        },
        {
          name: 'Evaluate Projects',
          path: '/faculty/evaluate',
          icon: Star,
          roles: ['Faculty'],
        },
        {
          name: 'Switch Requests',
          path: '/faculty/switch-requests',
          icon: ArrowRightLeft,
          roles: ['Faculty'],
        },
      ],
    },
    {
      title: 'Administration',
      items: [
        {
          name: 'Users Directory',
          path: '/users',
          icon: Users,
          roles: ['Admin'],
        },
        {
          name: 'Project Allocations',
          path: '/admin/allocations',
          icon: GitFork,
          roles: ['Admin'],
        },
        {
          name: 'User Types',
          path: '/admin/user-types',
          icon: UserCheck,
          roles: ['Admin'],
        },
        {
          name: 'Roles',
          path: '/admin/roles',
          icon: Shield,
          roles: ['Admin'],
        },
        {
          name: 'User Role Mappings',
          path: '/admin/user-roles',
          icon: ShieldAlert,
          roles: ['Admin'],
        },
        {
          name: 'Task Statuses',
          path: '/admin/task-statuses',
          icon: Tag,
          roles: ['Admin'],
        },
        {
          name: 'Task Priorities',
          path: '/admin/task-priorities',
          icon: Flag,
          roles: ['Admin'],
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block leading-tight">
                SPMS
              </span>
              <span className="text-[10px] text-brand-300 font-medium uppercase tracking-wider block">
                Project Portal
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card in sidebar */}
        <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-600/30 text-brand-400 font-bold text-xs flex items-center justify-center border border-brand-500/30">
            {(user?.fullName || user?.email)?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">
              {user?.fullName || user?.email || 'Logged In'}
            </p>
            <span className="inline-block text-[10px] uppercase font-bold text-brand-400">
              {user?.role || 'Guest'}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          {navSections.map((sec, secIdx) => {
            const filteredItems = sec.items.filter((item) =>
              hasRole(item.roles)
            );
            if (filteredItems.length === 0) return null;

            return (
              <div key={secIdx}>
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {sec.title}
                </p>
                <div className="space-y-1">
                  {filteredItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => {
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-brand-600 text-white font-semibold shadow-sm shadow-brand-600/30'
                              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-400 text-center">
          <span className="font-semibold text-slate-300">SPMS .NET 10 & React</span>
          <br />
          v1.0.0
        </div>
      </aside>
    </>
  );
}

