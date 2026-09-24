import React from 'react';

export const Badge = ({ statusClass, text, icon: Icon }) => {
  return (
    <span className={`badge ${statusClass || 'badge-pending'}`}>
      {Icon && <Icon size={12} />}
      {text}
    </span>
  );
};
