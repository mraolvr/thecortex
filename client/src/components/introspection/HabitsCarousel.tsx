import React from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import PropTypes from 'prop-types';

export interface Habit {
  id: string;
  name: string;
  description: string;
  dailyPractice: string;
}

export const habits: Habit[] = [
  {
    id: '1',
    name: 'Fast',
    description: 'Respond quickly and efficiently to opportunities and challenges.',
    dailyPractice: 'Identify and act on one opportunity within the first hour of your day.'
  },
  {
    id: '2',
    name: 'Authentic',
    description: 'Maintain genuine connections and honest communication.',
    dailyPractice: 'Share one genuine thought or feeling in a conversation today.'
  },
  {
    id: '3',
    name: 'Agile',
    description: 'Adapt quickly to changing circumstances and requirements.',
    dailyPractice: 'Practice pivoting your approach when faced with an unexpected change.'
  },
  {
    id: '4',
    name: 'Solver',
    description: 'Approach problems with creative and effective solutions.',
    dailyPractice: 'Tackle one complex problem with a fresh perspective.'
  },
  {
    id: '5',
    name: 'Anticipator',
    description: 'Proactively identify and prepare for future needs.',
    dailyPractice: 'Identify one potential future challenge and prepare a solution.'
  },
  {
    id: '6',
    name: 'Prepared',
    description: 'Stay ready for opportunities and challenges.',
    dailyPractice: 'Review and update your preparation for tomorrow\'s key activities.'
  },
  {
    id: '7',
    name: 'Self-aware',
    description: 'Maintain conscious understanding of your thoughts and actions.',
    dailyPractice: 'Take 5 minutes to reflect on your emotional state and reactions.'
  },
  {
    id: '8',
    name: 'Curious',
    description: 'Continuously seek new knowledge and perspectives.',
    dailyPractice: 'Learn something new about a topic outside your expertise.'
  },
  {
    id: '9',
    name: 'Connected',
    description: 'Build and maintain meaningful relationships.',
    dailyPractice: 'Reach out to one person you haven\'t connected with recently.'
  },
  {
    id: '10',
    name: 'Likable',
    description: 'Create positive and memorable interactions.',
    dailyPractice: 'Make someone\'s day better through a small act of kindness.'
  },
  {
    id: '11',
    name: 'Productive',
    description: 'Maximize impact through focused and efficient work.',
    dailyPractice: 'Complete one high-impact task before checking email.'
  },
  {
    id: '12',
    name: 'Purpose Driven',
    description: 'Align actions with your core mission and values.',
    dailyPractice: 'Review how today\'s activities align with your vision.'
  }
];

interface HabitsCarouselProps {
  todayFocus: string;
  setTodayFocus: (id: string) => void;
}

const HabitsCarousel: React.FC<HabitsCarouselProps> = ({ todayFocus, setTodayFocus }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % habits.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + habits.length) % habits.length);

  const visibleHabits = [
    ...habits.slice(currentIndex),
    ...habits.slice(0, currentIndex)
  ].slice(0, 3);

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-medium text-gray-300">Daily Habits</h3>
        <div className="flex items-center gap-2">
          <button onClick={prevSlide} className="p-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={nextSlide} className="p-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {visibleHabits.map((habit) => (
          <div
            key={habit.id}
            className={`bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-4 ${habit.id === todayFocus ? 'ring-2 ring-violet-500' : ''}`}
          >
            <div className="flex items-start justify-between">
              <h4 className="text-lg font-medium text-gray-300">{habit.name}</h4>
              {habit.id === todayFocus && <Star className="w-5 h-5 text-violet-500" />}
            </div>
            <p className="text-gray-400 mt-2">{habit.description}</p>
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <p className="text-sm text-gray-300 font-medium">Daily Practice:</p>
              <p className="text-sm text-gray-400 mt-1">{habit.dailyPractice}</p>
            </div>
            {habit.id !== todayFocus && (
              <button
                onClick={() => setTodayFocus(habit.id)}
                className="mt-4 w-full py-2 text-sm text-gray-300 hover:text-violet-400 transition-colors"
              >
                Set as Today's Focus
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

HabitsCarousel.propTypes = {
  todayFocus: PropTypes.string.isRequired,
  setTodayFocus: PropTypes.func.isRequired,
};

export default HabitsCarousel; 