import React from 'react';
import useNotificationStore from '../../stores/notificationStore';
import GradientCard from './GradientCard';

const NotificationCard = () => {
  const { notifications, loading, error } = useNotificationStore();
  const recentNotifications = notifications.slice(0, 3);

  const handleViewAll = () => {
    // Dispatch a custom event to open the NotificationHub dropdown in the header
    window.dispatchEvent(new CustomEvent('open-notification-hub'));
  };

  return (
    <GradientCard>
      <h2 className="text-xl font-semibold mb-4 text-white">Notifications</h2>
      {loading ? (
        <div className="text-gray-200">Loading...</div>
      ) : error ? (
        <div className="text-red-200">{error}</div>
      ) : recentNotifications.length === 0 ? (
        <div className="text-gray-200">No notifications</div>
      ) : (
        <ul className="divide-y divide-white/10 mb-4">
          {recentNotifications.map((notification) => (
            <li key={notification.id} className="py-2">
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {notification.type === 'calendar' && '📅'}
                  {notification.type === 'task' && '✓'}
                  {notification.type === 'reading' && '📚'}
                  {!['calendar','task','reading'].includes(notification.type) && '🔔'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-white">{notification.title}</div>
                  <div className="text-xs text-violet-100 truncate">{notification.message}</div>
                </div>
                <span className="text-xs text-fuchsia-100 ml-2 whitespace-nowrap">
                  {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={handleViewAll}
        className="mt-2 w-full py-2 rounded-lg bg-white/20 text-white font-semibold hover:bg-white/30 transition-colors backdrop-blur"
      >
        View All
      </button>
    </GradientCard>
  );
};

export default NotificationCard; 