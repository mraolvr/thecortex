import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Plus } from 'lucide-react';
import useCreativeHubStore from '../../../stores/creativeHubStore';

export default function CharacterList() {
  const { characters, addCharacter, deleteCharacter, updateCharacter } = useCreativeHubStore();
  const [showForm, setShowForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'supporting',
    description: '',
    background: '',
    physical_description: '',
    personality: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCharacter) {
        await updateCharacter(editingCharacter.id, formData);
      } else {
        await addCharacter(formData);
      }
      setShowForm(false);
      setEditingCharacter(null);
      setFormData({
        name: '',
        role: 'supporting',
        description: '',
        background: '',
        physical_description: '',
        personality: ''
      });
    } catch (error) {
      console.error('Error submitting character:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (characterId) => {
    if (window.confirm('Are you sure you want to delete this character?')) {
      await deleteCharacter(characterId);
    }
  };

  if (!characters || characters.length === 0) {
    return (
      <div className="text-center p-8 text-neutral-400">
        <p>No characters yet. Create your first character to get started!</p>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors mx-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add Character</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Character</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((character) => (
          <motion.div
            key={character.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-light/10 border border-surface-light/20 rounded-lg p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold text-white">{character.name}</h3>
                <span className="text-sm text-neutral-400 capitalize">{character.role}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingCharacter(character);
                    setFormData(character);
                    setShowForm(true);
                  }}
                  className="text-neutral-400 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(character.id)}
                  className="text-neutral-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              {character.description && (
                <p className="text-neutral-400 text-sm line-clamp-2">
                  {character.description}
                </p>
              )}
              {character.physical_description && (
                <p className="text-neutral-400 text-sm line-clamp-2">
                  <span className="font-medium">Physical:</span> {character.physical_description}
                </p>
              )}
              {character.personality && (
                <p className="text-neutral-400 text-sm line-clamp-2">
                  <span className="font-medium">Personality:</span> {character.personality}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Character Form Modal */}
      {showForm && (
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
              onClick={() => {
                setShowForm(false);
                setEditingCharacter(null);
                setFormData({
                  name: '',
                  role: 'supporting',
                  description: '',
                  background: '',
                  physical_description: '',
                  personality: ''
                });
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                {editingCharacter ? 'Edit Character' : 'New Character'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-surface-light/10 border border-surface-light/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-surface-light/10 border border-surface-light/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="main">Main Character</option>
                    <option value="supporting">Supporting Character</option>
                    <option value="minor">Minor Character</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-surface-light/10 border border-surface-light/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Background</label>
                  <textarea
                    name="background"
                    value={formData.background}
                    onChange={handleChange}
                    className="w-full bg-surface-light/10 border border-surface-light/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Physical Description</label>
                  <textarea
                    name="physical_description"
                    value={formData.physical_description}
                    onChange={handleChange}
                    className="w-full bg-surface-light/10 border border-surface-light/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Personality</label>
                  <textarea
                    name="personality"
                    value={formData.personality}
                    onChange={handleChange}
                    className="w-full bg-surface-light/10 border border-surface-light/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-white rounded-lg px-4 py-2 mt-4"
                >
                  {editingCharacter ? 'Update Character' : 'Add Character'}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
} 