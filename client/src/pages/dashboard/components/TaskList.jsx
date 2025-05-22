import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

export default function TaskList({ tasks }) {
  if (!tasks?.length) {
    return (
      <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-500 dark:text-gray-400">No tasks for today</p>
        <Link
          to="/work/new"
          className="mt-4 inline-block text-blue-600 hover:text-blue-700"
        >
          Create a new task
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xl">📝</span>
                <Link
                  to={`/work/${task.id}`}
                  className="text-gray-900 dark:text-white hover:text-blue-600"
                >
                  {task.title}
                </Link>
              </div>
              <span className={`text-sm px-2 py-1 rounded-full ${
                task.status === 'completed' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {task.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

TaskList.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
    })
  ),
}; 