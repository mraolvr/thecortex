import React, { useState, useEffect } from 'react';
import GlowingEffect from '../../components/ui/GlowingEffect';
import SectionHeader from '../../components/ui/SectionHeader';
import { PenTool, Book, Calendar, Tag, Plus, Search, Edit, Trash2, Loader2, X } from 'lucide-react';
import Card from '../../components/ui/Card';
import { supabase } from '../../lib/supabase';

// Sample data
const sampleEntries = [
  {
    id: '1',
    title: 'Project Ideas',
    content: 'Brainstorming session for new features...',
    type: 'note',
    tags: ['ideas', 'projects'],
    createdAt: '2024-03-15',
    status: 'active',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Daily Reflection',
    content: 'Today was productive, managed to...',
    type: 'journal',
    tags: ['reflection', 'personal'],
    createdAt: '2024-03-14',
    status: 'active',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Technical Notes',
    content: 'Learning about system architecture...',
    type: 'note',
    tags: ['technical', 'learning'],
    createdAt: '2024-03-13',
    status: 'archived',
    priority: 'low'
  },
  {
    id: '4',
    title: 'Weekly Goals',
    content: 'This week I want to focus on...',
    type: 'journal',
    tags: ['goals', 'planning'],
    createdAt: '2024-03-12',
    status: 'active',
    priority: 'high'
  },
];

const categories = [
  { id: 'all', name: 'All Entries', icon: Book },
  { id: 'notes', name: 'Notes', icon: PenTool },
  { id: 'journal', name: 'Journal', icon: Calendar },
];

const priorities = {
  high: 'text-red-500',
  medium: 'text-yellow-500',
  low: 'text-green-500'
};

export default function CreativeHub() {
  const [entries, setEntries] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    type: 'note',
    tags: [],
    priority: 'medium'
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('creative_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEntry = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('creative_entries')
        .insert([
          {
            title: newEntry.title,
            content: newEntry.content,
            type: newEntry.type,
            tags: newEntry.tags,
            priority: newEntry.priority,
            status: 'active',
            user_id: (await supabase.auth.getUser()).data.user?.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setEntries(prev => [data, ...prev]);
      setNewEntry({
        title: '',
        content: '',
        type: 'note',
        tags: [],
        priority: 'medium'
      });
      setShowNewEntryForm(false);
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      const { error } = await supabase
        .from('creative_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      setEntries(prev => prev.filter(entry => entry.id !== entryId));
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  // Get unique tags from all entries
  const allTags = [...new Set(entries.flatMap(entry => entry.tags))];

  const filteredEntries = entries.filter((entry) => {
    const matchesCategory = selectedCategory === 'all' || entry.type === selectedCategory;
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.every(tag => entry.tags.includes(tag));
    return matchesCategory && matchesSearch && matchesTags;
  });

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleAddTag = (tag) => {
    if (!tag.trim()) return;
    setNewEntry(prev => ({
      ...prev,
      tags: [...new Set([...prev.tags, tag.trim()])]
    }));
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewEntry(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-[1600px] mx-auto">
        <SectionHeader 
          title="Creative Hub"
          subtitle="Capture your thoughts, ideas, and reflections"
          center
          icon={Book}
          divider
        />

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <GlowingEffect className="p-6 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Categories</h2>
                <button className="text-primary hover:text-primary-light transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-background text-primary'
                          : 'text-neutral hover:text-white hover:bg-background-light'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tags Section */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-primary text-white'
                          : 'bg-background text-neutral hover:bg-background-light'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </GlowingEffect>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <GlowingEffect className="p-6 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search entries..."
                    className="w-full bg-background pl-10 pr-4 py-2 rounded-lg border border-surface focus:outline-none focus:border-primary"
                  />
                  <Search className="absolute left-3 top-2.5 w-5 h-5 text-neutral" />
                </div>
                <button 
                  onClick={() => setShowNewEntryForm(true)}
                  className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>New Entry</span>
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : filteredEntries.length === 0 ? (
                <div className="text-center py-12 text-neutral">
                  <PenTool className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-lg">No entries found</p>
                  <button className="mt-4 text-primary hover:text-primary-light">
                    Create your first entry
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEntries.map((entry) => (
                    <Card
                      key={entry.id}
                      accent={entry.priority === 'high' ? 'red' : entry.priority === 'medium' ? 'yellow' : 'green'}
                      icon={entry.type === 'note' ? PenTool : Calendar}
                      title={entry.title}
                      className="p-4 hover:scale-[1.02] transition-transform"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-2 text-sm text-neutral">
                            <Calendar className="w-4 h-4" />
                            <span>{entry.createdAt}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${priorities[entry.priority]}`}>
                              {entry.priority}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-neutral hover:text-primary transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-neutral hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-neutral mb-4 line-clamp-2">{entry.content}</p>
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-neutral" />
                        <div className="flex gap-2">
                          {entry.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 rounded-full bg-background text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </GlowingEffect>
          </div>
        </div>
      </div>

      {/* New Entry Form Modal */}
      {showNewEntryForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-purple-900 via-purple-600 to-cyan-600 rounded-xl p-6 w-full max-w-2xl border border-neutral-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">New Entry</h3>
              <button
                onClick={() => setShowNewEntryForm(false)}
                className="text-white-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <input
                type="text"
                value={newEntry.title}
                onChange={e => setNewEntry({ ...newEntry, title: e.target.value })}
                placeholder="Entry title..."
                className="w-full px-3 py-2 bg-gradient-to-br from-purple-900 via-purple-600 to-cyan-600 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
              <textarea
                value={newEntry.content}
                onChange={e => setNewEntry({ ...newEntry, content: e.target.value })}
                placeholder="Write your entry..."
                className="w-full px-3 py-2 bg-gradient-to-br from-purple-900 via-purple-600 to-cyan-600 border border-neutral-700 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent min-h-[200px]"
                required
              />
              <div className="flex gap-4">
                <select
                  value={newEntry.type}
                  onChange={e => setNewEntry({ ...newEntry, type: e.target.value })}
                  className="px-3 py-2 bg-gradient-to-br from-purple-900 via-purple-600 to-cyan-600 rounded-lg text-white"
                >
                  <option value="note">Note</option>
                  <option value="journal">Journal</option>
                </select>
                <select
                  value={newEntry.priority}
                  onChange={e => setNewEntry({ ...newEntry, priority: e.target.value })}
                  className="px-3 py-2 bg-gradient-to-br from-purple-900 via-purple-600 to-cyan-600 rounded-lg text-white"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-white">Tags</div>
                <div className="flex flex-wrap gap-2">
                  {newEntry.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gradient-to-br from-purple-900 via-purple-600 to-cyan-600 rounded text-xs flex items-center gap-1 text-white">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-white hover:text-error"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add tag..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-gradient-to-br from-blue-900 via-purple-600 to-cyan-600 rounded-lg text-white placeholder-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewEntryForm(false)}
                    className="px-4 py-2 text-white hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 