import React, { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, Shield, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { resolveProfileImage } from '../../utils/profileImage';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-700 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left side: Hamburger & System Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <h1 className="text-sm font-semibold text-slate-800">
            Student Project Management System
          </h1>
          <p className="text-[11px] text-slate-500">
            Role: <span className="font-semibold text-brand-600">{user?.role || 'Guest'}</span>
          </p>
        </div>
      </div>

      {/* Right side: Theme toggle & user menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center border border-brand-200 overflow-hidden">
              {resolveProfileImage(user?.profilePicturePath) ? (
                <img
                  src={resolveProfileImage(user?.profilePicturePath)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.email?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <div className="hidden md:block text-left text-xs">
              <span className="block font-semibold text-slate-800 truncate max-w-[150px]">
                {user?.fullName || user?.email || 'User'}
              </span>
              <span className="block text-[10px] text-slate-500 capitalize">
                {user?.role || 'User'}
              </span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 text-xs animate-in fade-in zoom-in-95 duration-150 z-50">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <p className="font-medium text-slate-900 truncate">
                  {user?.fullName || user?.email}
                </p>
                {user?.fullName && (
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                )}
                <div className="flex items-center gap-1 mt-1 text-[11px] text-brand-600 font-semibold">
                  <Shield className="w-3 h-3" />
                  <span>{user?.role}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/profile');
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-slate-50 transition text-left"
              >
                <UserCircle className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 transition text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

