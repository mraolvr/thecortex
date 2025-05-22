import { useEffect, useState, useRef } from 'react';
import useTaskStore from '../../stores/taskStore';
import { supabase } from '../../services/supabase';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function TaskDetailsModal({ task, projects, onClose, onEdit, onDelete, onAttachmentChange }) {
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${task.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('task-attachments').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('task-attachments').getPublicUrl(filePath);
      const newAttachment = {
        name: file.name,
        url: publicUrl,
        uploadedAt: new Date().toISOString(),
      };
      await onAttachmentChange([...((task.attachments || [])), newAttachment]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    }
    setUploading(false);
  };

  const handleDeleteAttachment = async (attachment) => {
    if (!window.confirm('Delete this attachment?')) return;
    try {
      // Remove from storage
      const urlParts = attachment.url.split('/');
      const idx = urlParts.findIndex((part) => part === 'task-attachments');
      const filePath = urlParts.slice(idx + 1).join('/');
      await supabase.storage.from('task-attachments').remove([filePath]);
      // Remove from task
      const newAttachments = (task.attachments || []).filter(a => a.url !== attachment.url);
      await onAttachmentChange(newAttachments);
    } catch (err) {
      alert('Failed to delete attachment: ' + (err.message || err));
    }
  };

  if (!task) return null;
  const projectName = task.project_id
    ? (projects.find(p => p.id === task.project_id)?.name || 'Unknown Project')
    : 'No Project';
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-surface rounded-xl w-full max-w-lg p-6 relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral hover:text-primary"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-4">Task Details</h2>
        <div className="space-y-2 mb-4">
          <div><span className="font-medium">Title:</span> {task.title}</div>
          <div><span className="font-medium">Description:</span> {task.description || <span className="text-neutral">(none)</span>}</div>
          <div><span className="font-medium">Priority:</span> {task.priority}</div>
          <div><span className="font-medium">Status:</span> {task.status}</div>
          <div><span className="font-medium">Due Date:</span> {task.dueDate ? new Date(task.dueDate).toLocaleString() : 'No due date'}</div>
          <div><span className="font-medium">Project:</span> {projectName}</div>
          <div><span className="font-medium">Source:</span> {task.source}</div>
          {task.createdAt && <div><span className="font-medium">Created:</span> {new Date(task.createdAt).toLocaleString()}</div>}
          {task.updatedAt && <div><span className="font-medium">Updated:</span> {new Date(task.updatedAt).toLocaleString()}</div>}
        </div>
        {/* Attachments Section */}
        <div className="mb-4">
          <div className="font-medium mb-1">Attachments</div>
          <div className="space-y-2">
            {(task.attachments || []).length === 0 && <div className="text-neutral text-sm">No attachments</div>}
            {(task.attachments || []).map((a, i) => (
              <div key={a.url} className="flex items-center gap-2 text-sm">
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{a.name}</a>
                <span className="text-xs text-neutral">({a.uploadedAt ? new Date(a.uploadedAt).toLocaleString() : ''})</span>
                <button onClick={() => handleDeleteAttachment(a)} className="text-red-500 hover:text-red-700 ml-2">Delete</button>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} disabled={uploading} />
            {uploading && <span className="ml-2 text-xs text-neutral">Uploading...</span>}
            {uploadError && <div className="text-red-500 text-xs mt-1">{uploadError}</div>}
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onEdit} className="px-4 py-2 bg-yellow-500 text-black rounded">Edit</button>
          <button onClick={onDelete} className="px-4 py-2 bg-red-500 text-black rounded">Delete</button>
        </div>
      </div>
    </div>
  );
}

// Accept projects as a prop for project selection
export default function TaskHub({ projects = [] }) {
  const {
    allTasks,
    isLoading,
    error,
    fetchSupabaseTasks,
    addTask,
    updateTask,
    deleteTask,
    groupBy,
    filterBy,
    setGroupBy,
    setFilterBy
  } = useTaskStore();

  // Add attachment state for add/edit forms
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    dueTime: '',
    project_id: projects[0]?.id || '',
    attachments: [],
  });
  const [formError, setFormError] = useState('');
  const [formUploading, setFormUploading] = useState(false);
  const [formUploadError, setFormUploadError] = useState('');
  const formFileInputRef = useRef();

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editFormError, setEditFormError] = useState('');
  const [editFormUploading, setEditFormUploading] = useState(false);
  const [editFormUploadError, setEditFormUploadError] = useState('');
  const editFormFileInputRef = useRef();

  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [filterDue, setFilterDue] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalEditMode, setModalEditMode] = useState(false);
  const [modalEditForm, setModalEditForm] = useState({});
  const [modalEditError, setModalEditError] = useState('');

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Add state for filter visibility
  const [showFilters, setShowFilters] = useState(false);

  const [token, setToken] = useState(null);

  useEffect(() => {
    fetchSupabaseTasks();
  }, [fetchSupabaseTasks]);

  // Filtering logic
  let filteredTasks = allTasks;
  if (filterBy !== 'all') {
    filteredTasks = filteredTasks.filter(t => t.status === filterBy);
  }
  if (filterPriority !== 'all') {
    filteredTasks = filteredTasks.filter(t => t.priority === filterPriority);
  }
  if (filterProject !== 'all') {
    filteredTasks = filteredTasks.filter(t => t.project_id === filterProject);
  }
  if (filterDue) {
    filteredTasks = filteredTasks.filter(t => t.dueDate && t.dueDate.startsWith(filterDue));
  }
  if (search.trim()) {
    const s = search.trim().toLowerCase();
    filteredTasks = filteredTasks.filter(t =>
      t.title.toLowerCase().includes(s) || (t.description && t.description.toLowerCase().includes(s))
    );
  }

  // Grouping logic
  let grouped;
  if (groupBy === 'priority') {
    grouped = filteredTasks.reduce((acc, task) => {
      const key = task.priority || 'No Priority';
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
      return acc;
    }, {});
  } else if (groupBy === 'status') {
    grouped = filteredTasks.reduce((acc, task) => {
      const key = task.status || 'No Status';
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
      return acc;
    }, {});
  } else if (groupBy === 'dueDate') {
    grouped = filteredTasks.reduce((acc, task) => {
      const key = task.dueDate ? task.dueDate.split('T')[0] : 'No Due Date';
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
      return acc;
    }, {});
  } else if (groupBy === 'project') {
    grouped = filteredTasks.reduce((acc, task) => {
      const key = task.project_id
        ? (projects.find(p => p.id === task.project_id)?.name || 'Unknown Project')
        : 'No Project';
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
      return acc;
    }, {});
  } else {
    grouped = { All: filteredTasks };
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Add attachment upload for add form
  const handleFormFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormUploading(true);
    setFormUploadError('');
    try {
      const filePath = `new/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('task-attachments').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('task-attachments').getPublicUrl(filePath);
      const newAttachment = {
        name: file.name,
        url: publicUrl,
        uploadedAt: new Date().toISOString(),
      };
      setForm((prev) => ({ ...prev, attachments: [...(prev.attachments || []), newAttachment] }));
      if (formFileInputRef.current) formFileInputRef.current.value = '';
    } catch (err) {
      setFormUploadError(err.message || 'Upload failed');
    }
    setFormUploading(false);
  };
  const handleRemoveFormAttachment = (url) => {
    setForm((prev) => ({ ...prev, attachments: (prev.attachments || []).filter(a => a.url !== url) }));
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setFormError('Title is required');
      return;
    }
    setFormError('');
    let due_date = form.dueDate;
    if (form.dueDate && form.dueTime) {
      due_date = `${form.dueDate}T${form.dueTime}`;
    }
    await addTask({
      title: form.title,
      description: form.description,
      status: 'todo',
      priority: form.priority,
      due_date: due_date || null,
      project_id: form.project_id || null,
      source: 'supabase',
      attachments: form.attachments || [],
    });
    setForm({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      dueTime: '',
      project_id: projects[0]?.id || '',
      attachments: [],
    });
  };

  // Edit logic
  const startEdit = (task) => {
    let dueDate = '', dueTime = '';
    if (task.dueDate) {
      const [date, time] = task.dueDate.split('T');
      dueDate = date; // This will be in yyyy-MM-dd format
      dueTime = time ? time.slice(0,5) : '';
    }
    setEditingTaskId(task.id);
    setEditForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate,
      dueTime,
      project_id: task.project_id || '',
      attachments: task.attachments || [],
    });
    setEditFormError('');
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Add attachment upload for edit form
  const handleEditFormFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditFormUploading(true);
    setEditFormUploadError('');
    try {
      const filePath = `edit/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('task-attachments').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('task-attachments').getPublicUrl(filePath);
      const newAttachment = {
        name: file.name,
        url: publicUrl,
        uploadedAt: new Date().toISOString(),
      };
      setEditForm((prev) => ({ ...prev, attachments: [...(prev.attachments || []), newAttachment] }));
      if (editFormFileInputRef.current) editFormFileInputRef.current.value = '';
    } catch (err) {
      setEditFormUploadError(err.message || 'Upload failed');
    }
    setEditFormUploading(false);
  };
  const handleRemoveEditFormAttachment = (url) => {
    setEditForm((prev) => ({ ...prev, attachments: (prev.attachments || []).filter(a => a.url !== url) }));
  };

  const handleUpdateTask = async (e, taskId) => {
    e.preventDefault();
    if (!editForm.title.trim()) {
      setEditFormError('Title is required');
      return;
    }
    setEditFormError('');
    let due_date = editForm.dueDate;
    if (editForm.dueDate && editForm.dueTime) {
      due_date = `${editForm.dueDate}T${editForm.dueTime}`;
    }
    setIsUpdating(true);
    setUpdateError('');
    try {
      await updateTask(taskId, {
        title: editForm.title,
        description: editForm.description,
        priority: editForm.priority,
        due_date: due_date || null,
        project_id: editForm.project_id || null,
        attachments: editForm.attachments || [],
      });
      setEditingTaskId(null);
      setEditForm({});
    } catch (error) {
      setUpdateError('Failed to update task. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelEdit = () => {
    if (editForm.title !== allTasks.find(t => t.id === editingTaskId)?.title ||
        editForm.description !== allTasks.find(t => t.id === editingTaskId)?.description ||
        editForm.priority !== allTasks.find(t => t.id === editingTaskId)?.priority ||
        editForm.dueDate !== allTasks.find(t => t.id === editingTaskId)?.dueDate ||
        editForm.project_id !== allTasks.find(t => t.id === editingTaskId)?.project_id) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        return;
      }
    }
    setEditingTaskId(null);
    setEditForm({});
    setEditFormError('');
  };

  // Modal edit logic
  const startModalEdit = () => {
    let dueDate = '', dueTime = '';
    if (selectedTask.dueDate) {
      const [date, time] = selectedTask.dueDate.split('T');
      dueDate = date; // This will be in yyyy-MM-dd format
      dueTime = time ? time.slice(0,5) : '';
    }
    setModalEditMode(true);
    setModalEditForm({
      title: selectedTask.title,
      description: selectedTask.description,
      priority: selectedTask.priority,
      dueDate,
      dueTime,
      project_id: selectedTask.project_id || '',
    });
    setModalEditError('');
  };
  const handleModalEditInputChange = (e) => {
    const { name, value } = e.target;
    setModalEditForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleModalUpdateTask = async (e) => {
    e.preventDefault();
    if (!modalEditForm.title.trim()) {
      setModalEditError('Title is required');
      return;
    }
    setModalEditError('');
    setIsUpdating(true);
    setUpdateError('');
    try {
      let due_date = modalEditForm.dueDate;
      if (modalEditForm.dueDate && modalEditForm.dueTime) {
        due_date = `${modalEditForm.dueDate}T${modalEditForm.dueTime}`;
      }
      await updateTask(selectedTask.id, {
        title: modalEditForm.title,
        description: modalEditForm.description,
        priority: modalEditForm.priority,
        due_date: due_date || null,
        project_id: modalEditForm.project_id || null,
      });
      setModalEditMode(false);
      setShowDetails(false);
      setSelectedTask(null);
    } catch (error) {
      setUpdateError('Failed to update task. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };
  const handleModalDelete = async () => {
    if (window.confirm('Delete this task?')) {
      await deleteTask(selectedTask.id);
      setShowDetails(false);
      setSelectedTask(null);
    }
  };

  // Add this handler for updating attachments
  const handleAttachmentChange = async (attachments) => {
    if (!selectedTask) return;
    await updateTask(selectedTask.id, { attachments });
    // Optionally, refresh the selectedTask from allTasks
    const updated = allTasks.find(t => t.id === selectedTask.id);
    setSelectedTask(updated ? { ...updated, attachments } : { ...selectedTask, attachments });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Unified Task Hub</h1>
      {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}
      <div className="mb-4">
        <button
          className="mb-2 px-3 py-1 bg-neutral-800 text-black rounded hover:bg-primary transition-colors"
          onClick={() => setShowFilters(v => !v)}
          type="button"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        {showFilters && (
          <div className="flex flex-wrap gap-4 items-center">
            <select value={groupBy} onChange={e => setGroupBy(e.target.value)} className="p-2 rounded border">
              <option value="project">Group by Project</option>
              <option value="priority">Group by Priority</option>
              <option value="status">Group by Status</option>
              <option value="dueDate">Group by Due Date</option>
              <option value="none">No Grouping</option>
            </select>
            <select value={filterBy} onChange={e => setFilterBy(e.target.value)} className="p-2 rounded border">
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="p-2 rounded border">
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="p-2 rounded border">
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
              <option value="">No Project</option>
            </select>
            <input
              type="date"
              value={filterDue}
              onChange={e => setFilterDue(e.target.value)}
              className="p-2 rounded border"
              placeholder="Due Date"
            />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="p-2 rounded border flex-1 min-w-[180px]"
              placeholder="Search tasks..."
            />
          </div>
        )}
      </div>
      {isLoading ? (
        <div>Loading tasks...</div>
      ) : (
        Object.entries(grouped).map(([group, tasks]) => (
          <div key={group} className="mb-8">
            <h2 className="text-lg font-semibold mb-2">{group}</h2>
            <div className="space-y-2">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className="bg-background-light p-4 rounded flex flex-col items-start justify-between cursor-pointer"
                  onClick={() => {
                    if (editingTaskId !== task.id) {
                      setSelectedTask(task);
                      setShowDetails(true);
                      setModalEditMode(false);
                    }
                  }}
                >
                  {editingTaskId === task.id ? (
                    <form className="flex-1 flex flex-col gap-2" onClick={e => e.stopPropagation()} onSubmit={e => handleUpdateTask(e, task.id)}>
                      {updateError && <div className="text-red-500 text-sm">{updateError}</div>}
                      <input
                        type="text"
                        name="title"
                        value={editForm.title}
                        onChange={handleEditInputChange}
                        placeholder="Task title"
                        className="px-3 py-2 rounded border"
                        required
                      />
                      <textarea
                        name="description"
                        value={editForm.description}
                        onChange={handleEditInputChange}
                        placeholder="Description (optional)"
                        className="px-3 py-2 rounded border"
                      />
                      <div className="flex gap-2">
                        <select name="priority" value={editForm.priority} onChange={handleEditInputChange} className="p-2 rounded border">
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                        <input
                          type="date"
                          name="dueDate"
                          value={editForm.dueDate}
                          onChange={handleEditInputChange}
                          className="p-2 rounded border"
                        />
                        <input
                          type="time"
                          name="dueTime"
                          value={editForm.dueTime || ''}
                          onChange={handleEditInputChange}
                          className="p-2 rounded border"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-neutral-700 mb-1">Project</label>
                        <select
                          name="project_id"
                          value={editForm.project_id}
                          onChange={handleEditInputChange}
                          className="p-2 rounded border w-full box-border"
                        >
                          {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                          <option value="">No Project</option>
                        </select>
                      </div>
                      {/* Attachments for edit form */}
                      <div className="mb-2">
                        <div className="font-medium mb-1">Attachments</div>
                        <div className="space-y-2">
                          {(editForm.attachments || []).length === 0 && <div className="text-neutral text-sm">No attachments</div>}
                          {(editForm.attachments || []).map((a, i) => (
                            <div key={a.url} className="flex items-center gap-2 text-sm">
                              <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{a.name}</a>
                              <span className="text-xs text-neutral">({a.uploadedAt ? new Date(a.uploadedAt).toLocaleString() : ''})</span>
                              <button type="button" onClick={() => handleRemoveEditFormAttachment(a.url)} className="text-red-500 hover:text-red-700 ml-2">Remove</button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2">
                          <input type="file" ref={editFormFileInputRef} onChange={handleEditFormFileChange} disabled={editFormUploading} />
                          {editFormUploading && <span className="ml-2 text-xs text-neutral">Uploading...</span>}
                          {editFormUploadError && <div className="text-red-500 text-xs mt-1">{editFormUploadError}</div>}
                        </div>
                      </div>
                      {editFormError && <div className="text-red-500 text-sm">{editFormError}</div>}
                      <div className="flex gap-2 mt-2">
                        <button 
                          type="submit" 
                          className="px-2 py-1 bg-primary text-black rounded disabled:opacity-50"
                          disabled={isUpdating}
                        >
                          {isUpdating ? 'Saving...' : 'Save'}
                        </button>
                        <button 
                          type="button" 
                          onClick={cancelEdit} 
                          className="px-2 py-1 bg-neutral text-black rounded disabled:opacity-50"
                          disabled={isUpdating}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-neutral">{task.description}</div>
                        <div className="text-xs text-neutral mt-1">Due: {task.dueDate ? new Date(task.dueDate).toLocaleString() : 'No due date'}</div>
                        <div className="text-xs text-neutral mt-1">Priority: {task.priority}</div>
                        <div className="text-xs text-neutral mt-1">Source: {task.source}</div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' })} className="px-2 py-1 bg-primary text-black rounded">
                          {task.status === 'done' ? 'Mark as To Do' : 'Complete'}
                        </button>
                        <button onClick={() => startEdit(task)} className="px-2 py-1 bg-yellow-500 text-black rounded">Edit</button>
                        <button onClick={() => deleteTask(task.id)} className="px-2 py-1 bg-red-500 text-black rounded">Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
      {/* Task Details Modal */}
      {showDetails && selectedTask && !modalEditMode && (
        <TaskDetailsModal
          task={selectedTask}
          projects={projects}
          onClose={() => { setShowDetails(false); setSelectedTask(null); }}
          onEdit={startModalEdit}
          onDelete={handleModalDelete}
          onAttachmentChange={handleAttachmentChange}
        />
      )}
      {/* Modal Edit Form */}
      {showDetails && selectedTask && modalEditMode && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-surface rounded-xl w-full max-w-lg p-6 relative shadow-xl">
            <button
              onClick={() => setModalEditMode(false)}
              className="absolute top-4 right-4 text-neutral hover:text-primary"
              disabled={isUpdating}
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">Edit Task</h2>
            <form className="space-y-4" onSubmit={handleModalUpdateTask}>
              {updateError && <div className="text-red-500 text-sm">{updateError}</div>}
              <input
                type="text"
                name="title"
                value={modalEditForm.title}
                onChange={handleModalEditInputChange}
                placeholder="Task title"
                className="w-full px-3 py-2 rounded border"
                required
              />
              <textarea
                name="description"
                value={modalEditForm.description}
                onChange={handleModalEditInputChange}
                placeholder="Description (optional)"
                className="w-full px-3 py-2 rounded border"
              />
              <div className="flex gap-2">
                <select name="priority" value={modalEditForm.priority} onChange={handleModalEditInputChange} className="p-2 rounded border">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <input
                  type="date"
                  name="dueDate"
                  value={modalEditForm.dueDate}
                  onChange={handleModalEditInputChange}
                  className="p-2 rounded border"
                />
                <input
                  type="time"
                  name="dueTime"
                  value={modalEditForm.dueTime || ''}
                  onChange={handleModalEditInputChange}
                  className="p-2 rounded border"
                />
              </div>
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Project</label>
                <select
                  name="project_id"
                  value={modalEditForm.project_id}
                  onChange={handleModalEditInputChange}
                  className="p-2 rounded border w-full box-border"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                  <option value="">No Project</option>
                </select>
              </div>
              {modalEditError && <div className="text-red-500 text-sm">{modalEditError}</div>}
              <div className="flex gap-2 mt-2">
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary text-black rounded disabled:opacity-50"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving...' : 'Save'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setModalEditMode(false)} 
                  className="px-4 py-2 bg-neutral text-black rounded disabled:opacity-50"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Add Task Form */}
      <form className="mt-8 space-y-4" onSubmit={handleAddTask}>
        <div>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleInputChange}
            placeholder="Task title"
            className="w-full px-3 py-2 rounded border bg-gray-900/80 border-white/10 text-white placeholder-gray-300"
            required
          />
        </div>
        <div>
          <textarea
            name="description"
            value={form.description}
            onChange={handleInputChange}
            placeholder="Description (optional)"
            className="w-full px-3 py-2 rounded border bg-gray-900/80 border-white/10 text-white placeholder-gray-300"
          />
        </div>
        <div className="flex gap-2">
          <select name="priority" value={form.priority} onChange={handleInputChange} className="p-2 rounded border bg-gray-900/80 border-white/10 text-white">
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleInputChange}
            className="p-2 rounded border bg-gray-900/80 border-white/10 text-white"
          />
          <input
            type="time"
            name="dueTime"
            value={form.dueTime || ''}
            onChange={handleInputChange}
            className="p-2 rounded border bg-gray-900/80 border-white/10 text-white"
          />
        </div>
        {/* Project dropdown below */}
        <div>
          <label className="block font-medium text-neutral-700 mb-1">Project</label>
          <select
            name="project_id"
            value={form.project_id}
            onChange={handleInputChange}
            className="p-2 rounded border bg-gray-900/80 border-white/10 text-white w-full box-border"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
            <option value="">No Project</option>
          </select>
        </div>
        {/* Attachments for add form */}
        <div className="mb-2">
          <div className="font-medium mb-1">Attachments</div>
          <div className="space-y-2">
            {(form.attachments || []).length === 0 && <div className="text-neutral text-sm">No attachments</div>}
            {(form.attachments || []).map((a, i) => (
              <div key={a.url} className="flex items-center gap-2 text-sm">
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{a.name}</a>
                <span className="text-xs text-neutral">({a.uploadedAt ? new Date(a.uploadedAt).toLocaleString() : ''})</span>
                <button type="button" onClick={() => handleRemoveFormAttachment(a.url)} className="text-red-500 hover:text-red-700 ml-2">Remove</button>
              </div>
            ))}
          </div>
          <div className="mt-2">
            <input type="file" ref={formFileInputRef} onChange={handleFormFileChange} disabled={formUploading} />
            {formUploading && <span className="ml-2 text-xs text-neutral">Uploading...</span>}
            {formUploadError && <div className="text-red-500 text-xs mt-1">{formUploadError}</div>}
          </div>
        </div>
        {formError && <div className="text-red-500 text-sm">{formError}</div>}
        <button type="submit" className="px-4 py-2 bg-primary text-black rounded">Add Task</button>
      </form>
      <div className="mt-8">
        {/* Removed Google sign-in button */}
      </div>
    </div>
  );
} 