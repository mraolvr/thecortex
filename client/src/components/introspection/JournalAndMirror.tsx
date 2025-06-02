import React, { useState } from 'react';
import { Sparkles, Save } from 'lucide-react';

const JournalAndMirror: React.FC = () => {
  const [journalEntry, setJournalEntry] = useState('');
  const [reflection, setReflection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    // This would typically save to a database
    console.log('Saving journal entry:', journalEntry);
  };

  const handleMirrorReflection = async () => {
    setIsLoading(true);
    // This would typically call an AI service
    setTimeout(() => {
      const mockReflection = {
        summary: "Your entry shows a strong focus on personal growth and learning. The tone is optimistic and forward-looking.",
        themes: ["Growth", "Learning", "Optimism"],
        suggestions: [
          "Consider how these learnings could be applied to future challenges",
          "Reflect on the progress you've made in these areas"
        ]
      };
      setReflection(JSON.stringify(mockReflection, null, 2));
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-medium text-gray-300">Journal & Mirror</h3>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>

      <textarea
        value={journalEntry}
        onChange={(e) => setJournalEntry(e.target.value)}
        placeholder="Write your thoughts, reflections, and learnings from today..."
        className="w-full h-48 bg-white/10 border border-white/20 rounded-lg p-4 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-violet-500"
      />

      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={handleMirrorReflection}
          disabled={!journalEntry.trim() || isLoading}
          className={`flex items-center gap-2 px-4 py-2 bg-violet-500/20 text-violet-300 rounded-lg transition-colors ${
            !journalEntry.trim() || isLoading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-violet-500/30'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {isLoading ? 'Reflecting...' : 'Ask Mirror'}
        </button>
      </div>

      {reflection && (
        <div className="mt-6 space-y-4">
          <h4 className="text-gray-300 font-medium">Mirror's Reflection:</h4>
          <div className="p-4 bg-white/5 rounded-lg">
            <pre className="text-gray-400 text-sm whitespace-pre-wrap">
              {reflection}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalAndMirror; 