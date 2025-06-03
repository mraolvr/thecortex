import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import useCalendarStore from '../../stores/calendarStore';
import { format, isToday, isThisWeek } from 'date-fns';
import { Calendar, Clock, RefreshCw, Plus, X, LogIn } from 'lucide-react';

const TodayAgenda = () => {
  const { theme, accentColor } = useTheme();
  const { events, fetchEvents, isLoading, error } = useCalendarStore();
  const [view, setView] = useState('today');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('googleAccessToken');
    setIsAuthenticated(!!token);
    if (token) {
      fetchEvents();
    }
  }, [fetchEvents]);

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.start);
    return view === 'today' ? isToday(eventDate) : isThisWeek(eventDate);
  }).sort((a, b) => new Date(a.start) - new Date(b.start));

  const handleRefresh = () => {
    fetchEvents();
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const getEventColor = (eventType) => {
    const colors = {
      meeting: '#ec4899', // pink-500
      event: '#8b5cf6', // violet-500
      doctor: '#ef4444', // red-500
      personal: '#10b981', // emerald-500
      work: '#3b82f6', // blue-500
      other: '#f59e0b', // amber-500
      default: '#6b7280' // gray-500
    };
    return colors[eventType] || colors.default;
  };

  if (isLoading) {
    return (
      <div className="p-4 rounded-lg shadow-md bg-white dark:bg-gray-800">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg shadow-md bg-white dark:bg-gray-800">
        <div className="text-red-500">Error loading agenda: {error}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-8 rounded-2xl shadow-xl bg-gradient-to-br from-white/80 via-blue-50/80 to-emerald-100/80 dark:from-gray-900/80 dark:via-gray-800/80 dark:to-emerald-900/80 border-l-8 border-emerald-400 dark:border-emerald-500 backdrop-blur-md">
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
            Connect to Google Calendar to view your agenda
          </div>
          <button
            onClick={() => window.location.href = '/calendar'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            Connect Calendar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 rounded-2xl shadow-xl bg-gradient-to-br from-white/80 via-blue-50/80 to-emerald-100/80 dark:from-gray-900/80 dark:via-gray-800/80 dark:to-emerald-900/80 border-l-8 border-emerald-400 dark:border-emerald-500 backdrop-blur-md max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2 drop-shadow">
          <Calendar className="w-7 h-7 text-emerald-500" /> Today's Agenda
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900 hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
            aria-label="Refresh agenda"
          >
            <RefreshCw className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
          </button>
          <button
            onClick={() => setView(view === 'today' ? 'week' : 'today')}
            className="px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-200 font-semibold shadow"
          >
            {view === 'today' ? 'Today' : 'This Week'}
          </button>
          <button
            onClick={() => window.location.href = '/calendar'}
            className="p-2 rounded-full bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
            aria-label="Add event"
          >
            <Plus className="h-5 w-5 text-purple-600 dark:text-purple-300" />
          </button>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
            Nothing for {view === 'today' ? 'today' : 'this week'} yet
          </div>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Click the + button to add an event
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map(event => (
            <div
              key={event.id}
              onClick={() => handleEventClick(event)}
              className="p-4 rounded-xl border-l-4 shadow bg-white/80 dark:bg-gray-900/80 flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer transition-colors"
              style={{ borderColor: getEventColor(event.eventType) }}
            >
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: getEventColor(event.eventType) }}></span>
              <span className="flex-1 truncate font-semibold text-lg text-gray-900 dark:text-white">{event.title}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
              </span>
              {event.location && (
                <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{event.location}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedEvent.title}</h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <Clock className="h-5 w-5 mr-2" />
                <span>
                  {format(new Date(selectedEvent.start), 'h:mm a')} - {format(new Date(selectedEvent.end), 'h:mm a')}
                </span>
              </div>
              {selectedEvent.location && (
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
              {selectedEvent.description && (
                <div className="text-gray-600 dark:text-gray-300">
                  <p>{selectedEvent.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayAgenda; 