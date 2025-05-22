import React from 'react';

const GradientCard = ({ children, className = '' }) => (
  <div
    className={`rounded-xl shadow-lg p-6 bg-gradient-to-br from-violet-600/80 via-purple-500/80 to-fuchsia-500/80 dark:from-violet-900/80 dark:via-purple-900/80 dark:to-fuchsia-900/80 border border-white/10 backdrop-blur-md ${className}`}
    style={{ overflow: 'hidden' }}
  >
    {children}
  </div>
);

export default GradientCard; 