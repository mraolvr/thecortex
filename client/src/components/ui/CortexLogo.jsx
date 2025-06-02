import React from 'react';

const CortexLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="18" stroke="#7C3AED" strokeWidth="3" fill="#18181B" />
    <path d="M13 20c0-4 6-4 6 0s6 4 6 0" stroke="#7C3AED" strokeWidth="2" fill="none" strokeLinecap="round" />
    <circle cx="16" cy="20" r="1.5" fill="#7C3AED" />
    <circle cx="24" cy="20" r="1.5" fill="#7C3AED" />
  </svg>
);

export default CortexLogo; 