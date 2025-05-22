import React from 'react';

/**
 * Card component for consistent, beautiful UI across the app.
 * Props:
 * - accent: string (e.g. 'blue', 'green', 'purple', etc.)
 * - icon: Lucide icon component (optional)
 * - title: string (optional)
 * - className: string (optional)
 * - children: ReactNode
 * - onClick: function (optional)
 */
const Card = ({ accent = 'blue', icon: Icon, title, className = '', children, onClick }) => {
  // Tailwind color classes for accent
  const accentBorder = `border-${accent}-400 dark:border-${accent}-500`;
  const iconColor = `text-${accent}-500`;
  // Vibrant gradient for both light and dark mode
  const gradient = `bg-gradient-to-br from-violet-600/80 via-fuchsia-500/70 to-emerald-500/80 dark:from-violet-950/80 dark:via-fuchsia-900/70 dark:to-emerald-900/80`;

  return (
    <div
      className={`p-8 rounded-2xl shadow-xl ${gradient} border-l-8 ${accentBorder} backdrop-blur-md ${className}`}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      style={{ cursor: onClick ? 'pointer' : undefined }}
    >
      {(Icon || title) && (
        <div className="flex items-center gap-2 mb-6">
          {Icon && <Icon className={`w-7 h-7 ${iconColor}`} />}
          {title && <h2 className="text-2xl font-extrabold text-white drop-shadow">{title}</h2>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card; 