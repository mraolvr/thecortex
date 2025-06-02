import React from 'react';
import { ChevronLeft, ChevronRight, Target, Sparkles, ArrowRight } from 'lucide-react';
import PropTypes from 'prop-types';

export interface Value {
  id: string;
  name: string;
  definition: string;
  prompt: string;
  gradient: string;
}

export const values: Value[] = [
  {
    id: '1',
    name: 'Service',
    definition: 'Dedication to uplifting others and creating positive impact through selfless action.',
    prompt: 'How can I serve someone else\'s needs before my own today?',
    gradient: 'from-violet-500/20 to-fuchsia-500/20'
  },
  {
    id: '2',
    name: 'Empowerment',
    definition: 'Enabling others to discover and reach their full potential through support and guidance.',
    prompt: 'What opportunity can I create for someone to grow and succeed today?',
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    id: '3',
    name: 'Clarity',
    definition: 'Bringing understanding and focus to complex situations, making the path forward clear.',
    prompt: 'How can I bring more clarity to a challenging situation today?',
    gradient: 'from-emerald-500/20 to-teal-500/20'
  },
  {
    id: '4',
    name: 'Creativity',
    definition: 'Approaching challenges with innovative thinking and unique solutions.',
    prompt: 'Where can I apply creative thinking to unlock new possibilities today?',
    gradient: 'from-amber-500/20 to-orange-500/20'
  },
  {
    id: '5',
    name: 'Growth',
    definition: 'Continuous learning and development, both personally and in helping others grow.',
    prompt: 'What step can I take today to foster growth in myself or others?',
    gradient: 'from-rose-500/20 to-pink-500/20'
  }
];

interface ValuesGridProps {
  todayFocus: string;
  setTodayFocus: (id: string) => void;
}

const ValuesGrid: React.FC<ValuesGridProps> = ({ todayFocus, setTodayFocus }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [hoveredValue, setHoveredValue] = React.useState<string | null>(null);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % values.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + values.length) % values.length);

  // Split values into two rows
  const firstRowValues = values.slice(currentIndex, currentIndex + 2);
  const secondRowValues = values.slice(currentIndex + 2, currentIndex + 4);

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-8">
        <div className="relative">
          <h3 className="text-2xl font-medium text-gray-300">Core Values</h3>
          <p className="text-gray-400 text-sm mt-1">Your guiding principles for servant leadership</p>
          <div className="absolute -left-4 -top-4 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl" />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={prevSlide}
            className="p-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="p-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-all duration-300 hover:scale-110"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* First Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {firstRowValues.map((value) => (
            <div
              key={value.id}
              onMouseEnter={() => setHoveredValue(value.id)}
              onMouseLeave={() => setHoveredValue(null)}
              className={`relative group bg-gradient-to-br ${value.gradient} backdrop-blur-sm rounded-xl border border-white/20 p-6 transition-all duration-500 ${
                value.id === todayFocus 
                  ? 'ring-2 ring-violet-500 shadow-lg shadow-violet-500/20 scale-105' 
                  : 'hover:shadow-lg hover:shadow-white/5 hover:scale-[1.02]'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-medium text-gray-300 group-hover:text-white transition-colors duration-300">
                      {value.name}
                    </h4>
                    <div className="h-1 w-12 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full mt-2" />
                  </div>
                  {value.id === todayFocus && (
                    <div className="flex items-center gap-1 text-violet-400">
                      <Target className="w-5 h-5" />
                      <span className="text-sm font-medium">Focus</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-400 mb-6 group-hover:text-gray-300 transition-colors duration-300">
                  {value.definition}
                </p>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 group-hover:border-white/20 transition-colors duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-violet-300" />
                    <p className="text-sm text-violet-300 font-medium">Today's Prompt</p>
                  </div>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                    {value.prompt}
                  </p>
                </div>
                {value.id !== todayFocus && (
                  <button
                    onClick={() => setTodayFocus(value.id)}
                    className="mt-6 w-full py-2.5 text-sm font-medium text-violet-300 hover:text-white transition-all duration-300 border border-violet-500/20 rounded-lg hover:bg-violet-500/20 hover:border-violet-500/40 group-hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    Set as Today's Focus
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {secondRowValues.map((value) => (
            <div
              key={value.id}
              onMouseEnter={() => setHoveredValue(value.id)}
              onMouseLeave={() => setHoveredValue(null)}
              className={`relative group bg-gradient-to-br ${value.gradient} backdrop-blur-sm rounded-xl border border-white/20 p-6 transition-all duration-500 ${
                value.id === todayFocus 
                  ? 'ring-2 ring-violet-500 shadow-lg shadow-violet-500/20 scale-105' 
                  : 'hover:shadow-lg hover:shadow-white/5 hover:scale-[1.02]'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-medium text-gray-300 group-hover:text-white transition-colors duration-300">
                      {value.name}
                    </h4>
                    <div className="h-1 w-12 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full mt-2" />
                  </div>
                  {value.id === todayFocus && (
                    <div className="flex items-center gap-1 text-violet-400">
                      <Target className="w-5 h-5" />
                      <span className="text-sm font-medium">Focus</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-400 mb-6 group-hover:text-gray-300 transition-colors duration-300">
                  {value.definition}
                </p>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 group-hover:border-white/20 transition-colors duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-violet-300" />
                    <p className="text-sm text-violet-300 font-medium">Today's Prompt</p>
                  </div>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                    {value.prompt}
                  </p>
                </div>
                {value.id !== todayFocus && (
                  <button
                    onClick={() => setTodayFocus(value.id)}
                    className="mt-6 w-full py-2.5 text-sm font-medium text-violet-300 hover:text-white transition-all duration-300 border border-violet-500/20 rounded-lg hover:bg-violet-500/20 hover:border-violet-500/40 group-hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    Set as Today's Focus
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

ValuesGrid.propTypes = {
  todayFocus: PropTypes.string.isRequired,
  setTodayFocus: PropTypes.func.isRequired,
};

export default ValuesGrid; 