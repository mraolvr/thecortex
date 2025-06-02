import React, { useState } from 'react';
import VisionBlock from './VisionBlock';
import ValuesGrid from './ValuesGrid';
import HabitsCarousel from './HabitsCarousel';
import PutToWorkBox from './PutToWorkBox';
import JournalAndMirror from './JournalAndMirror';
import SpiderChart from './SpiderChart';
import EmotionalCompass from './EmotionalCompass';

// Import the habits and values arrays from their respective files
import { habits } from './HabitsCarousel';
import { values } from './ValuesGrid';

const IntrospectionSection: React.FC = () => {
  // State for today's focus
  const [todayHabitFocus, setTodayHabitFocus] = useState(habits[0].id);
  const [todayValueFocus, setTodayValueFocus] = useState(values[0].id);

  // Find the selected objects
  const selectedHabit = habits.find(h => h.id === todayHabitFocus) || habits[0];
  const selectedValue = values.find(v => v.id === todayValueFocus) || values[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-300 mb-2">Introspection</h1>
      <p className="text-lg text-violet-200 mb-8 font-medium">Reflect, align, and grow—track your habits, values, and progress all in one place.</p>
      {/* Vision Block */}
      <VisionBlock />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Values Grid */}
          <ValuesGrid
            todayFocus={todayValueFocus}
            setTodayFocus={setTodayValueFocus}
          />

          {/* Habits Carousel */}
          <HabitsCarousel
            todayFocus={todayHabitFocus}
            setTodayFocus={setTodayHabitFocus}
          />

          {/* Put to Work Box */}
          <PutToWorkBox
            selectedHabit={selectedHabit}
            selectedValue={selectedValue}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Journal and Mirror */}
          <JournalAndMirror />

          {/* Spider Chart */}
          <SpiderChart />

          {/* Emotional Compass */}
          <EmotionalCompass />
        </div>
      </div>
    </div>
  );
};

export default IntrospectionSection; 