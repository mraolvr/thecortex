import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import GlowingEffect from '../../components/ui/GlowingEffect';
import { 
  User, Phone, Mail, MapPin, Building, Calendar, 
  Plus, Search, X, Upload, FolderPlus, Edit2, 
  Trash2, Users, Briefcase, Church, Heart, Star
} from 'lucide-react';
import Card from '../../components/ui/Card';
import SectionHeader from '../../components/ui/SectionHeader';
import Button from '../../components/ui/Button';

const defaultCategories = [
  { id: 'all', name: 'All Contacts', icon: 'Users', color: '#6366f1', isDefault: true },
  { id: 'family', name: 'Family', icon: 'Heart', color: '#ef4444', isDefault: true },
  { id: 'friends', name: 'Friends', icon: 'Users', color: '#10b981', isDefault: true },
  { id: 'work', name: 'Work', icon: 'Briefcase', color: '#f59e0b', isDefault: true },
  { id: 'church', name: 'Church', icon: 'Church', color: '#8b5cf6', isDefault: true },
];

const communicationCadences = [
  { id: 'daily', name: 'Daily' },
  { id: 'weekly', name: 'Weekly' },
  { id: 'biweekly', name: 'Bi-weekly' },
  { id: 'monthly', name: 'Monthly' },
  { id: 'quarterly', name: 'Quarterly' },
  { id: 'annually', name: 'Annually' },
  { id: 'as-needed', name: 'As Needed' },
];

const iconMap = {
  Users: Users,
  Heart: Heart,
  Briefcase: Briefcase,
  Church: Church,
};

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [categories, setCategories] = useState(defaultCategories);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    company: '',
    category: 'friends',
    communicationCadence: 'monthly',
    lastContactDate: new Date().toISOString().split('T')[0],
    notes: '',
    photo: null,
  });
  const [sortOrder, setSortOrder] = useState('asc');
  const [filters, setFilters] = useState({
    communicationCadence: '',
    category: '',
    name: '',
  });
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    fetchContacts();
    fetchCategories();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          *,
          contact_categories (
            name,
            icon,
            color
          )
        `)
        .order('favorite', { ascending: false })
        .order('name');

      if (error) throw error;
      
      // Transform the data to match our component's structure
      const transformedData = data.map(contact => ({
        ...contact,
        category_name: contact.contact_categories?.name,
        category_icon: contact.contact_categories?.icon,
        category_color: contact.contact_categories?.color
      }));
      
      setContacts(transformedData || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setFeedback({ message: 'Error loading contacts', type: 'error' });
    }
  };

  const fetchCategories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('contact_categories')
        .select('*')
        .or(`is_default.eq.true,user_id.eq.${user?.id}`);

      if (error) throw error;
      setCategories(data || defaultCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setFeedback({ message: 'Error loading categories', type: 'error' });
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('contacts')
        .insert([{
          name: newContact.name,
          email: newContact.email,
          phone: newContact.phone,
          address: newContact.address,
          company: newContact.company,
          category: newContact.category,
          communication_cadence: newContact.communicationCadence,
          last_contact_date: newContact.lastContactDate,
          notes: newContact.notes,
          photo_url: newContact.photo,
          user_id: user?.id
        }])
        .select(`
          *,
          contact_categories (
            name,
            icon,
            color
          )
        `);

      if (error) throw error;

      setShowAddModal(false);
      setNewContact({
        name: '',
        phone: '',
        email: '',
        address: '',
        company: '',
        category: 'friends',
        communicationCadence: 'monthly',
        lastContactDate: new Date().toISOString().split('T')[0],
        notes: '',
        photo: null,
      });
      setFeedback({ message: 'Contact added successfully!', type: 'success' });
      fetchContacts(); // Refresh the contacts list
    } catch (error) {
      console.error('Error adding contact:', error);
      setFeedback({ message: 'Error adding contact', type: 'error' });
    }
  };

  const handleUpdateContact = async () => {
    if (!selectedContact || !selectedContact.name.trim()) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .update({
          name: selectedContact.name,
          email: selectedContact.email,
          phone: selectedContact.phone,
          address: selectedContact.address,
          company: selectedContact.company,
          category: selectedContact.category,
          communication_cadence: selectedContact.communicationCadence,
          last_contact_date: selectedContact.lastContactDate,
          notes: selectedContact.notes,
          photo_url: selectedContact.photo,
        })
        .eq('id', selectedContact.id)
        .select(`
          *,
          contact_categories (
            name,
            icon,
            color
          )
        `);

      if (error) throw error;

      setIsEditing(false);
      setSelectedContact(null);
      setFeedback({ message: 'Contact updated successfully!', type: 'success' });
      fetchContacts(); // Refresh the contacts list
    } catch (error) {
      console.error('Error updating contact:', error);
      setFeedback({ message: 'Error updating contact', type: 'error' });
    }
  };

  const handleDeleteContact = async (id) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSelectedContact(null);
      setFeedback({ message: 'Contact deleted successfully!', type: 'success' });
      fetchContacts(); // Refresh the contacts list
    } catch (error) {
      console.error('Error deleting contact:', error);
      setFeedback({ message: 'Error deleting contact', type: 'error' });
    }
  };

  const handlePhotoUpload = (e, isNewContact = true) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isNewContact) {
          setNewContact(prev => ({ ...prev, photo: reader.result }));
        } else {
          setSelectedContact(prev => ({ ...prev, photo: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredAndSortedContacts = contacts
    .filter((contact) => {
      const matchesCategory = filters.category === '' || contact.category === filters.category;
      const matchesCommunicationCadence = filters.communicationCadence === '' || contact.communicationCadence === filters.communicationCadence;
      const matchesName = contact.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchesFavorites = !showFavorites || contact.favorite;
      return matchesCategory && matchesCommunicationCadence && matchesName && matchesFavorites;
    })
    .sort((a, b) => {
      // Sort favorites first, then alphabetically
      if (a.favorite !== b.favorite) {
        return a.favorite ? -1 : 1;
      }
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return sortOrder === 'asc' 
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

  const toggleFavorite = async (id) => {
    try {
      const contact = contacts.find(c => c.id === id);
      const { error } = await supabase
        .from('contacts')
        .update({ favorite: !contact.favorite })
        .eq('id', id);

      if (error) throw error;

      setFeedback({ message: 'Favorite status updated successfully!', type: 'success' });
      fetchContacts(); // Refresh the contacts list
    } catch (error) {
      console.error('Error updating favorite status:', error);
      setFeedback({ message: 'Error updating favorite status', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 p-10">
      <div className="max-w-[1600px] mx-auto">
        <SectionHeader
          title="Contacts"
          subtitle="Manage your contacts and connections."
          center
          icon={Users}
          divider
        />

        {feedback.message && (
          <div className={`mb-4 p-2 rounded ${feedback.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {feedback.message}
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-2">
            <GlowingEffect className=" p-6 rounded-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Categories</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="p-2 hover:bg-background rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowFavorites(!showFavorites);
                    setSelectedCategory('all');
                    setFilters(prev => ({ ...prev, category: '' }));
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    showFavorites
                      ? 'bg-background text-yellow-400'
                      : 'text-neutral hover:text-white hover:bg-background-light'
                  }`}
                >
                  <Star className={`w-5 h-5 ${showFavorites ? 'fill-yellow-400' : ''}`} />
                  <span>Favorites</span>
                </button>
                {categories.map((category) => {
                  const Icon = iconMap[category.icon] || Users;
                  return (
                    <div key={category.id} className="flex items-center group">
                      <button
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setShowFavorites(false);
                          setFilters(prev => ({ ...prev, category: category.id === 'all' ? '' : category.id }));
                        }}
                        className={`flex-1 flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                          selectedCategory === category.id
                            ? ' text-primary'
                            : 'text-neutral hover:text-white hover:bg-background-light'
                        }`}
                        style={{ color: category.color }}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{category.name}</span>
                      </button>
                      {!category.isDefault && (
                        <button
                          onClick={() => handleDeleteContact(category.id)}
                          className="p-2 opacity-0 group-hover:opacity-100 hover:bg-background rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-error" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </GlowingEffect>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <GlowingEffect className=" p-6 rounded-xl">
              <div className="flex flex-col space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      value={filters.name}
                      onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Search contacts..."
                      className="w-full bg-background pl-10 pr-4 py-2 rounded-lg border border-surface focus:outline-none focus:border-primary"
                    />
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-neutral" />
                  </div>
                  <div className="flex items-center space-x-4">
                    <select
                      value={filters.communicationCadence}
                      onChange={(e) => setFilters(prev => ({ ...prev, communicationCadence: e.target.value }))}
                      className="bg-background px-4 py-2 rounded-lg border border-surface focus:outline-none focus:border-primary"
                    >
                      <option value="">All Communication Schedules</option>
                      {communicationCadences.map(cadence => (
                        <option key={cadence.id} value={cadence.id}>{cadence.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="p-2 hover:bg-background rounded-lg transition-colors"
                      title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                    <Button
                      onClick={() => setShowAddModal(true)}
                      variant="primary"
                    >
                      Add New Contact
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-neutral">
                  <span>Showing {filteredAndSortedContacts.length} contacts</span>
                  {(filters.category || filters.communicationCadence || filters.name || showFavorites) && (
                    <button
                      onClick={() => {
                        setFilters({ category: '', communicationCadence: '', name: '' });
                        setShowFavorites(false);
                      }}
                      className="text-primary hover:text-white"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAndSortedContacts.map((contact) => (
                  <Card key={contact.id} accent="blue" icon={User} title={contact.name} className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-background flex-shrink-0">
                        {contact.photo ? (
                          <img
                            src={contact.photo}
                            alt={contact.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                            <User className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral truncate">{contact.email}</p>
                        <p className="text-sm text-neutral truncate">{contact.phone}</p>
                        <div className="mt-2 flex items-center space-x-2">
                          <span
                            className="text-xs px-2 py-1 rounded-full bg-background"
                            style={{
                              color: categories.find(cat => cat.id === contact.category)?.color
                            }}
                          >
                            {categories.find(cat => cat.id === contact.category)?.name}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-background">
                            {contact.communicationCadence}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </GlowingEffect>
          </div>
        </div>
      </div>

      {/* Add/Edit Contact Modal */}
      {(showAddModal || selectedContact) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <GlowingEffect className="bg-surface p-6 rounded-xl max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {isEditing ? 'Edit Contact' : showAddModal ? 'Add New Contact' : selectedContact.name}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedContact(null);
                  setIsEditing(false);
                }}
                className="text-neutral hover:text-error transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isEditing || showAddModal ? (
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                showAddModal ? handleAddContact() : handleUpdateContact();
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex items-center space-x-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-background flex-shrink-0">
                      {(showAddModal ? newContact.photo : selectedContact?.photo) ? (
                        <img
                          src={showAddModal ? newContact.photo : selectedContact.photo}
                          alt="Contact"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                          <User className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, showAddModal)}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="inline-block"
                      >
                        <Button variant="secondary">
                          Upload Photo
                        </Button>
                      </label>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <input
                      type="text"
                      value={showAddModal ? newContact.name : selectedContact.name}
                      onChange={(e) => showAddModal ? 
                        setNewContact({ ...newContact, name: e.target.value }) :
                        setSelectedContact({ ...selectedContact, name: e.target.value })
                      }
                      placeholder="Full Name"
                      className="w-full bg-background px-4 py-2 rounded-lg border border-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <input
                      type="tel"
                      value={showAddModal ? newContact.phone : selectedContact.phone}
                      onChange={(e) => showAddModal ?
                        setNewContact({ ...newContact, phone: e.target.value }) :
                        setSelectedContact({ ...selectedContact, phone: e.target.value })
                      }
                      placeholder="Phone Number"
                      className="w-full bg-background px-4 py-2 rounded-lg border border-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      value={showAddModal ? newContact.email : selectedContact.email}
                      onChange={(e) => showAddModal ?
                        setNewContact({ ...newContact, email: e.target.value }) :
                        setSelectedContact({ ...selectedContact, email: e.target.value })
                      }
                      placeholder="Email Address"
                      className="w-full bg-background px-4 py-2 rounded-lg border border-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={showAddModal ? newContact.company : selectedContact.company}
                      onChange={(e) => showAddModal ?
                        setNewContact({ ...newContact, company: e.target.value }) :
                        setSelectedContact({ ...selectedContact, company: e.target.value })
                      }
                      placeholder="Company"
                      className="w-full bg-background px-4 py-2 rounded-lg border border-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={showAddModal ? newContact.address : selectedContact.address}
                      onChange={(e) => showAddModal ?
                        setNewContact({ ...newContact, address: e.target.value }) :
                        setSelectedContact({ ...selectedContact, address: e.target.value })
                      }
                      placeholder="Address"
                      className="w-full bg-background px-4 py-2 rounded-lg border border-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <select
                      value={showAddModal ? newContact.category : selectedContact.category}
                      onChange={(e) => showAddModal ?
                        setNewContact({ ...newContact, category: e.target.value }) :
                        setSelectedContact({ ...selectedContact, category: e.target.value })
                      }
                      className="w-full bg-background px-4 py-2 rounded-lg border border-surface focus:outline-none focus:border-primary"
                    >
                      {categories.filter(cat => cat.id !== 'all').map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={showAddModal ? newContact.communicationCadence : selectedContact.communicationCadence}
                      onChange={(e) => showAddModal ?
                        setNewContact({ ...newContact, communicationCadence: e.target.value }) :
                        setSelectedContact({ ...selectedContact, communicationCadence: e.target.value })
                      }
                      className="w-full bg-background px-4 py-2 rounded-lg border border-surface focus:outline-none focus:border-primary"
                    >
                      {communicationCadences.map(cadence => (
                        <option key={cadence.id} value={cadence.id}>{cadence.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="date"
                      value={showAddModal ? newContact.lastContactDate : selectedContact.lastContactDate}
                      onChange={(e) => showAddModal ?
                        setNewContact({ ...newContact, lastContactDate: e.target.value }) :
                        setSelectedContact({ ...selectedContact, lastContactDate: e.target.value })
                      }
                      className="w-full bg-background px-4 py-2 rounded-lg border border-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="col-span-2">
                    <textarea
                      value={showAddModal ? newContact.notes : selectedContact.notes}
                      onChange={(e) => showAddModal ?
                        setNewContact({ ...newContact, notes: e.target.value }) :
                        setSelectedContact({ ...selectedContact, notes: e.target.value })
                      }
                      placeholder="Notes about the contact..."
                      className="w-full bg-background px-4 py-2 rounded-lg border border-surface focus:outline-none focus:border-primary"
                      rows="4"
                    />
                  </div>

                  <div className="col-span-2 flex justify-end space-x-2">
                    {!showAddModal && (
                      <Button
                        type="button"
                        onClick={() => handleDeleteContact(selectedContact.id)}
                        variant="destructive"
                      >
                        Delete
                      </Button>
                    )}
                    <Button
                      type="submit"
                      variant="primary"
                    >
                      {showAddModal ? 'Add Contact' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-background flex-shrink-0">
                    {selectedContact.photo ? (
                      <img
                        src={selectedContact.photo}
                        alt={selectedContact.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                        <User className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{selectedContact.name}</h3>
                    <p className="text-neutral">{selectedContact.company}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-neutral" />
                    <span>{selectedContact.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-neutral" />
                    <span>{selectedContact.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-neutral" />
                    <span>{selectedContact.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="w-5 h-5 text-neutral" />
                    <span>{selectedContact.company}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-neutral" />
                    <span>Last Contact: {new Date(selectedContact.lastContactDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-neutral whitespace-pre-wrap">{selectedContact.notes}</p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="primary"
                  >
                    Edit
                  </Button>
                </div>
              </div>
            )}
          </GlowingEffect>
        </div>
      )}
    </div>
  );
} 