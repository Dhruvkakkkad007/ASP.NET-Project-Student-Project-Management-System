import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ compact = false, className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`btn-app inline-flex items-center gap-2 rounded-full border-2 font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-500/50 ${
        compact ? 'p-2' : 'pl-1 pr-3 py-1'
      } ${
        isDark
          ? 'bg-slate-800 border-amber-400 text-amber-200 hover:bg-slate-700'
          : 'bg-white border-slate-800 text-slate-800 hover:bg-slate-100 shadow-sm'
      } ${className}`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full ${
          isDark ? 'bg-amber-400 text-slate-900' : 'bg-slate-900 text-white'
        }`}
      >
        {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
      </span>
      {!compact && (
        <span className="text-xs hidden sm:inline">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
}
