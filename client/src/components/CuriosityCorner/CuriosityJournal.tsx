import React, { useState } from 'react';
import GlowingEffect from '../ui/GlowingEffect';
import SectionHeader from '../ui/SectionHeader';
import { BookOpen } from 'lucide-react';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
}

const CuriosityJournal: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      title: 'First Discovery',
      content: 'Today I learned about the fascinating world of quantum computing...',
      date: '2024-03-20',
      tags: ['Science', 'Technology'],
    },
  ]);

  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    tags: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: JournalEntry = {
      id: Date.now().toString(),
      title: newEntry.title,
      content: newEntry.content,
      date: new Date().toISOString().split('T')[0],
      tags: newEntry.tags.split(',').map((tag) => tag.trim()),
    };
    setEntries([entry, ...entries]);
    setNewEntry({ title: '', content: '', tags: '' });
  };

  return (
    <div className="space-y-6">
      <GlowingEffect gradient="linear-gradient(270deg, #a78bfa 0%, #6366f1 50%, #3b82f6 100%)">
        <SectionHeader
          title="Curiosity Journal"
          subtitle="Document your discoveries and insights"
          icon={BookOpen}
          center
          divider
        />
      </GlowingEffect>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={newEntry.title}
            onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
            placeholder="Entry Title"
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-300 placeholder-gray-400"
          />
        </div>
        <div>
          <textarea
            value={newEntry.content}
            onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
            placeholder="Write your thoughts..."
            rows={4}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-300 placeholder-gray-400"
          />
        </div>
        <div>
          <input
            type="text"
            value={newEntry.tags}
            onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
            placeholder="Tags (comma-separated)"
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-gray-300 placeholder-gray-400"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-lg hover:from-violet-700 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all duration-200"
        >
          Save Entry
        </button>
      </form>

      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-300">{entry.title}</h3>
              <span className="text-sm text-gray-400">{entry.date}</span>
            </div>
            <p className="text-gray-400 mb-4">{entry.content}</p>
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-gray-300 rounded-full text-sm border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CuriosityJournal; 