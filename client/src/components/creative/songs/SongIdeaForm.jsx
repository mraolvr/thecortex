import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import useCreativeHubStore from '../../../stores/creativeHubStore';

export default function SongIdeaForm({ onClose, idea = null }) {
  const { addSongIdea, updateSongIdea } = useCreativeHubStore();
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    description: '',
    melody_notes: '',
    inspiration: '',
    status: 'draft',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (idea) {
      setFormData({
        title: idea.title || '',
        genre: idea.genre || '',
        description: idea.description || '',
        melody_notes: idea.melody_notes || '',
        inspiration: idea.inspiration || '',
        status: idea.status || 'draft',
        notes: idea.notes || ''
      });
    }
  }, [idea]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (idea) {
        await updateSongIdea(idea.id, formData);
      } else {
        await addSongIdea(formData);
      }
      onClose();
    } catch (error) {
      // Optionally handle error
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-background rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              {idea ? 'Edit Song Idea' : 'New Song Idea'}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-surface-light/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-surface-light/10 border border-surface-light/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Genre</label>
                <input
                  type="text"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className="w-full bg-surface-light/10 border border-surface-light/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-surface-light/10 border border-surface-light/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Melody Notes</label>
              <textarea
                name="melody_notes"
                value={formData.melody_notes}
                onChange={handleChange}
                className="w-full bg-surface-light/10 border border-surface-light/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Inspiration</label>
              <input
                type="text"
                name="inspiration"
                value={formData.inspiration}
                onChange={handleChange}
                className="w-full bg-surface-light/10 border border-surface-light/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-surface-light/10 border border-surface-light/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              >
                <option value="draft">Draft</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="w-full bg-surface-light/10 border border-surface-light/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white rounded-lg px-4 py-2 mt-4"
            >
              {submitting ? 'Submitting...' : idea ? 'Update Idea' : 'Add Idea'}
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
} 