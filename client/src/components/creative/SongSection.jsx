import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import SongList from './songs/SongList';
import SongIdeasList from './songs/SongIdeasList';
import SongForm from './songs/SongForm';
import SongIdeaForm from './songs/SongIdeaForm';

export default function SongSection() {
  const [activeTab, setActiveTab] = useState('songs');
  const [showSongForm, setShowSongForm] = useState(false);
  const [showIdeaForm, setShowIdeaForm] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);

  const handleAddSong = () => {
    setSelectedSong(null);
    setShowSongForm(true);
  };

  const handleAddIdea = () => {
    setSelectedIdea(null);
    setShowIdeaForm(true);
  };

  const handleEditSong = (song) => {
    setSelectedSong(song);
    setShowSongForm(true);
  };

  const handleEditIdea = (idea) => {
    setSelectedIdea(idea);
    setShowIdeaForm(true);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('songs')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'songs'
                ? 'bg-primary text-white'
                : 'bg-surface-light/10 text-neutral-400'
            }`}
          >
            Songs
          </button>
          <button
            onClick={() => setActiveTab('ideas')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'ideas'
                ? 'bg-primary text-white'
                : 'bg-surface-light/10 text-neutral-400'
            }`}
          >
            Song Ideas
          </button>
        </div>
        <button
          onClick={activeTab === 'songs' ? handleAddSong : handleAddIdea}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add {activeTab === 'songs' ? 'Song' : 'Idea'}</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {activeTab === 'songs' ? (
          <SongList onEdit={handleEditSong} />
        ) : (
          <SongIdeasList onEdit={handleEditIdea} />
        )}
      </motion.div>

      {showSongForm && (
        <SongForm
          onClose={() => setShowSongForm(false)}
          song={selectedSong}
        />
      )}

      {showIdeaForm && (
        <SongIdeaForm
          onClose={() => setShowIdeaForm(false)}
          idea={selectedIdea}
        />
      )}
    </div>
  );
} 