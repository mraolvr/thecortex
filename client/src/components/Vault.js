import React, { useState, useEffect } from 'react';
import useVaultStore from '../stores/vaultStore';
import './Vault.css'; // Import a CSS file for styling

const Vault = () => {
  const { vaultItems, isLoading, error, fetchVaultItems, addVaultItem, updateVaultItem, deleteVaultItem } = useVaultStore();
  const [newItem, setNewItem] = useState({ name: '', category: '', details: '', file: null });
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState({ message: '', type: '' });

  useEffect(() => {
    fetchVaultItems();
  }, [fetchVaultItems]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewItem((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await addVaultItem(newItem);
    if (result) {
      setFeedback({ message: 'Item added successfully!', type: 'success' });
    } else {
      setFeedback({ message: 'Failed to add item.', type: 'error' });
    }
    setNewItem({ name: '', category: '', details: '', file: null });
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
    setIsModalOpen(false);
    setTimeout(() => setFeedback({ message: '', type: '' }), 3000);
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    setIsEditing(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setIsEditing(false);
  };

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="vault-container">
      <h1 className="vault-title">Vault</h1>
      {feedback.message && (
        <div className={`feedback ${feedback.type}`}>
          {feedback.message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="vault-form">
        <input
          type="text"
          name="name"
          value={newItem.name}
          onChange={handleInputChange}
          placeholder="Item Name"
          required
          className="vault-input"
        />
        <input
          type="text"
          name="category"
          value={newItem.category}
          onChange={handleInputChange}
          placeholder="Category"
          required
          className="vault-input"
        />
        <textarea
          name="details"
          value={newItem.details}
          onChange={handleInputChange}
          placeholder="Details"
          className="vault-textarea"
        />
        <input
          type="file"
          onChange={handleFileChange}
          className="vault-file-input"
        />
        <button type="submit" className="vault-button">Add Item</button>
      </form>
      <ul className="vault-list">
        {vaultItems.map((item) => (
          <li key={item.id} className="vault-item" onClick={() => openModal(item)}>
            <div className="vault-item-details">
              <h3 className="vault-item-name">{item.name}</h3>
              <p className="vault-item-category">Category: {item.category}</p>
              <p className="vault-item-details">Details: {item.details}</p>
              {item.file_path && <p className="vault-item-file">File: {item.file_path}</p>}
            </div>
          </li>
        ))}
      </ul>

      {isModalOpen && selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            {isEditing ? (
              <div className="modal-edit-form">
                <h2>Edit Item</h2>
                <input
                  type="text"
                  value={selectedItem.name}
                  onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
                  className="vault-input"
                />
                <input
                  type="text"
                  value={selectedItem.category}
                  onChange={(e) => setSelectedItem({ ...selectedItem, category: e.target.value })}
                  className="vault-input"
                />
                <textarea
                  value={selectedItem.details}
                  onChange={(e) => setSelectedItem({ ...selectedItem, details: e.target.value })}
                  className="vault-textarea"
                />
                <div className="modal-actions">
                  <button onClick={() => handleUpdate(selectedItem.id, selectedItem)} className="vault-button">Save</button>
                  <button onClick={() => setIsEditing(false)} className="vault-button">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="modal-view">
                <h2>{selectedItem.name}</h2>
                <p><strong>Category:</strong> {selectedItem.category}</p>
                <p><strong>Details:</strong> {selectedItem.details}</p>
                {selectedItem.file_path && <p><strong>File:</strong> {selectedItem.file_path}</p>}
                <div className="modal-actions">
                  <button onClick={() => setIsEditing(true)} className="vault-button">Edit</button>
                  <button onClick={() => handleDelete(selectedItem.id)} className="vault-button delete">Delete</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Vault; 