import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  onClick,
  ...props
}) {
  const baseStyles =
    'btn-app inline-flex items-center justify-center font-semibold rounded-xl whitespace-nowrap transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[32px]',
    md: 'text-sm px-4 py-2 gap-2 min-h-[40px]',
    lg: 'text-sm px-5 py-2.5 gap-2 min-h-[44px]',
  }[size] || 'text-sm px-4 py-2 gap-2 min-h-[40px]';

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  const variantStyles = {
    primary:
      'btn-primary bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-md shadow-brand-600/25 focus:ring-brand-500',
    secondary:
      'btn-secondary bg-slate-800 hover:bg-slate-900 text-white shadow-sm focus:ring-slate-500 dark:bg-slate-200 dark:hover:bg-white dark:text-slate-900',
    danger:
      'btn-danger bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-md shadow-rose-600/20 focus:ring-rose-500',
    outline:
      'btn-outline border-2 border-brand-600 bg-white text-brand-700 hover:bg-brand-50 focus:ring-brand-500 dark:bg-slate-900 dark:border-brand-400 dark:text-brand-300 dark:hover:bg-slate-800',
    ghost:
      'btn-ghost bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-400 dark:text-slate-200 dark:hover:bg-slate-800',
    success:
      'btn-success bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md shadow-emerald-600/20 focus:ring-emerald-500',
    inverse:
      'btn-inverse bg-white text-brand-700 hover:bg-brand-50 shadow-md focus:ring-white',
    banner:
      'btn-banner border-2 border-white/80 bg-transparent text-white hover:bg-white/15 focus:ring-white',
  }[variant] || 'btn-primary bg-brand-600 hover:bg-brand-700 text-white shadow-md focus:ring-brand-500';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className={`${iconSize} animate-spin shrink-0`} />
      ) : Icon ? (
        <Icon className={`${iconSize} shrink-0`} />
      ) : null}
      {children}
    </button>
  );
}
