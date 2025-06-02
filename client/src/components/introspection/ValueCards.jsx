import { useState } from 'react';

const mockValues = [
  {
    id: 1,
    title: 'Integrity',
    affirmation: 'I lead with honesty even when it\'s inconvenient.',
    challengeQuestion: 'Where did I uphold this value today?',
    pinned: true,
  },
  {
    id: 2,
    title: 'Creativity',
    affirmation: 'I seek new solutions and inspire others to do the same.',
    challengeQuestion: 'How did I unlock potential today?',
    pinned: false,
  },
  {
    id: 3,
    title: 'Empowerment',
    affirmation: 'I help others cross their finish lines.',
    challengeQuestion: 'Who did I empower today?',
    pinned: false,
  },
];

function getRandomValue(values) {
  return values[Math.floor(Math.random() * values.length)];
}

export default function ValueCards() {
  const [values, setValues] = useState(mockValues);
  const dailyValue = getRandomValue(values);

  return (
    <div className="space-y-6">
      {/* Daily Value Card */}
      <div className="bg-surface rounded-xl shadow p-6 border border-blue-500/20 flex items-center gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-blue-400 mb-1">Daily Value</h3>
          <div className="text-lg font-bold text-white">{dailyValue.title}</div>
          <div className="text-neutral-200 italic mb-2">{dailyValue.affirmation}</div>
          <div className="text-sm text-neutral-400">{dailyValue.challengeQuestion}</div>
        </div>
        <button className="text-yellow-400 hover:text-yellow-300 transition" title="Pin">
          {dailyValue.pinned ? '★' : '☆'}
        </button>
      </div>

      {/* Value Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {values.map((value) => (
          <div key={value.id} className="bg-surface rounded-xl shadow p-4 border border-neutral-700 flex flex-col gap-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-white">{value.title}</span>
              <button className="text-yellow-400 hover:text-yellow-300 transition" title="Pin">
                {value.pinned ? '★' : '☆'}
              </button>
            </div>
            <div className="text-neutral-200 italic">{value.affirmation}</div>
            <div className="text-sm text-neutral-400 mb-2">{value.challengeQuestion}</div>
            <div className="flex gap-2 mt-auto">
              <button className="text-blue-400 hover:underline text-xs">Edit</button>
              <button className="text-red-400 hover:underline text-xs">Delete</button>
            </div>
          </div>
        ))}
        {/* Add Value Card */}
        <button className="bg-gradient-to-br from-blue-700 to-violet-700 rounded-xl flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-400 text-blue-200 hover:bg-blue-800/40 transition">
          <span className="text-3xl">+</span>
          <span className="text-xs mt-1">Add Value</span>
        </button>
      </div>
    </div>
  );
} 