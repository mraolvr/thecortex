import { create } from 'zustand';

const useCalendarStore = create((set) => ({
  events: [],
  loading: false,
  error: null,
  setEvents: (events) => set({ events: Array.isArray(events) ? events : [] }),
  addEvent: (event) => set((state) => ({ events: [...(Array.isArray(state.events) ? state.events : []), event] })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearEvents: () => set({ events: [] }),
  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('googleAccessToken');
      if (!token) {
        set({ error: 'No Google Calendar access token found', loading: false });
        return;
      }

      // First, get the list of calendars to find "My Calendar"
      const calendarsResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/users/me/calendarList',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!calendarsResponse.ok) {
        throw new Error('Failed to fetch calendar list');
      }

      const calendarsData = await calendarsResponse.json();
      const myCalendar = calendarsData.items.find(cal => cal.summary === 'My Calendar');
      
      if (!myCalendar) {
        throw new Error('My Calendar not found');
      }

      // Fetch events from My Calendar
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(myCalendar.id)}/events?timeMin=${new Date().toISOString()}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch calendar events');
      }

      const data = await response.json();
      
      // Transform the events to match our format
      const transformedEvents = data.items.map(event => ({
        id: event.id,
        title: event.summary || 'Untitled Event',
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        description: event.description || '',
        location: event.location || '',
        eventType: event.eventType || 'other',
        calendarType: 'myCalendar'
      }));

      set({ events: transformedEvents, loading: false });
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      set({ error: error.message, loading: false, events: [] });
    }
  },
}));

export default useCalendarStore; 