const mockStats = {
  uniqueValues: 5,
  daysAligned: 6,
  mostEmbodied: 'Integrity',
};

const mockHeatmap = [
  // Array of { date, count, values }
  { date: '2025-05-24', count: 1, values: ['Integrity'] },
  { date: '2025-05-25', count: 2, values: ['Creativity', 'Empowerment'] },
  { date: '2025-05-26', count: 0, values: [] },
  { date: '2025-05-27', count: 1, values: ['Integrity'] },
  { date: '2025-05-28', count: 1, values: ['Empowerment'] },
  { date: '2025-05-29', count: 2, values: ['Integrity', 'Creativity'] },
];

export default function AlignmentMap() {
  return (
    <div className="bg-surface rounded-xl shadow p-6 border border-purple-500/20">
      <h3 className="text-xl font-semibold text-purple-400 mb-2">Alignment Map</h3>
      <div className="flex flex-col md:flex-row gap-6 items-center">
        {/* Heatmap placeholder */}
        <div className="flex gap-1">
          {mockHeatmap.map(day => (
            <div
              key={day.date}
              className={`w-8 h-8 rounded bg-purple-700/30 border border-purple-700 flex items-center justify-center cursor-pointer hover:bg-purple-500/60 transition`}
              title={`${day.date}: ${day.values.join(', ')}`}
            >
              <span className="text-xs text-white font-bold">{day.count > 0 ? day.count : ''}</span>
            </div>
          ))}
        </div>
        {/* Stats */}
        <div className="flex flex-col gap-2 text-sm text-neutral-200">
          <div>
            <span className="font-semibold text-purple-300">This week:</span> aligned with <span className="font-bold text-white">{mockStats.uniqueValues}</span> unique values across <span className="font-bold text-white">{mockStats.daysAligned}</span> days.
          </div>
          <div>
            <span className="font-semibold text-purple-300">Most embodied value:</span> <span className="font-bold text-white">{mockStats.mostEmbodied}</span>
          </div>
        </div>
      </div>
      <div className="text-xs text-neutral-500 mt-2">(Calendar heatmap and stats are mock data. Supabase integration coming soon.)</div>
    </div>
  );
} 