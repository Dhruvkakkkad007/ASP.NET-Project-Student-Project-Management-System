import React, { forwardRef } from 'react';

const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    className = '',
    required = false,
    rows = 3,
    id,
    ...props
  },
  ref
) {
  const areaId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={areaId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <textarea
        id={areaId}
        ref={ref}
        rows={rows}
        required={required}
        className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 disabled:bg-slate-50 disabled:cursor-not-allowed ${
          error
            ? 'border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20'
            : 'border-slate-300 hover:border-slate-400'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Textarea;

