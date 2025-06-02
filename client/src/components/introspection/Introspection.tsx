import React, { useState } from 'react';
import VisionBlock from './VisionBlock';
import ValuesGrid from './ValuesGrid';
import HabitsCarousel from './HabitsCarousel';
import PutToWorkBox from './PutToWorkBox';
import JournalAndMirror from './JournalAndMirror';
import SpiderChart from './SpiderChart';
import EmotionalCompass from './EmotionalCompass';
import { BackgroundGradientAnimation } from '../ui/background-boxes';

// Import the habits and values arrays from their respective files
import { habits } from './HabitsCarousel';
import { values } from './ValuesGrid';

const Introspection: React.FC = () => {
  const mockSpiderData = {
    labels: ['love', 'Learning', 'Health', 'Relationships', 'Career', 'Creativity'],
    values: [4, 3, 5, 4, 3, 4]
  };

  // State for today's focus
  const [todayHabitFocus, setTodayHabitFocus] = useState(habits[0].id);
  const [todayValueFocus, setTodayValueFocus] = useState(values[0].id);

  // Find the selected objects
  const selectedHabit = habits.find(h => h.id === todayHabitFocus) || habits[0];
  const selectedValue = values.find(v => v.id === todayValueFocus) || values[0];

  return (
    <BackgroundGradientAnimation className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-300 mb-2">Introspection</h1>
        <p className="text-lg text-violet-200 mb-8 font-medium">Reflect, align, and grow—track your habits, values, and progress all in one place.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vision and Values Section */}
          <div className="space-y-6">
            <VisionBlock />
            <ValuesGrid
              todayFocus={todayValueFocus}
              setTodayFocus={setTodayValueFocus}
            />
          </div>

          {/* Habits and Growth Section */}
          <div className="space-y-6">
            <HabitsCarousel
              todayFocus={todayHabitFocus}
              setTodayFocus={setTodayHabitFocus}
            />
            <PutToWorkBox
              selectedHabit={selectedHabit}
              selectedValue={selectedValue}
            />
          </div>

          {/* Journal and Emotional Tracking Section */}
          <div className="space-y-6">
            <JournalAndMirror />
            <EmotionalCompass />
          </div>

          {/* Growth Visualization Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-violet-300 mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l6-6 4 4 8-8" /></svg>
              Growth Radar
            </h2>
            <SpiderChart data={mockSpiderData} />
          </div>
        </div>
      </div>
    </BackgroundGradientAnimation>
  );
};

export default Introspection; 