import React from 'react';

const GradientCard = ({ children, className = '' }) => (
  <div
    className={`rounded-xl shadow-lg p-6 bg-neutral-900 border border-neutral-800 ${className}`}
    style={{ overflow: 'hidden' }}
  >
    {children}
  </div>
);

export default GradientCard; 