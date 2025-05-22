import React from 'react';

const gradientMap = {
  goals: 'bg-gradient-to-br from-yellow-400/90 via-pink-400/80 to-fuchsia-500/80',
  tasks: 'bg-gradient-to-br from-yellow-400/90 via-pink-400/80 to-fuchsia-500/80',
  reading: 'bg-gradient-to-br from-yellow-400/90 via-pink-400/80 to-fuchsia-500/80',
  linkedin: 'bg-gradient-to-br from-blue-500/90 via-blue-400/80 to-cyan-300/80',
  twitter: 'bg-gradient-to-br from-sky-400/90 via-blue-300/80 to-blue-500/80',
  posthistory: 'bg-gradient-to-br from-gray-700/90 via-purple-700/80 to-fuchsia-700/80',
  welcome: 'bg-gradient-to-br from-violet-600/90 via-purple-600/80 to-fuchsia-600/80',
  updates: 'bg-gradient-to-br from-orange-400/90 via-pink-400/80 to-fuchsia-500/80',
  stats: 'bg-gradient-to-br from-green-400/90 via-blue-400/80 to-cyan-500/80',
  notifications: 'bg-gradient-to-br from-pink-500/90 via-purple-500/80 to-fuchsia-600/80',
  agenda: 'bg-gradient-to-br from-teal-400/90 via-blue-400/80 to-violet-500/80',
  default: 'bg-gradient-to-br from-gray-800/90 via-gray-700/80 to-gray-900/80',
};

const CardGradient = ({ type = 'default', children, className = '' }) => (
  <div className={`rounded-xl p-4 shadow-inner ${gradientMap[type] || gradientMap.default} ${className}`} style={{ overflow: 'hidden' }}>
    {children}
  </div>
);

export default CardGradient; 