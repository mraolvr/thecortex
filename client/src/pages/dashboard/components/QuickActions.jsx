import { Link } from 'react-router-dom';

export default function QuickActions() {
  const actions = [
    { label: 'New Task', path: '/work/new', icon: '📝' },
    { label: 'New Note', path: '/creative/new', icon: '📓' },
    { label: 'Add Book', path: '/books/new', icon: '📚' },
    { label: 'Upload File', path: '/media/upload', icon: '📁' },
    { label: 'Add Contact', path: '/contacts', icon: '👥' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => (
        <Link
          key={action.path}
          to={action.path}
          className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <span className="text-2xl mr-3">{action.icon}</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {action.label}
          </span>
        </Link>
      ))}
    </div>
  );
} 