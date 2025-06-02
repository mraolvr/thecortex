import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Plus } from 'lucide-react';
import useCreativeHubStore from '../../../stores/creativeHubStore';

export default function WorldBuildingList() {
  const { worldBuilding, addWorldBuilding, deleteWorldBuilding, updateWorldBuilding } = useCreativeHubStore();
  const [showForm, setShowForm] = useState(false);
  const [editingElement, setEditingElement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'location',
    description: '',
    details: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingElement) {
        await updateWorldBuilding(editingElement.id, formData);
      } else {
        await addWorldBuilding(formData);
      }
      setShowForm(false);
      setEditingElement(null);
      setFormData({
        title: '',
        category: 'location',
        description: '',
        details: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error submitting world building element:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (elementId) => {
    if (window.confirm('Are you sure you want to delete this element?')) {
      await deleteWorldBuilding(elementId);
    }
  };

  if (!worldBuilding || worldBuilding.length === 0) {
    return (
      <div className="text-center p-8 text-neutral-400">
        <p>No world-building elements yet. Create your first element to get started!</p>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors mx-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Add Element</span>
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
          <span>Add Element</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {worldBuilding.map((element) => (
          <motion.div
            key={element.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-light/10 border border-surface-light/20 rounded-lg p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold text-white">{element.title}</h3>
                <span className="text-sm text-neutral-400 capitalize">{element.category}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingElement(element);
                    setFormData(element);
                    setShowForm(true);
                  }}
                  className="text-neutral-400 hover:text-white"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(element.id)}
                  className="text-neutral-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              {element.description && (
                <p className="text-neutral-400 text-sm line-clamp-2">
                  {element.description}
                </p>
              )}
              {element.details && (
                <p className="text-neutral-400 text-sm line-clamp-2">
                  <span className="font-medium">Details:</span> {element.details}
                </p>
              )}
              {element.notes && (
                <p className="text-neutral-400 text-sm line-clamp-2">
                  <span className="font-medium">Notes:</span> {element.notes}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* World Building Form Modal */}
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
                setEditingElement(null);
                setFormData({
                  title: '',
                  category: 'location',
                  description: '',
                  details: '',
                  notes: ''
                });
              }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">
                {editingElement ? 'Edit Element' : 'New Element'}
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
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-surface-light/10 border border-surface-light/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                  >
                    <option value="location">Location</option>
                    <option value="culture">Culture</option>
                    <option value="history">History</option>
                    <option value="magic">Magic System</option>
                    <option value="technology">Technology</option>
                    <option value="other">Other</option>
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
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Details</label>
                  <textarea
                    name="details"
                    value={formData.details}
                    onChange={handleChange}
                    className="w-full bg-surface-light/10 border border-surface-light/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full bg-surface-light/10 border border-surface-light/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-white rounded-lg px-4 py-2 mt-4"
                >
                  {editingElement ? 'Update Element' : 'Add Element'}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
} 