import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import useCreativeHubStore from '../../../stores/creativeHubStore';

export default function WritingForm({ onClose, project }) {
  const { addWritingProject, updateWritingProject } = useCreativeHubStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    status: 'draft',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        genre: project.genre || '',
        status: project.status || 'draft',
        notes: project.notes || ''
      });
    }
  }, [project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (project) {
        await updateWritingProject(project.id, formData);
      } else {
        await addWritingProject(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error submitting writing project:', error);
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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-surface-light rounded-lg p-6 w-full max-w-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            {project ? 'Edit Writing Project' : 'New Writing Project'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="block text-sm font-medium text-neutral-400 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-surface-light/10 border border-surface-light/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                rows={4}
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
                rows={4}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white rounded-lg px-4 py-2 mt-4"
            >
              {submitting ? 'Submitting...' : project ? 'Update Project' : 'Add Project'}
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
} 