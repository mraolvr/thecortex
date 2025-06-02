import React, { useState } from 'react';
import DailySparkCard from './DailySparkCard.tsx';
import RabbitHoleExplorer from './RabbitHoleExplorer.tsx';
import MindMapCanvas from './MindMapCanvas.tsx';
import CuriosityJournal from './CuriosityJournal.tsx';
import RandomizerButton from './RandomizerButton.tsx';
import GlowingEffect from '../ui/GlowingEffect';
import SectionHeader from '../ui/SectionHeader';
import { Lightbulb } from 'lucide-react';

const CuriosityCorner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'explore' | 'mindmap' | 'journal'>('explore');

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <GlowingEffect gradient="linear-gradient(270deg, #a78bfa 0%, #6366f1 50%, #3b82f6 100%)">
          <SectionHeader
            title="Curiosity Corner"
            subtitle="Your personal exploration and discovery zone"
            icon={Lightbulb}
            center
            divider
          >
            <div className="mt-6">
              <DailySparkCard />
            </div>
          </SectionHeader>
        </GlowingEffect>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 border-b border-white/20">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-4 py-2 font-medium transition-all duration-200 ${
              activeTab === 'explore'
                ? 'text-gray-300 border-b-2 border-violet-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => setActiveTab('mindmap')}
            className={`px-4 py-2 font-medium transition-all duration-200 ${
              activeTab === 'mindmap'
                ? 'text-gray-300 border-b-2 border-violet-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Mind Map
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`px-4 py-2 font-medium transition-all duration-200 ${
              activeTab === 'journal'
                ? 'text-gray-300 border-b-2 border-violet-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Journal
          </button>
        </div>

        {/* Main Content Area */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-lg p-6 min-h-[600px] border border-white/20">
          {activeTab === 'explore' && (
            <div className="space-y-6">
              <RabbitHoleExplorer />
              <RandomizerButton />
            </div>
          )}
          {activeTab === 'mindmap' && <MindMapCanvas />}
          {activeTab === 'journal' && <CuriosityJournal />}
        </div>
      </div>
    </div>
  );
};

export default CuriosityCorner; 