import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import { Sun, Moon, RefreshCw } from 'lucide-react';

const motivationalQuotes = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
  "The future depends on what you do today. - Mahatma Gandhi",
  "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
  "The only limit to our realization of tomorrow will be our doubts of today. - Franklin D. Roosevelt"
];
const mentorMessages = [
  "Clarity precedes mastery—know your ‘why’ and the ‘how’ will follow",
  "Leadership is not about being in charge; it's about taking care of those in your charge.",
  "Success is the result of disciplined people making disciplined choices.",
  "Your habits create your future; change your habits, change your life.",
  "The key to developing your emotional intelligence is to become aware of your emotions and those of others."
  ];

const WelcomeBanner = () => {
  const { theme, accentColor } = useTheme();
  const { user, profile } = useUser();
  const [quote, setQuote] = React.useState('');
  const [mentorMessage, setMentorMessage] = React.useState('');
  const [loadingQuote, setLoadingQuote] = React.useState(false);
  const [loadingMentor, setLoadingMentor] = React.useState(false);
  const [errorQuote, setErrorQuote] = React.useState('');
  const [errorMentor, setErrorMentor] = React.useState('');

  React.useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getTimeIcon = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) return <Sun className="w-8 h-8 text-yellow-400 drop-shadow" />;
    return <Moon className="w-8 h-8 text-blue-400 drop-shadow" />;
  };

  // Fetch Book Quote
  const fetchQuote = async () => {
    setLoadingQuote(true);
    setErrorQuote('');
    try {
      const response = await fetch('https://n8n.srv758866.hstgr.cloud/webhook/5844ef21-b17a-4c41-a25f-52af9ce25eff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote: 'please provide a poignet and actionable quote for the day' })
      });
      const data = await response.json();
      // The webhook returns { quote: ... }
      setQuote(data.quote ? data.quote.replace(/^"|"$/g, '') : 'No quote found.');
    } catch (err) {
      setErrorQuote('Failed to fetch quote.');
    }
    setLoadingQuote(false);
  };

  // Fetch Mentor Message
  const fetchMentorMessage = async () => {
    setLoadingMentor(true);
    setErrorMentor('');
    try {
      const response = await fetch('https://n8n.srv758866.hstgr.cloud/webhook/c9e2a340-b812-49c2-ae05-80aeadede4e7', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Please provide me with some simple inspiration for today. Something poignet and actionable to make me better. ' })
      });
      const data = await response.json();
      // The webhook returns { content: ... }
      setMentorMessage(data.content ? data.content.replace(/^"|"$/g, '') : 'No message found.');
    } catch (err) {
      setErrorMentor('Failed to fetch mentor message.');
    }
    setLoadingMentor(false);
  };

  return (
    <div className="p-8 rounded-2xl shadow-xl bg-gradient-to-br from-white/80 via-blue-50/80 to-purple-100/80 dark:from-gray-900/80 dark:via-gray-800/80 dark:to-purple-900/80 border-l-8 border-blue-400 dark:border-purple-500 backdrop-blur-md">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            {getTimeIcon()}
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight drop-shadow">
              {getTimeBasedGreeting()}, {profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Guest'}
            </h1>
          </div>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quote Section */}
        <div className="bg-white/70 dark:bg-gray-900/70 p-6 rounded-xl shadow flex flex-col items-center">
          <span className="text-sm text-neutral mb-1 font-semibold">Quote</span>
          <div className="text-lg text-gray-700 dark:text-gray-200 italic text-center min-h-[60px] flex items-center justify-center">
            {loadingQuote ? 'Loading...' : errorQuote ? errorQuote : `"${quote}"`}
          </div>
          <button
            onClick={fetchQuote}
            disabled={loadingQuote}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            <RefreshCw className="w-4 h-4" />
            New Quote
          </button>
        </div>
        {/* Mentor Message Section */}
        <div className="bg-white/70 dark:bg-gray-900/70 p-6 rounded-xl shadow flex flex-col items-center">
          <span className="text-sm text-neutral mb-1 font-semibold">Mentor Message</span>
          <div className="text-lg text-gray-700 dark:text-gray-200 italic text-center min-h-[60px] flex items-center justify-center">
            {loadingMentor ? 'Loading...' : errorMentor ? errorMentor : mentorMessage ? mentorMessage : mentorMessages[Math.floor(Math.random() * mentorMessages.length)]}
          </div>
          <button
            onClick={fetchMentorMessage}
            disabled={loadingMentor}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            <RefreshCw className="w-4 h-4" />
            New Mentor Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner; 