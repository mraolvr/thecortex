import React from 'react';

const CardGradient = ({ children, className = '' }) => (
  <div className={`rounded-xl p-4 shadow-inner bg-neutral-900 border border-neutral-800 ${className}`} style={{ overflow: 'hidden' }}>
    {children}
  </div>
);

export default CardGradient; 