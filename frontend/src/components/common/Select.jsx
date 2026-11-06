import React, { forwardRef } from 'react';

const Select = forwardRef(function Select(
  {
    label,
    options = [],
    error,
    helperText,
    className = '',
    required = false,
    placeholder = 'Select an option',
    id,
    ...props
  },
  ref
) {
  const selectId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        required={required}
        className={`w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 disabled:bg-slate-50 disabled:cursor-not-allowed ${
          error
            ? 'border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20'
            : 'border-slate-300 hover:border-slate-400'
        } ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const labelText = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {labelText}
            </option>
          );
        })}
      </select>
      {error ? (
        <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Select;

