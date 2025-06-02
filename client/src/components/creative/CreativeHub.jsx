import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, BookOpen, Plus } from 'lucide-react';
import GlowingEffect from '../ui/GlowingEffect';
import SectionHeader from '../ui/SectionHeader';
import SongSection from './SongSection';
import WritingSection from './WritingSection';

export default function CreativeHub() {
  const [activeSection, setActiveSection] = useState('songs'); // 'songs' or 'writing'

  return (
    <div className="min-h-screen bg-neutral-1200 p-8">
      <GlowingEffect>
        <div className="max-w-[1600px] mx-auto">
          <SectionHeader 
            title="Creative Hub"
            subtitle="Your space for songwriting and creative writing"
            center
            icon={Music}
            divider
          />

          {/* Navigation Tabs */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setActiveSection('songs')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'songs'
                  ? 'bg-primary text-white'
                  : 'bg-background hover:bg-background-light text-neutral'
              }`}
            >
              <Music className="w-5 h-5" />
              <span>Songs</span>
            </button>
            <button
              onClick={() => setActiveSection('writing')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'writing'
                  ? 'bg-primary text-white'
                  : 'bg-background hover:bg-background-light text-neutral'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>Writing</span>
            </button>
          </div>

          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeSection === 'songs' ? (
              <SongSection />
            ) : (
              <WritingSection />
            )}
          </motion.div>
        </div>
      </GlowingEffect>
    </div>
  );
} 