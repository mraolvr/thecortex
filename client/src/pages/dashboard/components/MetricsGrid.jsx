import PropTypes from 'prop-types';

export default function MetricsGrid({ metrics }) {
  if (!metrics?.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {metric.label}
          </h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  );
}

MetricsGrid.propTypes = {
  metrics: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ),
}; 