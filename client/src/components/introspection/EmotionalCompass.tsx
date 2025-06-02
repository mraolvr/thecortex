import React, { useState } from 'react';
import { Heart, TrendingUp, Clock } from 'lucide-react';

interface EmotionEntry {
  id: string;
  emotion: string;
  intensity: number;
  timestamp: Date;
  notes: string;
}

const EMOTIONS = [
  'Joy', 'Gratitude', 'Peace', 'Love', 'Hope',
  'Anxiety', 'Fear', 'Anger', 'Sadness', 'Stress'
];

const EmotionalCompass: React.FC = () => {
  const [entries, setEntries] = useState<EmotionEntry[]>([]);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');

  const handleAddEntry = () => {
    if (!selectedEmotion) return;

    const newEntry: EmotionEntry = {
      id: Date.now().toString(),
      emotion: selectedEmotion,
      intensity,
      timestamp: new Date(),
      notes
    };

    setEntries([newEntry, ...entries]);
    setSelectedEmotion('');
    setIntensity(5);
    setNotes('');
  };

  const getEmotionColor = (emotion: string) => {
    const positiveEmotions = ['Joy', 'Gratitude', 'Peace', 'Love', 'Hope'];
    return positiveEmotions.includes(emotion) ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6">
      <h3 className="text-xl font-medium text-gray-300 mb-4">Emotional Compass</h3>

      {/* Input Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Current Emotion</label>
          <div className="grid grid-cols-5 gap-2">
            {EMOTIONS.map((emotion) => (
              <button
                key={emotion}
                onClick={() => setSelectedEmotion(emotion)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedEmotion === emotion
                    ? 'bg-violet-500/20 text-violet-300'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {emotion}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Intensity: {intensity}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full h-24 bg-white/10 border border-white/20 rounded-lg p-3 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <button
          onClick={handleAddEntry}
          disabled={!selectedEmotion}
          className={`w-full py-2 rounded-lg transition-colors ${
            !selectedEmotion
              ? 'bg-white/10 text-gray-500 cursor-not-allowed'
              : 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30'
          }`}
        >
          Record Emotion
        </button>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white/5 rounded-lg p-4 border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Heart className={`w-5 h-5 ${getEmotionColor(entry.emotion)}`} />
                <span className={`font-medium ${getEmotionColor(entry.emotion)}`}>
                  {entry.emotion}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Clock className="w-4 h-4" />
                {entry.timestamp.toLocaleTimeString()}
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <div className="flex-1 h-2 bg-white/10 rounded-full">
                <div
                  className="h-full bg-violet-500 rounded-full"
                  style={{ width: `${(entry.intensity / 10) * 100}%` }}
                />
              </div>
            </div>
            {entry.notes && (
              <p className="text-gray-400 text-sm mt-2">{entry.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmotionalCompass; 