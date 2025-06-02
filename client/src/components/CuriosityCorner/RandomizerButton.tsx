import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

// Mock data for random facts and rabbit holes
const randomContent = [
  {
    id: 1,
    type: 'fact',
    title: 'The Library of Babel',
    content: 'Jorge Luis Borges imagined a library containing every possible book that could ever be written. In reality, such a library would be larger than the observable universe.',
    tags: ['Literature', 'Mathematics', 'Philosophy']
  },
  {
    id: 2,
    type: 'rabbit-hole',
    title: 'The Infinite Hotel Paradox',
    content: 'Hilbert\'s Hotel has an infinite number of rooms, all occupied. Yet, it can still accommodate new guests through clever room reassignment. This thought experiment helps us understand different types of infinity.',
    tags: ['Mathematics', 'Philosophy', 'Logic']
  },
  {
    id: 3,
    type: 'fact',
    title: 'The Baader-Meinhof Phenomenon',
    content: 'Ever learned a new word and suddenly started seeing it everywhere? This is the frequency illusion, where your brain selectively notices things you\'ve recently become aware of.',
    tags: ['Psychology', 'Cognitive Science']
  },
  {
    id: 4,
    type: 'rabbit-hole',
    title: 'The Ship of Theseus',
    content: 'If all parts of a ship are replaced over time, is it still the same ship? This ancient thought experiment explores the nature of identity and change.',
    tags: ['Philosophy', 'Identity', 'Metaphysics']
  }
];

const RandomizerButton: React.FC = () => {
  const [showContent, setShowContent] = useState(false);
  const [currentContent, setCurrentContent] = useState<typeof randomContent[0] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [randomTopic, setRandomTopic] = useState<string | null>(null);

  const topics = [
    'The History of Time',
    'Quantum Computing Basics',
    'The Science of Dreams',
    'Artificial Intelligence Ethics',
    'The Future of Space Travel',
    'The Psychology of Creativity',
    'Climate Change Solutions',
    'The Evolution of Language',
    'The Mathematics of Music',
    'The Philosophy of Consciousness',
  ];

  const getRandomContent = () => {
    setIsLoading(true);
    setShowContent(false);

    // Simulate loading
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * randomContent.length);
      setCurrentContent(randomContent[randomIndex]);
      setShowContent(true);
      setIsLoading(false);
    }, 1000);
  };

  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * topics.length);
      setRandomTopic(topics[randomIndex]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="group relative px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg hover:from-violet-700 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          {isLoading ? 'Discovering...' : 'Discover Something New'}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg blur opacity-0 group-hover:opacity-75 transition-opacity duration-200" />
      </button>

      {randomTopic && (
        <div className="text-center">
          <p className="text-gray-400 mb-2">How about exploring:</p>
          <p className="text-xl font-semibold text-gray-300">{randomTopic}</p>
        </div>
      )}

      {showContent && currentContent && (
        <div className="bg-white rounded-lg shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-500">
                  {currentContent.type === 'fact' ? 'Random Fact' : 'Mini Rabbit Hole'}
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">
                  {currentContent.tags.join(', ')}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {currentContent.title}
              </h3>
              <p className="text-gray-600">{currentContent.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RandomizerButton; 