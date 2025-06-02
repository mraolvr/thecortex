import { useState } from 'react';

const mockValues = [
  { id: 1, title: 'Integrity' },
  { id: 2, title: 'Creativity' },
  { id: 3, title: 'Empowerment' },
];

const mockEntries = [
  {
    id: 1,
    date: '2025-05-29',
    reflectionText: 'I helped a teammate solve a problem and encouraged them to take the lead.',
    linkedValueIds: [1, 3],
    tags: ['support', 'leadership'],
  },
  {
    id: 2,
    date: '2025-05-28',
    reflectionText: 'I was honest about a mistake and worked to fix it.',
    linkedValueIds: [1],
    tags: ['honesty'],
  },
];

export default function DailyReflection() {
  const [reflection, setReflection] = useState('');
  const [selectedValues, setSelectedValues] = useState([]);
  const [entries, setEntries] = useState(mockEntries);

  return (
    <div className="bg-surface rounded-xl shadow p-6 border border-emerald-500/20 space-y-4">
      <h3 className="text-xl font-semibold text-emerald-400 mb-2">How did I live my vision today?</h3>
      <textarea
        className="w-full bg-background rounded-lg p-3 text-white border border-neutral-700 focus:ring-2 focus:ring-emerald-500 mb-2"
        rows={3}
        placeholder="Write your reflection..."
        value={reflection}
        onChange={e => setReflection(e.target.value)}
      />
      <div className="flex flex-wrap gap-2 mb-2">
        <span className="text-sm text-neutral-400">Values reflected:</span>
        <select
          multiple
          className="bg-background border border-neutral-700 rounded px-2 py-1 text-white"
          value={selectedValues}
          onChange={e => setSelectedValues(Array.from(e.target.selectedOptions, o => Number(o.value)))}
        >
          {mockValues.map(v => (
            <option key={v.id} value={v.id}>{v.title}</option>
          ))}
        </select>
      </div>
      <div className="text-xs text-neutral-500 mb-2">(Auto-save enabled. Supabase integration coming soon.)</div>
      <div className="mt-4">
        <h4 className="text-lg font-semibold text-white mb-2">Past Reflections</h4>
        <div className="space-y-2">
          {entries.map(entry => (
            <div key={entry.id} className="bg-background rounded p-3 border border-neutral-800">
              <div className="text-xs text-neutral-400 mb-1">{entry.date}</div>
              <div className="text-white mb-1">{entry.reflectionText}</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {entry.linkedValueIds.map(id => {
                  const v = mockValues.find(val => val.id === id);
                  return v ? <span key={id} className="bg-emerald-700 text-white px-2 py-0.5 rounded">{v.title}</span> : null;
                })}
                {entry.tags.map(tag => (
                  <span key={tag} className="bg-neutral-700 text-neutral-200 px-2 py-0.5 rounded">#{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 