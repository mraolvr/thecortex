import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

// Mock data for daily sparks
const dailySparks = [
  {
    id: 1,
    title: "The Butterfly Effect",
    description: "A butterfly flapping its wings in Brazil can set off a tornado in Texas. This concept from chaos theory shows how small changes can lead to vastly different outcomes.",
    expanded: false
  },
  {
    id: 2,
    title: "Quantum Entanglement",
    description: "Two particles can become 'entangled' so that the quantum state of each particle cannot be described independently, even when separated by large distances.",
    expanded: false
  },
  {
    id: 3,
    title: "The Mandela Effect",
    description: "A phenomenon where a large group of people remember an event differently from how it actually occurred, named after Nelson Mandela.",
    expanded: false
  }
];

const DailySparkCard: React.FC = () => {
  const [currentSpark, setCurrentSpark] = useState(dailySparks[0]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Get a random spark each day
  useEffect(() => {
    const today = new Date().toDateString();
    const sparkIndex = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % dailySparks.length;
    setCurrentSpark(dailySparks[sparkIndex]);
  }, []);

  return (
    <div className="bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 rounded-lg p-6 border border-white/20">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Daily Spark</h3>
          <p className="text-gray-400 mb-4">
            "The only way to discover the limits of the possible is to go beyond them into the impossible."
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>— Arthur C. Clarke</span>
            <span>•</span>
            <span>Science Fiction Writer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySparkCard; 