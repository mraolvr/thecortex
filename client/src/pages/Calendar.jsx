import { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/calendar.css';
import { GoogleOAuthProvider, GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { Plus, X, Trash2, MapPin, Clock, Calendar as CalendarIcon, CheckCircle2, List, Loader2 } from 'lucide-react';
import useTaskStore from '../stores/taskStore';
import useCalendarStore from '../stores/calendarStore';
import { motion } from 'framer-motion';
import SectionHeader from '../components/ui/SectionHeader';

const localizer = momentLocalizer(moment);

// Add isValidDate utility function
const isValidDate = (d) => {
  return d instanceof Date && !isNaN(d);
};

const GOOGLE_CLIENT_ID = '578947614910-3f4lurnl9e2s4l11efp2rn5ihh388lmc.apps.googleusercontent.com';
const REDIRECT_URI = 'http://localhost:5173';
const TOKEN_STORAGE_KEY = 'googleAccessToken';
const TOKEN_EXPIRY_KEY = 'googleAccessTokenExpiry';

// Add isTokenExpired function
const isTokenExpired = () => {
  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiryTime) return true;
  return new Date().getTime() > parseInt(expiryTime);
};

// Mock events for testing
const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Team Meeting',
    start: new Date(new Date().setHours(10, 0, 0)),
    end: new Date(new Date().setHours(11, 30, 0)),
    calendarType: 'meeting',
    description: 'Weekly team sync',
    location: 'Conference Room A'
  },
  {
    id: '2',
    title: 'Project Deadline',
    start: new Date(new Date().setHours(14, 0, 0)),
    end: new Date(new Date().setHours(15, 0, 0)),
    calendarType: 'deadline',
    description: 'Submit final project deliverables',
    location: 'Office'
  },
  {
    id: '3',
    title: 'Gym Session',
    start: new Date(new Date().setHours(17, 0, 0)),
    end: new Date(new Date().setHours(18, 30, 0)),
    calendarType: 'personal',
    description: 'Weekly workout',
    location: 'Fitness Center'
  },
  {
    id: '4',
    title: 'Family Dinner',
    start: new Date(new Date().setHours(19, 0, 0)),
    end: new Date(new Date().setHours(20, 30, 0)),
    calendarType: 'family',
    description: 'Weekly family dinner',
    location: 'Home'
  },
  {
    id: '5',
    title: 'Client Call Reminder',
    start: new Date(new Date().setHours(13, 0, 0)),
    end: new Date(new Date().setHours(13, 30, 0)),
    calendarType: 'reminder',
    description: 'Prepare for client presentation',
    location: 'Virtual Meeting'
  }
];

// Mock calendars for testing
const MOCK_CALENDARS = [
  { id: 'work', summary: 'Work Calendar' },
  { id: 'personal', summary: 'Personal Calendar' },
  { id: 'family', summary: 'Family Calendar' }
];

// Calendar color mapping
const CALENDAR_COLORS = {
  primary: '#3b82f6', // blue-500
  work: '#10b981', // emerald-500
  personal: '#8b5cf6', // violet-500
  family: '#f59e0b', // amber-500
  task: '#ef4444', // red-500
  meeting: '#ec4899', // pink-500
  deadline: '#f43f5e', // rose-500
  reminder: '#06b6d4', // cyan-500
  default: '#3b82f6', // blue-500
};

// Priority color mapping for tasks
const PRIORITY_COLORS = {
  high: '#ef4444', // red-500
  medium: '#f59e0b', // amber-500
  low: '#10b981', // emerald-500
};

// Add event type constants
const EVENT_TYPES = {
  meeting: { label: 'Meeting', color: '#ec4899' }, // pink-500
  event: { label: 'Event', color: '#8b5cf6' }, // violet-500
  doctor: { label: 'Doctor', color: '#ef4444' }, // red-500
  personal: { label: 'Personal', color: '#10b981' }, // emerald-500
  work: { label: 'Work', color: '#3b82f6' }, // blue-500
  other: { label: 'Other', color: '#f59e0b' }, // amber-500
};

// Custom event style for dark card look
const eventStyleGetter = (event) => {
  let backgroundColor;
  let textColor = '#ffffff';

  // First check for event type
  if (event.eventType && EVENT_TYPES[event.eventType]) {
    backgroundColor = EVENT_TYPES[event.eventType].color;
  }
  // Then check for task type
  else if (event.type === 'task') {
    backgroundColor = PRIORITY_COLORS[event.priority] || PRIORITY_COLORS.medium;
  }
  // Then check for calendar background color
  else if (event.backgroundColor) {
    backgroundColor = event.backgroundColor;
    textColor = event.textColor || '#ffffff';
  }
  // Finally fall back to calendar type
  else {
    backgroundColor = CALENDAR_COLORS[event.calendarType] || CALENDAR_COLORS.default;
  }
  
  return {
    style: {
      backgroundColor,
      color: textColor,
      borderRadius: '0.5rem',
      border: 'none',
      padding: '4px 8px',
      fontWeight: 500,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      opacity: event.completed ? 0.5 : 0.9,
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      '&:hover': {
        opacity: 1,
        transform: 'scale(1.02)',
      },
    },
  };
};

// Move CustomToolbar outside of CalendarPage
const CustomToolbar = ({ date, onNavigate, onView, view, setAgendaViewFilter, agendaViewFilter }) => {
  const goToBack = () => {
    const newDate = new Date(date);
    switch (view) {
      case 'month':
        newDate.setMonth(date.getMonth() - 1);
        break;
      case 'week':
        newDate.setDate(date.getDate() - 7);
        break;
      case 'day':
        newDate.setDate(date.getDate() - 1);
        break;
      default:
        newDate.setMonth(date.getMonth() - 1);
    }
    onNavigate('prev');
  };

  const goToNext = () => {
    const newDate = new Date(date);
    switch (view) {
      case 'month':
        newDate.setMonth(date.getMonth() + 1);
        break;
      case 'week':
        newDate.setDate(date.getDate() + 7);
        break;
      case 'day':
        newDate.setDate(date.getDate() + 1);
        break;
      default:
        newDate.setMonth(date.getMonth() + 1);
    }
    onNavigate('next');
  };

  const goToCurrent = () => {
    const now = new Date();
    const newDate = new Date(date);
    switch (view) {
      case 'month':
        newDate.setMonth(now.getMonth());
        newDate.setYear(now.getFullYear());
        break;
      case 'week':
        // Get the start of the current week
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        newDate.setTime(startOfWeek.getTime());
        break;
      case 'day':
        newDate.setDate(now.getDate());
        newDate.setMonth(now.getMonth());
        newDate.setYear(now.getFullYear());
        break;
      default:
        newDate.setMonth(now.getMonth());
        newDate.setYear(now.getFullYear());
    }
    onNavigate('current');
  };

  const label = () => {
    const mDate = moment(date);
    let dateLabel = '';
    
    switch (view) {
      case 'month':
        dateLabel = mDate.format('MMMM YYYY');
        break;
      case 'week':
        const endOfWeek = moment(date).add(6, 'days');
        dateLabel = `${mDate.format('MMM D')} - ${endOfWeek.format('MMM D, YYYY')}`;
        break;
      case 'day':
        dateLabel = mDate.format('dddd, MMMM D, YYYY');
        break;
      default:
        dateLabel = mDate.format('MMMM YYYY');
    }

    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-between gap-4 text-2xl font-light text-cyan-100">
          {view === 'day' ? 'Today Is ' : ''}{dateLabel}
        </span>
      </div>
    );
  };

  const handleViewChange = (newView) => {
    onView(newView);
    if (newView !== 'agenda') {
      setAgendaViewFilter('today');
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={goToBack}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
          >
            ←
          </button>
          <button
            onClick={goToCurrent}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToNext}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
          >
            →
          </button>
          {label()}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewChange('month')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              view === 'month'
                ? 'bg-blue-500 text-white'
                : 'bg-neutral-800 text-white hover:bg-neutral-700'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Month
          </button>
          <button
            onClick={() => handleViewChange('week')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              view === 'week'
                ? 'bg-blue-500 text-white'
                : 'bg-neutral-800 text-white hover:bg-neutral-700'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Week
          </button>
          <button
            onClick={() => handleViewChange('day')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              view === 'day'
                ? 'bg-blue-500 text-white'
                : 'bg-neutral-800 text-white hover:bg-neutral-700'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Day
          </button>
          <button
            onClick={() => handleViewChange('agenda')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              view === 'agenda'
                ? 'bg-blue-500 text-white'
                : 'bg-neutral-800 text-white hover:bg-neutral-700'
            }`}
          >
            <List className="w-4 h-4" />
            Agenda
          </button>
        </div>
      </div>
      {view === 'agenda' && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAgendaViewFilter('today')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              agendaViewFilter === 'today'
                ? 'bg-blue-500 text-white'
                : 'bg-neutral-800 text-white hover:bg-neutral-700'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setAgendaViewFilter('week')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              agendaViewFilter === 'week'
                ? 'bg-blue-500 text-white'
                : 'bg-neutral-800 text-white hover:bg-neutral-700'
            }`}
          >
            Week
          </button>
        </div>
      )}
    </div>
  );
};

// Add these constants
export default function CalendarPage() {
  const { allTasks, fetchSupabaseTasks, updateTask } = useTaskStore();
  const { events, setEvents, setLoading, setError } = useCalendarStore();
  const [token, setToken] = useState('');
  const [calendars, setCalendars] = useState(MOCK_CALENDARS);
  const [selectedCalendar, setSelectedCalendar] = useState('work');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    description: '',
    location: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState('week');
  const [agendaViewFilter, setAgendaViewFilter] = useState('today');

  // Initialize with test event
  useEffect(() => {
    const testEvent = {
      id: 'test-1',
      title: 'Test Event',
      start: new Date(),
      end: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour later
      calendarType: 'work',
      description: 'This is a test event',
      location: 'Test Location'
    };
    setEvents([testEvent]);
  }, []);

  // Debug logs
  useEffect(() => {
    console.log('Current events:', events);
    console.log('Events type:', typeof events);
    console.log('Is Array?', Array.isArray(events));
  }, [events]);

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      console.log('OAuth Success Response:', response);
      // Store token and expiry (24 hours from now)
      localStorage.setItem(TOKEN_STORAGE_KEY, response.access_token);
      localStorage.setItem(TOKEN_EXPIRY_KEY, (new Date().getTime() + 86400000).toString());
      
      setToken(response.access_token);
      await fetchCalendarData(response.access_token);
    },
    onError: (error) => {
      console.error('Login error:', error);
      setError('Google Login Failed');
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      setToken('');
    },
    scope: 'https://www.googleapis.com/auth/calendar',
    flow: 'implicit',
    popup: true,
    redirect_uri: REDIRECT_URI,
    ux_mode: 'popup',
    prompt: 'consent',
    access_type: 'offline'
  });

  // Update fetchCalendarData function
  const fetchCalendarData = async (accessToken) => {
    setLoading(true);
    try {
      // First, fetch the list of calendars
      console.log('Fetching calendar list...');
      const calendarsResponse = await axios.get('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      console.log('Calendars Response:', calendarsResponse.data);
      
      // Update the calendars state with the fetched calendars
      const fetchedCalendars = calendarsResponse.data.items.map(cal => ({
        id: cal.id,
        summary: cal.summary,
        backgroundColor: cal.backgroundColor,
        foregroundColor: cal.foregroundColor
      }));
      setCalendars(fetchedCalendars);
      
      // Fetch events for each calendar
      const allEvents = [];
      for (const calendar of fetchedCalendars) {
        console.log(`Fetching events for calendar: ${calendar.summary}`);
        const calendarResponse = await axios.get(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendar.id)}/events`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        const calendarEvents = calendarResponse.data.items
          .filter(event => event.start && event.end)
          .map(event => {
            const start = event.start.dateTime || event.start.date;
            const end = event.end.dateTime || event.end.date;
            const startDate = new Date(start);
            const endDate = new Date(end);
            
            return isValidDate(startDate) && isValidDate(endDate)
              ? {
                  id: event.id,
                  title: event.summary || 'Untitled Event',
                  start: startDate,
                  end: endDate,
                  calendarType: calendar.id,
                  description: event.description || '',
                  location: event.location || '',
                  backgroundColor: calendar.backgroundColor,
                  textColor: calendar.foregroundColor
                }
              : null;
          })
          .filter(Boolean);
        
        allEvents.push(...calendarEvents);
      }
      
      console.log('All Processed Events:', allEvents);
      setEvents(allEvents);
    } catch (err) {
      console.error('Calendar fetch error:', err);
      setError('Failed to fetch Google Calendar events');
      // Only clear token if it's an authentication error
      if (err.response?.status === 401) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
        setToken('');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update the useEffect for auto-login
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (storedToken && !isTokenExpired()) {
      setToken(storedToken);
      fetchCalendarData(storedToken);
    }
  }, []); // Empty dependency array means this runs once on mount

  // Convert tasks to calendar events
  useEffect(() => {
    const taskEvents = allTasks.map(task => ({
      id: task.id,
      title: task.title,
      start: new Date(task.due_date),
      end: new Date(new Date(task.due_date).getTime() + 60 * 60 * 1000), // 1 hour duration
      type: 'task',
      priority: task.priority,
      completed: task.status === 'done',
      description: task.description,
      project_id: task.project_id,
      source: task.source,
    }));

    setEvents(prevEvents => {
      const nonTaskEvents = prevEvents.filter(event => event.type !== 'task');
      return [...nonTaskEvents, ...taskEvents];
    });
  }, [allTasks]);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchSupabaseTasks();
  }, [fetchSupabaseTasks]);

  // Handle task completion
  const handleTaskComplete = async (taskId) => {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      await updateTask(taskId, {
        status: task.status === 'done' ? 'todo' : 'done'
      });
    } catch (err) {
      setError('Failed to update task status');
    }
  };

  // Handle event click
  const handleEventClick = (event) => {
    if (event.type === 'task') {
      handleTaskComplete(event.id);
    } else {
      setSelectedEvent(event);
      setEventDetails({
        description: event.description || '',
        location: event.location || '',
      });
      setIsEditing(true);
      setShowEventModal(true);
    }
  };

  // Handle slot click (for adding new events)
  const handleSlotClick = (slotInfo) => {
    setSelectedEvent({
      start: slotInfo.start,
      end: slotInfo.end,
      title: '',
      calendarType: selectedCalendar,
    });
    setEventDetails({
      description: '',
      location: '',
    });
    setIsEditing(false);
    setShowEventModal(true);
  };

  // Close event modal
  const handleCloseModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
    setEventDetails({
      description: '',
      location: '',
    });
    setIsEditing(false);
  };

  const handleCalendarChange = (e) => {
    setSelectedCalendar(e.target.value);
    // Optionally, filter events by calendar here if needed
  };

  // Update handleSaveEvent function
  const handleSaveEvent = async () => {
    setIsSaving(true);
    try {
      // Validate dates before saving
      if (!isValidDate(selectedEvent.start) || !isValidDate(selectedEvent.end)) {
        setError('Please provide valid start and end dates.');
        setIsSaving(false);
        return;
      }

      if (isEditing) {
        // Update existing event
        const updatedEvents = events.map(event => 
          event.id === selectedEvent.id ? { 
            ...selectedEvent, 
            ...eventDetails,
            eventType: selectedEvent.eventType || 'other' // Ensure event type is saved
          } : event
        );
        setEvents(updatedEvents);
      } else {
        // Create new event
        const newEvent = {
          id: `event-${Date.now()}`,
          ...selectedEvent,
          ...eventDetails,
          eventType: selectedEvent.eventType || 'other' // Ensure event type is saved
        };
        setEvents(prevEvents => [...prevEvents, newEvent]);
      }
      handleCloseModal();
    } catch (error) {
      setError('Failed to save event');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Place this function here, inside CalendarPage:
  const getFilteredEvents = () => {
    if (agendaViewFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return events.filter(event => 
        event.start >= today && event.start < tomorrow
      ).sort((a, b) => a.start - b.start);
    } else if (agendaViewFilter === 'week') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      return events.filter(event => 
        event.start >= weekStart && event.start < weekEnd
      ).sort((a, b) => a.start - b.start);
    }
    return events.sort((a, b) => a.start - b.start);
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-neutral-950 p-8 font-sans">
        <div className="max-w-[1600px] mx-auto">
          <SectionHeader 
            title="Calendar"
            subtitle="View and manage your schedule and tasks"
          >
            <div className="flex items-center gap-4">
              {!token && (
                <button
                  onClick={login}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <CalendarIcon className="w-5 h-5" />
                  Connect to Google
                </button>
              )}
              {token && (
                <div className="flex items-center gap-4">
                  <select
                    value={selectedCalendar}
                    onChange={handleCalendarChange}
                    className="p-3 rounded-lg bg-neutral-800 text-black border border-neutral-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {calendars.map(cal => (
                      <option key={cal.id} value={cal.id}>{cal.summary}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleSlotClick({ start: new Date(), end: new Date() })}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Event
                  </button>
                </div>
              )}
            </div>
          </SectionHeader>

          <div className="grid grid-cols-[1fr_400px] gap-6">
            <div className="bg-neutral-900 rounded-2xl shadow-xl p-6 border border-neutral-800">
              <BigCalendar
                localizer={localizer}
                events={Array.isArray(events) ? events.filter(e => isValidDate(e.start) && isValidDate(e.end)) : []}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 1000, width: 1300 }}
                eventPropGetter={eventStyleGetter}
                components={{
                  toolbar: (props) => (
                    <CustomToolbar
                      {...props}
                      setAgendaViewFilter={setAgendaViewFilter}
                      agendaViewFilter={agendaViewFilter}
                    />
                  )
                }}
                onSelectEvent={handleEventClick}
                onSelectSlot={handleSlotClick}
                selectable
                className="calendar-app"
                views={['month', 'week', 'day']}
                defaultView="week"
                min={new Date(0, 0, 0, 7, 0, 0)}
                max={new Date(0, 0, 0, 18, 0, 0)}
                step={60}
                timeslots={1}
              />
            </div>

            {/* Agenda Section */}
            <div className="bg-neutral-900 rounded-2xl shadow-xl p-6 border border-neutral-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Upcoming Events</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAgendaViewFilter('today')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      agendaViewFilter === 'today'
                        ? 'bg-blue-500 text-white'
                        : 'bg-neutral-800 text-white hover:bg-neutral-700'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setAgendaViewFilter('week')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      agendaViewFilter === 'week'
                        ? 'bg-blue-500 text-white'
                        : 'bg-neutral-800 text-white hover:bg-neutral-700'
                    }`}
                  >
                    Week
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {getFilteredEvents().map((event) => (
                  <div
                    key={event.id}
                    className="bg-neutral-800 rounded-lg p-3 hover:bg-neutral-700 transition-colors cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: event.backgroundColor || CALENDAR_COLORS[event.calendarType] || CALENDAR_COLORS.default
                          }}
                        />
                        <h3 className="font-medium text-white">{event.title}</h3>
                      </div>
                      <span className="text-sm text-neutral-400">
                        {moment(event.start).format('h:mm A')} - {moment(event.end).format('h:mm A')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Event Modal */}
          {showEventModal && selectedEvent && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-cyan-900 rounded-xl p-6 w-full max-w-md border border-neutral-800 shadow-2xl"
                style={{ maxHeight: '90vh', overflowY: 'auto' }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    {isEditing ? 'Edit Event' : 'New Event'}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={selectedEvent.title}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Event title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1">
                      Event Type
                    </label>
                    <select
                      value={selectedEvent.eventType || 'other'}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, eventType: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      {Object.entries(EVENT_TYPES).map(([type, { label }]) => (
                        <option key={type} value={type} className="bg-neutral-900 text-black">{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1">
                      Calendar
                    </label>
                    <select
                      value={selectedEvent.calendarType}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, calendarType: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      {calendars.map(cal => (
                        <option key={cal.id} value={cal.id} className="bg-neutral-900 text-black">{cal.summary}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black-400 mb-1">
                        Start
                      </label>
                      <input
                        type="datetime-local"
                        value={moment(selectedEvent.start).format('YYYY-MM-DDTHH:mm')}
                        onChange={(e) => setSelectedEvent({ ...selectedEvent, start: new Date(e.target.value) })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-400 mb-1">
                        End
                      </label>
                      <input
                        type="datetime-local"
                        value={moment(selectedEvent.end).format('YYYY-MM-DDTHH:mm')}
                        onChange={(e) => setSelectedEvent({ ...selectedEvent, end: new Date(e.target.value) })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-400 mb-1">
                      Description
                    </label>
                    <textarea
                      value={eventDetails.description}
                      onChange={(e) => setEventDetails({ ...eventDetails, description: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      rows={3}
                      placeholder="Add event description..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black-400 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={eventDetails.location}
                      onChange={(e) => setEventDetails({ ...eventDetails, location: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Add event location..."
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-neutral-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEvent}
                      disabled={isSaving}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Save Event
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
} 