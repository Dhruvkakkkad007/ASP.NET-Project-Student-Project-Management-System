import React from 'react';

const GlassCard = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`glass-panel rounded-2xl p-6 smooth-transition ${onClick ? 'cursor-pointer hover:translate-y-[-4px] hover:shadow-lg' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default GlassCard;
