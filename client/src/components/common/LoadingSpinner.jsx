import PropTypes from 'prop-types';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-surface rounded-full"></div>
        <div className="w-12 h-12 border-4 border-primary rounded-full border-t-transparent animate-spin absolute top-0"></div>
      </div>
    </div>
  );
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullScreen: PropTypes.bool
}; 