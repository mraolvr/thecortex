import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Card component for consistent, beautiful UI across the app.
 * Props:
 * - icon: Lucide icon component (optional)
 * - title: string (optional)
 * - className: string (optional)
 * - children: ReactNode
 * - onClick: function (optional)
 * - role: string (optional, default 'article')
 * - tabIndex: number (optional, default 0)
 * - ariaLabel: string (optional)
 * - ariaDescribedBy: string (optional)
 * - isInteractive: boolean (optional, default false)
 */
const Card = ({ 
  icon: Icon, 
  title, 
  className = '', 
  children, 
  onClick, 
  role = 'article',
  tabIndex = 0,
  ariaLabel,
  ariaDescribedBy,
  isInteractive = false
}) => {
  const baseClasses = 'relative overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl transition-all duration-300';
  const interactiveClasses = isInteractive ? 'hover:shadow-2xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black' : '';
  
  const handleKeyDown = (event) => {
    if (isInteractive && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={role}
      tabIndex={isInteractive ? tabIndex : undefined}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      {(Icon || title) && (
        <div className="flex items-center gap-2 mb-6">
          {Icon && <Icon className="w-7 h-7 text-white" />}
          {title && <h2 className="text-2xl font-extrabold text-white drop-shadow">{title}</h2>}
        </div>
      )}
      {children}
    </motion.div>
  );
};

Card.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  role: PropTypes.string,
  tabIndex: PropTypes.number,
  ariaLabel: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  isInteractive: PropTypes.bool
};

export default Card; 