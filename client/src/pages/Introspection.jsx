import React, { useState } from 'react';
import VisionBlock from '../components/introspection/VisionBlock';
import ValuesGrid from '../components/introspection/ValuesGrid';
import HabitsCarousel from '../components/introspection/HabitsCarousel';
import PutToWorkBox from '../components/introspection/PutToWorkBox';
import JournalAndMirror from '../components/introspection/JournalAndMirror';
import SpiderChart from '../components/introspection/SpiderChart';
import EmotionalCompass from '../components/introspection/EmotionalCompass';

// Import the habits and values arrays from their respective files
import { habits } from '../components/introspection/HabitsCarousel';
import { values } from '../components/introspection/ValuesGrid';
import SectionHeader from '../components/ui/SectionHeader';
import GlowingEffect from '../components/ui/GlowingEffect';

export default function Introspection() {
  const mockSpiderData = {
    labels: ['hello', 'Learning', 'Health', 'Relationships', 'Career', 'Creativity'],
    values: [4, 3, 5, 4, 3, 4]
  };

  // State for today's focus
  const [todayHabitFocus, setTodayHabitFocus] = useState(habits[0].id);
  const [todayValueFocus, setTodayValueFocus] = useState(values[0].id);

  // Find the selected objects
  const selectedHabit = habits.find(h => h.id === todayHabitFocus) || habits[0];
  const selectedValue = values.find(v => v.id === todayValueFocus) || values[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
    <GlowingEffect>
        <div className="w-full bg-gradient-to-r from-violet-700 to-fuchsia-700 rounded-xl px-8 py-8 mb-8 flex flex-col items-center shadow-lg">
          {/* Example icon: replace with your preferred icon */}
          <svg className="w-10 h-10 mb-2 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          </svg>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">Introspection</h1>
          <p className="text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300 font-medium text-center">
            Reflect, align, and grow—track your habits, values, and progress all in one place.
          </p>
          {/* Glow effect */}
          <div className="absolute -inset-8 z-0 pointer-events-none">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/30 via-cyan-400/20 to-cyan-300/10 blur-2xl opacity-80" />
          </div>
        </div>
    </GlowingEffect>

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
          <SpiderChart data={mockSpiderData} />

          {/* Emotional Compass */}
          <EmotionalCompass />
        </div>
      </div>
    </div>
  );
} 