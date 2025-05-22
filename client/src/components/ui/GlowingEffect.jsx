import PropTypes from 'prop-types';
import { cn } from '../../utils/cn';

export default function GlowingEffect({ children, className = '', gradient }) {
  // Use a default animated purple/blue gradient if none provided
  const gradientClass = gradient
    ? ''
    : 'before:bg-[linear-gradient(270deg,_#a78bfa_0%,_#6366f1_50%,_#3b82f6_100%)] before:animate-gradient-move';

  return (
    <div
      className={cn(
        'relative group',
        'before:absolute before:-inset-x-1 before:top-4 before:bottom-0', // Pull the glow down
        'before:-z-10 before:rounded-xl',
        gradientClass,
        gradient
          ? `before:bg-[${gradient}]`
          : '',
        'before:blur-2xl before:opacity-75',
        'before:transition-all before:duration-500',
        'hover:before:opacity-100',
        className
      )}
    >
      {children}
      <style global="true">{`
        @keyframes gradient-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .before\:animate-gradient-move:before {
          background-size: 200% 200%;
          animation: gradient-move 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

GlowingEffect.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  gradient: PropTypes.string,
}; 