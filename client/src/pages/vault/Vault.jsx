import { useState, useEffect } from 'react';
import GlowingEffect from '../../components/ui/GlowingEffect';
import { 
  Lock, Key, FileText, Shield, Plus, Search, X, Upload, FolderPlus, 
  Edit2, Trash2, Palette, Save, AlertCircle, Star
} from 'lucide-react';
import useVaultStore from '../../stores/vaultStore';
import Card from '../../components/ui/Card';
import SectionHeader from '../../components/ui/SectionHeader';
import Button from '../../components/ui/Button';

// Sample data
const sampleVaultItems = [
  {
    id: '1',
    type: 'password',
    name: 'Development Server',
    lastAccessed: '2024-03-15',
    category: 'servers',
  },
  {
    id: '2',
    type: 'key',
    name: 'AWS Access Key',
    lastAccessed: '2024-03-14',
    category: 'cloud',
  },
  {
    id: '3',
    type: 'document',
    name: 'API Documentation',
    lastAccessed: '2024-03-13',
    category: 'documents',
  },
  {
    id: '4',
    type: 'password',
    name: 'Database Credentials',
    lastAccessed: '2024-03-12',
    category: 'databases',
  },
];

const defaultCategories = [
  { id: 'all', name: 'All Items', icon: 'Shield', color: '#6366f1', isDefault: true },
  { id: 'passwords', name: 'Passwords', icon: 'Lock', color: '#ef4444', isDefault: true },
  { id: 'documents', name: 'Documents', icon: 'FileText', color: '#10b981', isDefault: true },
  { id: 'login', name: 'Login Information', icon: 'Key', color: '#f59e0b', isDefault: true },
];

const iconMap = {
  Shield: Shield,
  Lock: Lock,
  Key: Key,
  FileText: FileText,
};

const getItemIcon = (type) => {
  switch (type) {
    case 'password':
      return <Lock className="w-5 h-5" />;
    case 'key':
      return <Key className="w-5 h-5" />;
    case 'document':
      return <FileText className="w-5 h-5" />;
    default:
      return <Shield className="w-5 h-5" />;
  }
};

export default function Vault() {
  const { vaultItems, isLoading, error, fetchVaultItems, addVaultItem, updateVaultItem, deleteVaultItem } = useVaultStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [categories, setCategories] = useState(defaultCategories);
  const [newCategory, setNewCategory] = useState({ 
    name: '', 
    icon: 'Shield',
    color: '#6366f1'
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'passwords',
    details: '',
    file: null,
  });

  useEffect(() => {
    if (isUnlocked) {
      fetchVaultItems();
      // Load custom categories from localStorage
      const savedCategories = localStorage.getItem('customCategories');
      if (savedCategories) {
        setCategories([...defaultCategories, ...JSON.parse(savedCategories)]);
      }
    }
  }, [isUnlocked, fetchVaultItems]);

  const handleUnlock = () => {
    if (passcode === '3335') {
      setIsUnlocked(true);
    } else {
      setFeedback({ message: 'Incorrect passcode. Please try again.', type: 'error' });
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name.trim()) return;
    const result = await addVaultItem(newItem);
    if (result) {
      setFeedback({ message: 'Item added successfully!', type: 'success' });
      setShowAddModal(false);
      setNewItem({ name: '', category: 'passwords', details: '', file: null });
    } else {
      setFeedback({ message: 'Failed to add item.', type: 'error' });
    }
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) return;
    
    const categoryId = newCategory.name.toLowerCase().replace(/\s+/g, '-');
    const newCategoryObj = {
      id: categoryId,
      name: newCategory.name,
      icon: newCategory.icon,
      color: newCategory.color,
      isDefault: false
    };

    // Save to localStorage
    const savedCategories = localStorage.getItem('customCategories');
    const customCategories = savedCategories ? JSON.parse(savedCategories) : [];
    localStorage.setItem('customCategories', JSON.stringify([...customCategories, newCategoryObj]));

    // Update state
    setCategories(prev => [...prev, newCategoryObj]);
    setShowCategoryModal(false);
    setNewCategory({ name: '', icon: 'Shield', color: '#6366f1' });
    setFeedback({ message: 'Category added successfully!', type: 'success' });
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      icon: category.icon,
      color: category.color
    });
    setShowCategoryModal(true);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !newCategory.name.trim()) return;

    const updatedCategory = {
      ...editingCategory,
      name: newCategory.name,
      icon: newCategory.icon,
      color: newCategory.color
    };

    // Update localStorage
    const savedCategories = localStorage.getItem('customCategories');
    const customCategories = savedCategories ? JSON.parse(savedCategories) : [];
    const updatedCategories = customCategories.map(cat => 
      cat.id === editingCategory.id ? updatedCategory : cat
    );
    localStorage.setItem('customCategories', JSON.stringify(updatedCategories));

    // Update state
    setCategories(prev => prev.map(cat => 
      cat.id === editingCategory.id ? updatedCategory : cat
    ));
    setShowCategoryModal(false);
    setEditingCategory(null);
    setNewCategory({ name: '', icon: 'Shield', color: '#6366f1' });
    setFeedback({ message: 'Category updated successfully!', type: 'success' });
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  };

  const handleDeleteCategory = (category) => {
    if (category.isDefault) {
      setFeedback({ message: 'Cannot delete default categories.', type: 'error' });
      return;
    }
    setCategoryToDelete(category);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) return;

    // Update localStorage
    const savedCategories = localStorage.getItem('customCategories');
    const customCategories = savedCategories ? JSON.parse(savedCategories) : [];
    const updatedCategories = customCategories.filter(cat => cat.id !== categoryToDelete.id);
    localStorage.setItem('customCategories', JSON.stringify(updatedCategories));

    // Update state
    setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete.id));
    setShowDeleteConfirm(false);
    setCategoryToDelete(null);
    setFeedback({ message: 'Category deleted successfully!', type: 'success' });
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  };

  const handleUpdate = async (id, updates) => {
    const result = await updateVaultItem(id, updates);
    if (result) {
      setFeedback({ message: 'Item updated successfully!', type: 'success' });
      setIsEditing(false);
    } else {
      setFeedback({ message: 'Failed to update item.', type: 'error' });
    }
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  };

  const handleDelete = async (id) => {
    await deleteVaultItem(id);
    setFeedback({ message: 'Item deleted successfully!', type: 'success' });
    setSelectedItem(null);
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  };

  const filteredItems = vaultItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!isUnlocked) {
    return (
      <div className="min-h-screen  p-8 flex items-center justify-center">
        <GlowingEffect className="bg-neutral-1200 p-6 rounded-xl max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">Enter Passcode</h2>
          {feedback.message && (
            <div className={`mb-4 p-2 rounded ${feedback.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {feedback.message}
            </div>
          )}
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter passcode..."
            className="w-full bg-background-light px-4 py-2 rounded-lg border border-surface focus:outline-none focus:border-primary mb-4"
          />
          <Button
            onClick={handleUnlock}
            className="w-full bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg transition-colors"
          >
            Unlock
          </Button>
        </GlowingEffect>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light p-8">
      <div className="max-w-[1600px] mx-auto">
        <SectionHeader 
          title="Secure Vault"
          subtitle="Store and manage your sensitive information"
        />

        {/* Search and Filter Bar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search vault..."
              className="w-full bg-background pl-10 pr-4 py-2 rounded-lg border border-nurtral-950 focus:outline-none focus:border-primary"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-neutral" />
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg transition-colors"
          >
            Add New Item
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <GlowingEffect className="bg-neutral-1200 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Categories</h2>
                <Button 
                  onClick={() => {
                    setEditingCategory(null);
                    setNewCategory({ name: '', icon: 'Shield', color: '#6366f1' });
                    setShowCategoryModal(true);
                  }}
                  className="text-primary hover:text-white transition-colors"
                >
                  <FolderPlus className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = iconMap[category.icon] || Shield;
                  return (
                    <Card
                      key={category.id}
                      accent="blue"
                      icon={Icon}
                      title={category.name}
                      className="p-4"
                      onClick={() => {
                        setSelectedCategory(category.id);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category.name}</span>
                        {!category.isDefault && (
                          <div className="flex space-x-1">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCategory(category);
                              }}
                              className="p-1 text-neutral hover:text-primary transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(category);
                              }}
                              className="p-1 text-neutral hover:text-error transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </GlowingEffect>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <GlowingEffect className="bg-neutral-1200 p-6 rounded-xl">
              {filteredItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <img src="/empty-vault.svg" alt="Empty Vault" className="w-32 h-32 mb-6 opacity-80" />
                  <h3 className="text-2xl font-semibold mb-2 text-neutral-200">Your Vault is Empty</h3>
                  <p className="text-neutral-400 mb-6">Add your first item to get started!</p>
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary hover:bg-primary-light text-white px-6 py-3 rounded-lg transition-colors text-lg font-medium"
                  >
                    <Plus className="w-5 h-5 inline-block mr-2" /> Add New Item
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredItems.map((item) => {
                    // Find the category object for color
                    const catObj = categories.find(cat => cat.id === item.category);
                    const catColor = catObj ? catObj.color : '#6366f1';
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="group bg-background-light rounded-2xl p-6 shadow-lg border border-background transition-all cursor-pointer flex flex-col justify-between min-h-[180px] relative transform hover:scale-105 hover:shadow-2xl duration-200"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          {/* Category color dot */}
                          <span className="w-3 h-3 rounded-full" style={{ background: catColor }} />
                          <div className="p-2 rounded-lg" style={{ background: '#18181b' }}>
                            {getItemIcon(item.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-gray-50 truncate flex items-center gap-1 overflow-hidden text-ellipsis">
                              {item.name}
                              {/* Star for favorite/pin (UI only) */}
                              <Star className="w-4 h-4 text-yellow-400 opacity-60 hover:opacity-100 transition-opacity cursor-pointer" title="Pin/Favorite (coming soon)" />
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-1 rounded-full truncate max-w-[100px]" style={{ background: '#23272e', color: '#a5b4fc' }}>{item.category}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-xs text-neutral-400 truncate max-w-[120px]">Last accessed: {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'N/A'}</span>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              onClick={e => { e.stopPropagation(); setSelectedItem(item); setIsEditing(true); }}
                              className="p-1 rounded hover:bg-primary/10 text-primary"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={e => { e.stopPropagation(); handleDelete(item.id); }}
                              className="p-1 rounded hover:bg-error/10 text-error"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlowingEffect>
          </div>
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <GlowingEffect className="bg-surface p-6 rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <Button
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                  setNewCategory({ name: '', icon: 'Shield', color: '#6366f1' });
                }}
                className="text-neutral hover:text-error transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              editingCategory ? handleUpdateCategory() : handleAddCategory();
            }}>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Category Name..."
                  className="w-fullbg-black/60 backdrop-blur-xlbg-black/60 backdrop-blur-xl px-4 py-2 rounded-lg border border-surface focus:outline-none focus:border-primary"
                />
                <div className="flex items-center space-x-4">
                  <select
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                    className="flex-1 bg-background px-4 py-2 rounded-lg border border-surface focus:outline-none focus:border-primary"
                  >
                    {Object.keys(iconMap).map(iconName => (
                      <option key={iconName} value={iconName}>{iconName}</option>
                    ))}
                  </select>
                  <div className="relative">
                    <input
                      type="color"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer"
                    />
                    <Palette className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral pointer-events-none" />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </Button>
              </div>
            </form>
          </GlowingEffect>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {showDeleteConfirm && categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <GlowingEffect className="bg-surface p-6 rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Delete Category</h2>
              <Button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCategoryToDelete(null);
                }}
                className="text-neutral hover:text-error transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-error">
                <AlertCircle className="w-5 h-5" />
                <p>Are you sure you want to delete "{categoryToDelete.name}"?</p>
              </div>
              <p className="text-sm text-neutral">
                This action cannot be undone. All items in this category will be moved to "All Items".
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setCategoryToDelete(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-surface hover:bg-background-light transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDeleteCategory}
                  className="bg-error hover:bg-error-light text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Delete
                </Button>
              </div>
            </div>
          </GlowingEffect>
        </div>
      )}

      {/* Add New Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50">
          <GlowingEffect className="bg-surface p-6 rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Add New Item</h2>
              <Button
                onClick={() => setShowAddModal(false)}
                className="text-neutral hover:text-error transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAddItem(); }}>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Item Name..."
                  className="w-full bg-background px-4 py-2 rounded-lg border border-surface focus:outline-none focus:border-primary"
                />
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full bg-background px-4 py-2 rounded-lg border border-surface focus:outline-none focus:border-primary"
                >
                  {categories.filter(cat => cat.id !== 'all').map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <textarea
                  value={newItem.details}
                  onChange={(e) => setNewItem({ ...newItem, details: e.target.value })}
                  placeholder="Details..."
                  className="w-full bg-background px-4 py-2 rounded-lg border border-surface focus:outline-none focus:border-primary"
                />
                {newItem.category === 'documents' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      onChange={(e) => setNewItem({ ...newItem, file: e.target.files[0] })}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex items-center space-x-2 bg-background px-4 py-2 rounded-lg border border-surface cursor-pointer"
                    >
                      <Upload className="w-5 h-5 text-neutral" />
                      <span>Upload Document</span>
                    </label>
                    {newItem.file && <span className="text-sm text-neutral">{newItem.file.name}</span>}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add Item
                </Button>
              </div>
            </form>
          </GlowingEffect>
        </div>
      )}

      {/* View/Edit Item Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50">
          <GlowingEffect className="bg-black p-6 rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{isEditing ? 'Edit Item' : selectedItem.name}</h2>
              <Button
                onClick={() => {
                  setSelectedItem(null);
                  setIsEditing(false);
                }}
                className="text-neutral hover:text-error transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={selectedItem.name}
                  onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
                  className="w-full bg-background px-4 py-2 rounded-lg border border-surface focus:outline-none focus:border-primary"
                />
                <select
                  value={selectedItem.category}
                  onChange={(e) => setSelectedItem({ ...selectedItem, category: e.target.value })}
                  className="w-full bg-background px-4 py-2 rounded-lg border border-surface focus:outline-none focus:border-primary"
                >
                  {categories.filter(cat => cat.id !== 'all').map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <textarea
                  value={selectedItem.details}
                  onChange={(e) => setSelectedItem({ ...selectedItem, details: e.target.value })}
                  className="w-full bg-background px-4 py-2 rounded-lg border border-surface focus:outline-none focus:border-primary"
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    onClick={() => handleUpdate(selectedItem.id, selectedItem)}
                    className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    className="bg-neutral hover:bg-neutral-light text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <p><strong>Category:</strong> {selectedItem.category}</p>
                  <p><strong>Details:</strong> {selectedItem.details}</p>
                  {selectedItem.file_path && <p><strong>File:</strong> {selectedItem.file_path}</p>}
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(selectedItem.id)}
                    className="bg-error hover:bg-error-light text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </GlowingEffect>
        </div>
      )}

      {/* Floating Add Item Button for mobile */}
      <Button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 z-50 bg-primary hover:bg-primary-light text-white p-4 rounded-full shadow-lg transition-colors block md:hidden"
        style={{ boxShadow: '0 4px 24px rgba(59,130,246,0.25)' }}
        title="Add New Item"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
} 