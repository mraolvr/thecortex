import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Filter, Trash2, RefreshCw } from 'lucide-react';
import useNotificationStore from '../../stores/notificationStore';

const NotificationHub = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedNotification, setExpandedNotification] = useState(null);
  
  const {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    // Listen for custom event to open the notification hub
    const openHandler = () => setIsExpanded(true);
    window.addEventListener('open-notification-hub', openHandler);
    return () => {
      clearInterval(interval);
      window.removeEventListener('open-notification-hub', openHandler);
    };
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'all') return true;
    return notification.type === activeFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setExpandedNotification(notification);
  };

  const handleCloseExpanded = () => {
    setExpandedNotification(null);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'calendar':
        return '📅';
      case 'task':
        return '✓';
      case 'reading':
        return '📚';
      default:
        return '🔔';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Notifications</h3>
              <div className="flex space-x-2 items-center">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={fetchNotifications}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={markAllAsRead}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  title="Mark all as read"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={clearAll}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeFilter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('calendar')}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeFilter === 'calendar'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setActiveFilter('task')}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeFilter === 'task'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                Tasks
              </button>
              <button
                onClick={() => setActiveFilter('reading')}
                className={`px-3 py-1 rounded-full text-sm ${
                  activeFilter === 'reading'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                Reading
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading notifications...</div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                    <span className="flex-1 truncate font-medium">{notification.title}</span>
                    <span className="truncate text-sm text-gray-600 dark:text-gray-300">{notification.message}</span>
                    <span className="text-xs text-gray-500 ml-2">{new Date(notification.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {expandedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getNotificationIcon(expandedNotification.type)}</span>
                <h3 className="text-xl font-semibold">{expandedNotification.title}</h3>
              </div>
              <button
                onClick={handleCloseExpanded}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {expandedNotification.message}
            </p>
            <div className="text-sm text-gray-500">
              {new Date(expandedNotification.timestamp).toLocaleString()}
            </div>
            {expandedNotification.data && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(expandedNotification.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationHub; 