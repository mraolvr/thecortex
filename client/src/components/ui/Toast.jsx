import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const TOAST_TYPES = {
  success: {
    icon: CheckCircle,
    className: 'bg-neutral-800 border border-neutral-600 text-white',
  },
  error: {
    icon: AlertCircle,
    className: 'bg-neutral-800 border border-neutral-600 text-white',
  },
  info: {
    icon: Info,
    className: 'bg-neutral-800 border border-neutral-600 text-white',
  },
};

export default function Toast({ message, type = 'info', onClose, duration = 5000 }) {
  const { icon: Icon, className } = TOAST_TYPES[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-3 rounded-lg ${className}`}
      >
        <Icon className="w-5 h-5" />
        <p>{message}</p>
        <button
          onClick={onClose}
          className="ml-2 hover:opacity-80 transition-opacity"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
} 