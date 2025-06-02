import React, { useState } from 'react';
import GlowingEffect from '../ui/GlowingEffect';
import SectionHeader from '../ui/SectionHeader';
import { Search } from 'lucide-react';

// Mock data for related topics
const mockRelatedTopics = {
  'time perception': {
    summary: 'Time perception is a field of study within psychology and neuroscience that refers to the subjective experience of time, which is measured by someone\'s own perception of the duration of the indefinite and continuous unfolding of events.',
    relatedTopics: [
      'Circadian Rhythms',
      'Biological Clocks',
      'Time Dilation',
      'Psychological Time',
      'Temporal Illusions'
    ],
    tags: ['Psychology', 'Neuroscience', 'Physics', 'Philosophy']
  },
  'quantum mechanics': {
    summary: 'Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles.',
    relatedTopics: [
      'Wave-Particle Duality',
      'Quantum Entanglement',
      'Superposition',
      'Quantum Computing',
      'Quantum Field Theory'
    ],
    tags: ['Physics', 'Science', 'Technology', 'Mathematics']
  }
};

const RabbitHoleExplorer: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [results, setResults] = useState<null | typeof mockRelatedTopics[keyof typeof mockRelatedTopics]>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const lowerTopic = topic.toLowerCase();
      const result = mockRelatedTopics[lowerTopic as keyof typeof mockRelatedTopics];
      setResults(result || null);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <GlowingEffect gradient="linear-gradient(270deg, #a78bfa 0%, #6366f1 50%, #3b82f6 100%)">
        <SectionHeader
          title="Rabbit Hole Explorer"
          subtitle="Dive deep into any topic and discover fascinating connections"
          icon={Search}
          center
          divider
        >
          <div className="flex gap-4 mt-6">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic to explore..."
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-300 placeholder-gray-400"
            />
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg hover:from-violet-700 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200"
            >
              {isLoading ? 'Exploring...' : 'Explore'}
            </button>
          </div>
        </SectionHeader>
      </GlowingEffect>

      {results && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-lg p-6 space-y-6 border border-white/20">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Summary</h3>
            <p className="text-white/80">{results.summary}</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Related Topics</h3>
            <div className="grid grid-cols-2 gap-4">
              {results.relatedTopics.map((relatedTopic, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors duration-200 text-white/90 border border-white/10"
                >
                  {relatedTopic}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {results.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-white rounded-full text-sm border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <button
            className="w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200"
          >
            Save to Journal
          </button>
        </div>
      )}
    </div>
  );
};

export default RabbitHoleExplorer; 