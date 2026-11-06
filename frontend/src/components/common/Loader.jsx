import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({
  text = 'Loading data...',
  fullScreen = false,
  className = '',
}) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-600">{text}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-2" />
      {text && <p className="text-xs text-slate-500 font-medium">{text}</p>}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 rounded-md ${className}`}
    />
  );
}

