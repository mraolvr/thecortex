import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Edit, Trash2, ExternalLink } from 'lucide-react';
import useCreativeHubStore from '../../../stores/creativeHubStore';

export default function SongList() {
  const { 
    songs, 
    isLoadingSongs, 
    songError,
    initializeSongs,
    deleteSong,
    setSelectedSong
  } = useCreativeHubStore();

  useEffect(() => {
    initializeSongs();
  }, [initializeSongs]);

  if (isLoadingSongs) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (songError) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
        {songError}
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="text-center p-8 text-neutral-400">
        <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No songs yet. Start by adding your first song!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {songs.map((song) => (
        <motion.div
          key={song.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background rounded-lg p-4 border border-surface-light/20 hover:border-primary/50 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">{song.title}</h3>
              <p className="text-sm text-neutral-400">{song.artist || 'Unknown Artist'}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedSong(song)}
                className="p-1.5 hover:bg-surface-light/20 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4 text-neutral-400" />
              </button>
              <button
                onClick={() => deleteSong(song.id)}
                className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-neutral-400">
              <span className="px-2 py-1 bg-surface-light/10 rounded-full">
                {song.genre || 'No Genre'}
              </span>
              <span className="px-2 py-1 bg-surface-light/10 rounded-full">
                {song.status || 'Draft'}
              </span>
            </div>

            {song.lyrics && (
              <p className="text-sm text-neutral-400 line-clamp-3">
                {song.lyrics}
              </p>
            )}

            {song.spotify_url && (
              <a
                href={song.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-sm text-primary hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View on Spotify</span>
              </a>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-surface-light/20 text-xs text-neutral-500">
            Last updated: {new Date(song.updated_at).toLocaleDateString()}
          </div>
        </motion.div>
      ))}
    </div>
  );
} 