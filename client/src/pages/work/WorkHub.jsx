import TaskHub from '../../components/tasks/TaskHub';
import GlowingEffect from '../../components/ui/GlowingEffect';
import SectionHeader from '../../components/ui/SectionHeader';
import { Briefcase, Edit2, Trash2, Plus, Target, Link, Unlink, Check, Search } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import useProjectStore from '../../stores/projectStore';
import useGoalsStore from '../../stores/goalsStore';
import useTaskStore from '../../stores/taskStore';
import { supabase } from '../../services/supabase';
import { differenceInDays } from 'date-fns';
import Card from '../../components/ui/Card';
import BackgroundGrid from '../../components/ui/BackgroundGrid';
import Button from '../../components/ui/Button';
import { useUser } from '../../contexts/UserContext';

const priorityColors = {
  high: 'text-red-500',
  medium: 'text-yellow-500',
  low: 'text-green-500'
};

const getProgressColor = (progress) => {
  if (progress >= 80) return 'bg-green-500';
  if (progress >= 50) return 'bg-yellow-500';
  return 'bg-primary';
};

const getDaysRemaining = (dueDate) => {
  const days = differenceInDays(new Date(dueDate), new Date());
  if (days < 0) return 'Overdue';
  if (days === 0) return 'Due today';
  return `${days} days left`;
};

const getTaskStatusColor = (task) => {
  if (task.status === 'done') return 'bg-green-500';
  if (task.due_date) {
    const due = new Date(task.due_date);
    const now = new Date();
    if (due < now) return 'bg-red-500';
    const diff = (due - now) / (1000 * 60 * 60 * 24);
    if (diff <= 2) return 'bg-yellow-400';
  }
  return 'bg-neutral-600';
};

function ProjectDetailsModal({ project, onClose, onEdit, onDelete, onAttachmentChange }) {
  const fileInputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      const filePath = `${project.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('project-attachments').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('project-attachments').getPublicUrl(filePath);
      const newAttachment = {
        name: file.name,
        url: publicUrl,
        uploadedAt: new Date().toISOString(),
      };
      await onAttachmentChange([...(project.attachments || []), newAttachment]);
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
      const idx = urlParts.findIndex((part) => part === 'project-attachments');
      const filePath = urlParts.slice(idx + 1).join('/');
      await supabase.storage.from('project-attachments').remove([filePath]);
      // Remove from project
      const newAttachments = (project.attachments || []).filter(a => a.url !== attachment.url);
      await onAttachmentChange(newAttachments);
    } catch (err) {
      alert('Failed to delete attachment: ' + (err.message || err));
    }
  };

  if (!project) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-surface rounded-xl w-full max-w-lg p-6 relative shadow-xl">
        <Button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral hover:text-white px-2 py-1"
        >
          ×
        </Button>
        <h2 className="text-xl font-semibold mb-4">Project Details</h2>
        <div className="space-y-2 mb-4">
          <div><span className="font-medium">Name:</span> {project.name}</div>
          <div><span className="font-medium">Description:</span> {project.description || <span className="text-neutral">(none)</span>}</div>
          <div><span className="font-medium">Progress:</span> {project.progress}%</div>
          <div><span className="font-medium">Status:</span> {project.status}</div>
        </div>
        {/* Attachments Section */}
        <div className="mb-4">
          <div className="font-medium mb-1">Attachments</div>
          <div className="space-y-2">
            {(project.attachments || []).length === 0 && <div className="text-neutral text-sm">No attachments</div>}
            {(project.attachments || []).map((a, i) => (
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
          <Button onClick={onEdit}>Edit</Button>
          <Button onClick={onDelete} className="bg-neutral-900 text-white hover:bg-neutral-800">Delete</Button>
        </div>
      </div>
    </div>
  );
}

export default function WorkHub() {
  const { user } = useUser();
  const {
    projects,
    isLoading: projectsLoading,
    error: projectsError,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
    clearError: clearProjectsError
  } = useProjectStore();

  const {
    goals,
    addGoal,
    updateProgress,
    deleteGoal,
    editGoal,
    categories,
    templates,
    addDependency,
    removeDependency,
    saveAsTemplate,
    createFromTemplate,
    getGoalAnalytics
  } = useGoalsStore();

  const {
    allTasks,
    fetchSupabaseTasks,
    addTask,
    updateTask,
    deleteTask
  } = useTaskStore();

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    progress: 0,
    status: 'planning',
    attachments: [],
  });
  const [formError, setFormError] = useState('');
  const [formUploading, setFormUploading] = useState(false);
  const [formUploadError, setFormUploadError] = useState('');
  const formFileInputRef = useRef();

  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editProjectForm, setEditProjectForm] = useState({});
  const [editFormUploading, setEditFormUploading] = useState(false);
  const [editFormUploadError, setEditFormUploadError] = useState('');
  const editFormFileInputRef = useRef();
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Personal',
    tags: [],
    dependencies: [],
    milestones: [],
    projects: [],
  });

  const [showGoalAnalytics, setShowGoalAnalytics] = useState(false);
  const [selectedGoalForAnalytics, setSelectedGoalForAnalytics] = useState(null);
  const [showDependencyModal, setShowDependencyModal] = useState(false);
  const [selectedGoalForDependency, setSelectedGoalForDependency] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedGoalForTemplate, setSelectedGoalForTemplate] = useState(null);

  const [editingGoalId, setEditingGoalId] = useState(null);
  const [editGoalForm, setEditGoalForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    milestones: [],
    projects: []
  });
  const [showMilestones, setShowMilestones] = useState({});

  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showProjectLinkModal, setShowProjectLinkModal] = useState(false);
  const [unlinkedProjects, setUnlinkedProjects] = useState([]);

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: new Date().toISOString().split('T')[0],
    priority: 'medium',
    project_id: null,
    status: 'todo'
  });

  const [taskSearch, setTaskSearch] = useState('');
  const [taskFilter, setTaskFilter] = useState('all');

  const [toast, setToast] = useState({ message: '', type: '' });
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 3000);
  };

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskForm, setEditTaskForm] = useState({ 
    title: '', 
    description: '', 
    due_date: '', 
    priority: 'medium', 
    project_id: null,
    status: 'todo'
  });

  const [completingTaskId, setCompletingTaskId] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchSupabaseTasks();
  }, [fetchProjects, fetchSupabaseTasks]);

  const handleProjectInputChange = (e) => {
    const { name, value } = e.target;
    setProjectForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormUploading(true);
    setFormUploadError('');
    try {
      const filePath = `new/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('project-attachments').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('project-attachments').getPublicUrl(filePath);
      const newAttachment = {
        name: file.name,
        url: publicUrl,
        uploadedAt: new Date().toISOString(),
      };
      setProjectForm((prev) => ({ ...prev, attachments: [...(prev.attachments || []), newAttachment] }));
      if (formFileInputRef.current) formFileInputRef.current.value = '';
    } catch (err) {
      setFormUploadError(err.message || 'Upload failed');
    }
    setFormUploading(false);
  };

  const handleRemoveFormAttachment = (url) => {
    setProjectForm((prev) => ({ ...prev, attachments: (prev.attachments || []).filter(a => a.url !== url) }));
  };

  const handleEditFormFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditFormUploading(true);
    setEditFormUploadError('');
    try {
      const filePath = `edit/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('project-attachments').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('project-attachments').getPublicUrl(filePath);
      const newAttachment = {
        name: file.name,
        url: publicUrl,
        uploadedAt: new Date().toISOString(),
      };
      setEditProjectForm((prev) => ({ ...prev, attachments: [...(prev.attachments || []), newAttachment] }));
      if (editFormFileInputRef.current) editFormFileInputRef.current.value = '';
    } catch (err) {
      setEditFormUploadError(err.message || 'Upload failed');
    }
    setEditFormUploading(false);
  };

  const handleRemoveEditFormAttachment = (url) => {
    setEditProjectForm((prev) => ({ ...prev, attachments: (prev.attachments || []).filter(a => a.url !== url) }));
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!projectForm.name.trim()) {
      setFormError('Project name is required');
      return;
    }
    setFormError('');
    await addProject({
      ...projectForm,
      progress: Number(projectForm.progress) || 0,
      attachments: projectForm.attachments || [],
    });
    setProjectForm({ name: '', description: '', progress: 0, status: 'planning', attachments: [] });
    setShowProjectForm(false);
    showToast('Project added!', 'success');
  };

  const startEditProject = (project) => {
    setEditingProjectId(project.id);
    setEditProjectForm({
      name: project.name,
      description: project.description,
      progress: project.progress,
      status: project.status,
      attachments: project.attachments || [],
    });
    setFormError('');
  };

  const handleEditProjectInputChange = (e) => {
    const { name, value } = e.target;
    setEditProjectForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProject = async (e, projectId) => {
    e.preventDefault();
    if (!editProjectForm.name.trim()) {
      setFormError('Project name is required');
      return;
    }
    setFormError('');
    setIsUpdating(true);
    setUpdateError('');
    try {
      await updateProject(projectId, {
        ...editProjectForm,
        progress: Number(editProjectForm.progress) || 0,
        attachments: editProjectForm.attachments || [],
      });
      setEditingProjectId(null);
      setEditProjectForm({});
      showToast('Project updated!', 'success');
    } catch (error) {
      setUpdateError('Failed to update project. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelEditProject = () => {
    if (editProjectForm.name !== projects.find(p => p.id === editingProjectId)?.name ||
        editProjectForm.description !== projects.find(p => p.id === editingProjectId)?.description ||
        editProjectForm.progress !== projects.find(p => p.id === editingProjectId)?.progress ||
        editProjectForm.status !== projects.find(p => p.id === editingProjectId)?.status) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        return;
      }
    }
    setEditingProjectId(null);
    setEditProjectForm({});
    setFormError('');
  };

  const handleProjectAttachmentChange = async (attachments) => {
    if (!selectedProject) return;
    await updateProject(selectedProject.id, { attachments });
    // Optionally, refresh the selectedProject from projects
    const updated = projects.find(p => p.id === selectedProject.id);
    setSelectedProject(updated ? { ...updated, attachments } : { ...selectedProject, attachments });
    showToast('Project updated!', 'success');
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!goalForm.title.trim()) return;
    const newGoal = await addGoal({
      title: goalForm.title.trim(),
      description: goalForm.description.trim(),
      priority: goalForm.priority,
      dueDate: goalForm.dueDate,
      category: goalForm.category,
      tags: goalForm.tags,
      dependencies: goalForm.dependencies,
      milestones: goalForm.milestones
    });
    // Link selected projects
    for (const projectId of goalForm.projects) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        await updateProject(projectId, { ...project, goalId: newGoal.id, goalName: newGoal.title });
      }
    }
    setGoalForm({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'Personal',
      tags: [],
      dependencies: [],
      milestones: [],
      projects: [],
    });
    setShowGoalForm(false);
    showToast('Goal added!', 'success');
  };

  const handleAddTag = (tag) => {
    if (!tag.trim()) return;
    setGoalForm(prev => ({
      ...prev,
      tags: [...new Set([...prev.tags, tag.trim()])]
    }));
  };

  const handleRemoveTag = (tagToRemove) => {
    setGoalForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddDependency = async (goalId, dependencyId) => {
    await addDependency(goalId, dependencyId);
    setShowDependencyModal(false);
    setSelectedGoalForDependency(null);
    showToast('Dependency added!', 'success');
  };

  const handleSaveAsTemplate = async (goalId) => {
    await saveAsTemplate(goalId);
    setShowTemplateModal(false);
    setSelectedGoalForTemplate(null);
    showToast('Goal saved as template!', 'success');
  };

  const handleCreateFromTemplate = async (templateId) => {
    await createFromTemplate(templateId);
    setShowTemplateModal(false);
    setSelectedGoalForTemplate(null);
    showToast('Goal created from template!', 'success');
  };

  const handleStartEdit = (goal) => {
    setEditingGoalId(goal.id);
    setEditGoalForm({
      title: goal.title || '',
      description: goal.description || '',
      priority: goal.priority || 'medium',
      dueDate: goal.dueDate || '',
      milestones: goal.milestones || [],
      projects: projects.filter(p => p.goalId === goal.id).map(p => p.id) || []
    });
  };

  const handleSaveEdit = async (goalId) => {
    if (!editGoalForm.title.trim()) return;
    setIsUpdating(true);
    setUpdateError('');
    try {
      const updates = {
        title: editGoalForm.title.trim(),
        description: editGoalForm.description.trim() || null,
        priority: editGoalForm.priority || null,
        dueDate: editGoalForm.dueDate || null,
        milestones: editGoalForm.milestones || null
      };
      console.log('Sending updates to Supabase:', updates);
      console.log('Calling editGoal with:', { goalId, updates });
      const result = await editGoal(goalId, updates);
      console.log('editGoal result:', result);
      // Link/unlink projects
      const currentlyLinked = projects.filter(p => p.goalId === goalId).map(p => p.id);
      // Link newly selected
      for (const projectId of editGoalForm.projects) {
        if (!currentlyLinked.includes(projectId)) {
          const project = projects.find(p => p.id === projectId);
          if (project) {
            await updateProject(projectId, { ...project, goalId, goalName: editGoalForm.title });
          }
        }
      }
      // Unlink deselected
      for (const projectId of currentlyLinked) {
        if (!editGoalForm.projects.includes(projectId)) {
          const project = projects.find(p => p.id === projectId);
          if (project) {
            await updateProject(projectId, { ...project, goalId: null, goalName: null });
          }
        }
      }
      setEditingGoalId(null);
      setEditGoalForm({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        milestones: [],
        projects: []
      });
      showToast('Goal updated!', 'success');
    } catch (error) {
      setUpdateError('Failed to update goal. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddMilestone = (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    const milestones = goal.milestones || [];
    editGoal(goalId, {
      milestones: [...milestones, { id: crypto.randomUUID(), title: '', completed: false }]
    });
  };

  const handleUpdateMilestone = (goalId, milestoneId, updates) => {
    const goal = goals.find(g => g.id === goalId);
    const milestones = goal.milestones.map(m =>
      m.id === milestoneId ? { ...m, ...updates } : m
    );
    editGoal(goalId, { milestones });
  };

  const handleLinkProjectToGoal = async (projectId, goalId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    // Update project with goal reference
    await updateProject(projectId, {
      ...project,
      goalId,
      goalName: goals.find(g => g.id === goalId)?.title
    });

    // Update goal's progress based on linked projects
    const linkedProjects = projects.filter(p => p.goalId === goalId);
    const progress = linkedProjects.length > 0
      ? Math.round(linkedProjects.reduce((acc, p) => acc + p.progress, 0) / linkedProjects.length)
      : 0;
    
    await updateProgress(goalId, progress);
  };

  const handleUnlinkProjectFromGoal = async (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    // Remove goal reference from project
    await updateProject(projectId, {
      ...project,
      goalId: null,
      goalName: null
    });

    // Update goal's progress if it had this project
    if (project.goalId) {
      const linkedProjects = projects.filter(p => p.goalId === project.goalId && p.id !== projectId);
      const progress = linkedProjects.length > 0
        ? Math.round(linkedProjects.reduce((acc, p) => acc + p.progress, 0) / linkedProjects.length)
        : 0;
      
      await updateProgress(project.goalId, progress);
    }
  };

  const handleGoalClick = (goal) => {
    setSelectedGoal(goal);
    setUnlinkedProjects(projects.filter(p => !p.goalId));
    setShowProjectLinkModal(true);
  };

  // Filtered tasks
  const filteredTasks = allTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(taskSearch.toLowerCase());
    const matchesFilter = taskFilter === 'all' || task.project_id === taskFilter;
    return matchesSearch && matchesFilter;
  });

  // Analytics for summary bar
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'done').length;
  const overdueTasks = allTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length;
  const activeProjects = projects.filter(p => p.status !== 'completed').length;
  const totalProjects = projects.length;
  const inProgressGoals = goals.filter(g => g.progress < 100).length;
  const totalGoals = goals.length;

  const handleStartEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditTaskForm({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      priority: task.priority || 'medium',
      project_id: task.project_id || null,
      status: task.status || 'todo'
    });
  };

  const handleSaveEditTask = async (taskId) => {
    if (!editTaskForm.title.trim()) return;
    await updateTask(taskId, { ...editTaskForm });
    setEditingTaskId(null);
    setEditTaskForm({ 
      title: '', 
      description: '', 
      due_date: '', 
      priority: 'medium', 
      project_id: null,
      status: 'todo'
    });
    showToast('Task updated!', 'success');
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await updateTask(taskId, { status: newStatus });
    showToast('Task status updated!', 'success');
  };

  const handleToggleTask = async (task, e) => {
    if (e) e.preventDefault();
    setCompletingTaskId(task.id);
    try {
      await updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' });
    } catch (err) {
      showToast('Failed to update task', 'error');
    }
    setCompletingTaskId(null);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    console.log('Starting handleSaveTask with form data:', newTask);
    
    try {
      const taskData = {
        ...newTask,
        due_date: newTask.due_date || new Date().toISOString().split('T')[0],
        status: newTask.status || 'todo',
        priority: newTask.priority || 'medium'
      };
      
      console.log('Prepared task data for submission:', taskData);
      
      const result = await addTask(taskData);
      console.log('addTask result:', result);
      
      if (!result) {
        console.error('Task creation failed - no result returned');
        showToast('Failed to create task. Please try again.', 'error');
        return;
      }
      
      console.log('Task created successfully:', result);
      showToast('Task added successfully!', 'success');
      
      // Reset form
      setNewTask({
        title: '',
        description: '',
        due_date: new Date().toISOString().split('T')[0],
        priority: 'medium',
        project_id: null,
        status: 'todo'
      });
      
      // Refresh tasks
      await fetchSupabaseTasks();
    } catch (error) {
      console.error('Error creating task:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        stack: error.stack
      });
      showToast(`Failed to create task: ${error.message}`, 'error');
    }
  };

  return (
    <BackgroundGrid>
      <div className="shadow-2xl rounded-xl">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex justify-between items-center mb-6">
            <SectionHeader 
              title="Work Hub"
              subtitle="Manage your tasks, goals, and projects in one place"  
              center
              icon={Briefcase}
              divider 
            />
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-neutral-400">
                  {user.email}
                </span>
              </div>
            )}
          </div>
          {/* Summary/Analytics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-10">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center shadow-2xl">
              <span className="text-2xl font-bold text-white">{totalTasks}</span>
              <span className="text-xs text-neutral-400 mt-1">Total Tasks</span>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center shadow-2xl">
              <span className="text-2xl font-bold text-white">{completedTasks}</span>
              <span className="text-xs text-neutral-400 mt-1">Completed</span>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center shadow-2xl">
              <span className="text-2xl font-bold text-white">{overdueTasks}</span>
              <span className="text-xs text-neutral-400 mt-1">Overdue</span>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center shadow-2xl">
              <span className="text-2xl font-bold text-white">{activeProjects}</span>
              <span className="text-xs text-neutral-400 mt-1">Active Projects</span>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center shadow-2xl">
              <span className="text-2xl font-bold text-white">{totalProjects}</span>
              <span className="text-xs text-neutral-400 mt-1">Total Projects</span>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col items-center shadow-2xl">
              <span className="text-2xl font-bold text-white">{inProgressGoals}</span>
              <span className="text-xs text-neutral-400 mt-1">Goals In Progress</span>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-8">
            {/* Tasks Column */}
            <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 flex flex-col h-full text-white">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Tasks</h2>
                  <Button
                    className="text-white border border-primary rounded-lg px-3 py-1 bg-primary hover:bg-primary hover:text-white transition-colors text-sm font-medium"
                    onClick={() => setShowAddTaskModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Task
                  </Button>
                </div>
                {allTasks.length === 0 && !showAddTaskModal && (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-400">
                    <img src="/empty-tasks.svg" alt="No Tasks" className="w-20 h-20 mb-4 opacity-80" />
                    <p>No tasks yet. Add a new task to get started!</p>
                  </div>
                )}
                {showAddTaskModal && (
                  <form className="mb-6 space-y-4" onSubmit={handleSaveTask}>
                    <input
                      type="text"
                      value={newTask.title}
                      onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Task title..."
                      className="w-full px-3 py-2 bg-gray-900/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-300"
                      autoFocus
                      required
                    />
                    <textarea
                      value={newTask.description}
                      onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Description (optional)"
                      className="w-full px-3 py-2 bg-gray-900/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none h-20 text-white placeholder-gray-300"
                    />
                    <div className="flex gap-2">
                      <select
                        value={newTask.priority}
                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                        className="px-3 py-2 bg-gray-900 rounded-lg text-neutral-200"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                      <input
                        type="date"
                        value={newTask.due_date}
                        onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                        className="flex-1 px-3 py-2 bg-gray-900 rounded-lg text-neutral-200"
                      />
                    </div>
                    <select
                      value={newTask.project_id || ''}
                      onChange={e => setNewTask({ ...newTask, project_id: e.target.value || null })}
                      className="w-full px-3 py-2 bg-gray-900 rounded-lg text-neutral-200"
                    >
                      <option value="">No Project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                    <div className="flex gap-2 mt-2">
                      <Button type="submit" className="flex-1 bg-primary text-black rounded-lg py-2 hover:bg-primary-dark transition-colors text-sm font-semibold">Add Task</Button>
                      <Button type="button" onClick={() => setShowAddTaskModal(false)} className="p-2 text-neutral-400 hover:text-error transition-colors text-sm">Cancel</Button>
                    </div>
                  </form>
                )}
                <div className="flex flex-col gap-4 overflow-y-auto">
                  {allTasks.map(task => (
                    <div
                      key={task.id}
                      className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 p-4 rounded-xl shadow-md flex flex-col gap-2 hover:shadow-lg transition-shadow cursor-pointer border border-neutral-700 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {editingTaskId === task.id ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editTaskForm.title}
                                onChange={(e) => setEditTaskForm({ ...editTaskForm, title: e.target.value })}
                                className="w-full bg-neutral-900 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-primary text-white"
                                autoFocus
                              />
                              <textarea
                                value={editTaskForm.description}
                                onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })}
                                className="w-full px-2 py-1 bg-neutral-900 rounded focus:outline-none focus:ring-2 focus:ring-primary resize-none h-16 text-white"
                                placeholder="Description (optional)"
                              />
                              <div className="flex gap-2">
                                <select
                                  value={editTaskForm.priority}
                                  onChange={(e) => setEditTaskForm({ ...editTaskForm, priority: e.target.value })}
                                  className="px-2 py-1 bg-neutral-900 rounded text-sm text-white"
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                </select>
                                <input
                                  type="date"
                                  value={editTaskForm.due_date}
                                  onChange={(e) => setEditTaskForm({ ...editTaskForm, due_date: e.target.value })}
                                  className="px-2 py-1 bg-neutral-900 rounded text-sm text-white"
                                />
                                <select
                                  value={editTaskForm.status}
                                  onChange={(e) => setEditTaskForm({ ...editTaskForm, status: e.target.value })}
                                  className="px-2 py-1 bg-neutral-900 rounded text-sm text-white"
                                >
                                  <option value="todo">To Do</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="done">Done</option>
                                </select>
                              </div>
                              <select
                                value={editTaskForm.project_id || ''}
                                onChange={(e) => setEditTaskForm({ ...editTaskForm, project_id: e.target.value || null })}
                                className="w-full px-2 py-1 bg-neutral-900 rounded text-sm text-white"
                              >
                                <option value="">No Project</option>
                                {projects.map(project => (
                                  <option key={project.id} value={project.id}>{project.name}</option>
                                ))}
                              </select>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleSaveEditTask(task.id)}
                                  className="p-1 text-primary hover:text-primary-dark transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => setEditingTaskId(null)}
                                  className="px-3 py-1 bg-neutral-700 text-neutral-200 rounded"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg text-white">{task.title}</h3>
                              </div>
                              {task.description && (
                                <p className="text-neutral-300 text-sm mb-1">{task.description}</p>
                              )}
                              <div className="flex gap-2 mt-1 text-xs">
                                <span className="px-2 py-0.5 rounded bg-neutral-700 text-primary">{task.priority}</span>
                                {task.due_date && <span className="px-2 py-0.5 rounded bg-neutral-700 text-neutral-300">Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                                {task.project_id && <span className="px-2 py-0.5 rounded bg-neutral-700 text-neutral-300">{projects.find(p => p.id === task.project_id)?.name}</span>}
                                <select
                                  value={task.status || 'todo'}
                                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                  className="px-2 py-0.5 rounded bg-neutral-700 text-neutral-300"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <option value="todo">To Do</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="done">Done</option>
                                </select>
                              </div>
                            </>
                          )}
                        </div>
                        {editingTaskId !== task.id && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button onClick={() => handleStartEditTask(task)} className="p-1 text-yellow-400 hover:text-yellow-600"><Edit2 className="w-4 h-4" /></Button>
                            <Button onClick={() => deleteTask(task.id)} className="p-1 text-error hover:text-error-dark transition-colors"><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Goals Column */}
            <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 flex flex-col h-full text-white">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Goals</h2>
                  <div className="flex gap-2">
                    <Button
                      className="text-white border border-primary rounded-lg px-3 py-1 bg-primary hover:bg-primary hover:text-white  transition-colors text-sm font-medium"
                      onClick={() => setShowTemplateModal(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Templates
                    </Button>
                    <Button
                      className="text-white border border-primary rounded-lg px-3 py-1 bg-primary hover:bg-primary hover:text-white  transition-colors text-sm font-medium"
                      onClick={() => setShowGoalForm(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" /> New Goal
                    </Button>
                  </div>
                </div>
                {goals.length === 0 && !showGoalForm && (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-400">
                    <img src="/empty-goals.svg" alt="No Goals" className="w-20 h-20 mb-4 opacity-80" />
                    <p>No goals yet. Add a new goal to get started!</p>
                  </div>
                )}
                {showGoalForm && (
                  <form className="mb-6 space-y-4" onSubmit={handleAddGoal}>
                    <input
                      type="text"
                      value={goalForm.title}
                      onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                      placeholder="Goal title..."
                      className="w-full px-3 py-2 bg-gray-900/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder-gray-300"
                      autoFocus
                    />
                    <textarea
                      value={goalForm.description}
                      onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                      placeholder="Description (optional)"
                      className="w-full px-3 py-2 bg-gray-900/80 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none h-20 text-black placeholder-gray-300"
                    />
                    <div className="flex gap-2">
                      <select
                        value={goalForm.priority}
                        onChange={(e) => setGoalForm({ ...goalForm, priority: e.target.value })}
                        className="px-3 py-2 bg-gray-900 rounded-lg text-neutral-200"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                      <select
                        value={goalForm.category}
                        onChange={(e) => setGoalForm({ ...goalForm, category: e.target.value })}
                        className="px-3 py-2 bg-gray-900 rounded-lg text-neutral-200"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      <input
                        type="date"
                        value={goalForm.dueDate}
                        onChange={(e) => setGoalForm({ ...goalForm, dueDate: e.target.value })}
                        className="flex-1 px-3 py-2 bg-gray-900 rounded-lg text-neutral-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="font-medium text-neutral-200">Tags</div>
                      <div className="flex flex-wrap gap-2">
                        {goalForm.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-900 rounded text-xs flex items-center gap-1 text-neutral-200">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="text-neutral-400 hover:text-error"
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
                          className="flex-1 px-3 py-2 bg-gray-900 rounded-lg text-neutral-200 placeholder-neutral-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-medium text-neutral-200 mb-1">Link Projects</label>
                      <select
                        multiple
                        value={goalForm.projects}
                        onChange={e => {
                          const options = Array.from(e.target.selectedOptions).map(o => o.value);
                          setGoalForm(prev => ({ ...prev, projects: options }));
                        }}
                        className="w-full px-3 py-2 bg-gray-900 rounded-lg text-neutral-200"
                      >
                        {projects.map(project => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                      <div className="text-xs text-neutral-400 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple projects.</div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="flex-1 bg-primary text-black rounded-lg py-2 hover:bg-primary-dark transition-colors text-sm font-semibold"
                      >
                        Add Goal
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowGoalForm(false)}
                        className="p-2 text-neutral-400 hover:text-error transition-colors text-sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                <div className="flex flex-col gap-4">
                  {goals.map((goal) => (
                    <div
                      key={goal.id}
                      className="bg-gradient-to-br from-cyan-900 via-cyan-800 to-cyan-600 p-4 rounded-xl shadow-md flex flex-col gap-2 hover:shadow-lg transition-shadow cursor-pointer border border-neutral-700 group"
                      onClick={() => handleGoalClick(goal)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {editingGoalId === goal.id ? (
                            <div className="space-y-3">
                              {updateError && <div className="text-red-500 text-sm">{updateError}</div>}
                              <input
                                type="text"
                                value={editGoalForm.title}
                                onChange={(e) => setEditGoalForm({ ...editGoalForm, title: e.target.value })}
                                className="w-full bg-neutral-900 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-primary text-black"
                                autoFocus
                              />
                              <textarea
                                value={editGoalForm.description}
                                onChange={(e) => setEditGoalForm({ ...editGoalForm, description: e.target.value })}
                                className="w-full px-2 py-1 bg-neutral-900 rounded focus:outline-none focus:ring-2 focus:ring-primary resize-none h-16 text-black"
                                placeholder="Description (optional)"
                              />
                              <div className="flex gap-2">
                                <select
                                  value={editGoalForm.priority}
                                  onChange={(e) => setEditGoalForm({ ...editGoalForm, priority: e.target.value })}
                                  className="px-2 py-1 bg-neutral-900 rounded text-sm text-neutral-200"
                                >
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                </select>
                                <input
                                  type="date"
                                  value={editGoalForm.dueDate}
                                  onChange={(e) => setEditGoalForm({ ...editGoalForm, dueDate: e.target.value })}
                                  className="px-2 py-1 bg-neutral-900 rounded text-sm text-neutral-200"
                                />
                              </div>
                              <div>
                                <label className="block font-medium text-neutral-200 mb-1">Link Projects</label>
                                <select
                                  multiple
                                  value={editGoalForm.projects || []}
                                  onChange={e => {
                                    const options = Array.from(e.target.selectedOptions).map(o => o.value);
                                    setEditGoalForm(prev => ({ ...prev, projects: options }));
                                  }}
                                  className="w-full px-3 py-2 bg-neutral-900 rounded text-neutral-200"
                                >
                                  {projects.map(project => (
                                    <option key={project.id} value={project.id}>
                                      {project.name}
                                    </option>
                                  ))}
                                </select>
                                <div className="text-xs text-neutral-400 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple projects.</div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  tabIndex={0}
                                  onClick={() => {
                                    console.log('Save button clicked for goalId:', goal.id);
                                    console.log('editGoalForm state:', editGoalForm);
                                    handleSaveEdit(goal.id);
                                  }}
                                  className="p-1 text-primary hover:text-primary-dark transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => setEditingGoalId(null)}
                                  className="px-3 py-1 bg-neutral-700 text-neutral-200 rounded disabled:opacity-50"
                                  disabled={isUpdating}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 mb-1">
                                <Target className="w-5 h-5 text-primary" />
                                <h3 className="font-semibold text-lg text-white">{goal.title}</h3>
                              </div>
                              {goal.description && (
                                <p className="text-neutral-300 text-sm mb-1">{goal.description}</p>
                              )}
                              <div className="flex gap-2 mt-1 text-xs">
                                <span className={`px-2 py-0.5 rounded bg-neutral-700 text-primary`}>{goal.priority}</span>
                                <span className="px-2 py-0.5 rounded bg-neutral-700 text-neutral-300">{getDaysRemaining(goal.dueDate)}</span>
                                <span className="px-2 py-0.5 rounded bg-neutral-700 text-neutral-300">{goal.category}</span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {goal.tags?.map(tag => (
                                  <span key={tag} className="px-2 py-0.5 bg-neutral-900 rounded text-xs text-neutral-300 border border-neutral-700">{tag}</span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                        {editingGoalId !== goal.id && (
                          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              onClick={e => { e.stopPropagation(); handleStartEdit(goal); }}
                              className="p-1 text-neutral-400 hover:text-primary transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={e => { e.stopPropagation(); deleteGoal(goal.id); }}
                              className="p-1 text-neutral-400 hover:text-error transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-neutral-400">
                          <span>Progress</span>
                          <span>{goal.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getProgressColor(goal.progress)}`}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGoalForAnalytics(goal);
                            setShowGoalAnalytics(true);
                          }}
                          className="text-xs text-neutral-300 hover:text-primary px-2 py-1 rounded border border-transparent hover:border-primary bg-neutral-900"
                        >
                          Analytics
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGoalForDependency(goal);
                            setShowDependencyModal(true);
                          }}
                          className="text-xs text-neutral-300 hover:text-primary px-2 py-1 rounded border border-transparent hover:border-primary bg-neutral-900"
                        >
                          Dependencies
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGoalForTemplate(goal);
                            setShowTemplateModal(true);
                          }}
                          className="text-xs text-neutral-300 hover:text-primary px-2 py-1 rounded border border-transparent hover:border-primary bg-neutral-900"
                        >
                          Save as Template
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Projects Column */}
            <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-6 flex flex-col h-full text-white">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white ">Projects</h2>
                  <Button
                    className="text-white border border-primary rounded-lg px-3 py-1 bg-primary hover:bg-primary hover:text-white  transition-colors text-sm font-medium"
                    onClick={() => setShowProjectForm((v) => !v)}
                  >
                    <Plus className="w-4 h-4 mr-1" /> New Project
                  </Button>
                </div>
                {projects.length === 0 && !showProjectForm && (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-400">
                    <img src="/empty-projects.svg" alt="No Projects" className="w-20 h-20 mb-4 opacity-80" />
                    <p>No projects yet. Add a new project to get started!</p>
                  </div>
                )}
                {projectsError && (
                  <div className="bg-red-100 text-red-700 p-2 mb-4 rounded flex items-center gap-2">
                    <span>{projectsError}</span>
                    <button onClick={clearProjectsError} className="ml-2 text-xs text-neutral">Clear</button>
                  </div>
                )}
                {showProjectForm && (
                  <form className="mb-6 space-y-2" onSubmit={handleAddProject}>
                    <input
                      type="text"
                      name="name"
                      value={projectForm.name}
                      onChange={handleProjectInputChange}
                      placeholder="Project name"
                      className="w-full px-3 py-2 rounded border bg-gray-900/80 border-white/10 text-white placeholder-gray-300"
                      required
                    />
                    <textarea
                      name="description"
                      value={projectForm.description}
                      onChange={handleProjectInputChange}
                      placeholder="Description (optional)"
                      className="w-full px-3 py-2 rounded border bg-gray-900/80 border-white/10 text-white placeholder-gray-300"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="progress"
                        value={projectForm.progress}
                        onChange={handleProjectInputChange}
                        min={0}
                        max={100}
                        className="p-2 rounded border bg-gray-900/80 border-white/10 text-white placeholder-white-300 w-24"
                        placeholder="Progress %"
                      />
                      <select
                        name="status"
                        value={projectForm.status}
                        onChange={handleProjectInputChange}
                        className="p-2 rounded border bg-gray-900/80 border-white/10 text-white"
                      >
                        <option value="planning">Planning</option>
                        <option value="in-progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div className="mb-2">
                      <div className="font-medium mb-1">Attachments</div>
                      <div className="space-y-2">
                        {(projectForm.attachments || []).length === 0 && <div className="text-neutral text-sm">No attachments</div>}
                        {(projectForm.attachments || []).map((a, i) => (
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
                    <div className="flex gap-2 mt-2">
                      <Button type="submit" className="px-3 py-1 bg-primary text-black rounded">Add</Button>
                      <Button type="button" onClick={() => setShowProjectForm(false)} className="px-3 py-1 bg-neutral text-black rounded">Cancel</Button>
                    </div>
                  </form>
                )}
                {projectsLoading ? (
                  <div>Loading projects...</div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="bg-gradient-to-br from-purple-900 via-purple-600 to-cyan-600 p-4 rounded-xl shadow-md flex flex-col gap-2 hover:shadow-lg transition-shadow cursor-pointer border border-neutral-700 group"
                        onClick={() => { setSelectedProject(project); setShowProjectDetails(true); }}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <Briefcase className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-lg text-white">{project.name}</h3>
                        </div>
                        <p className="text-neutral-300 text-sm mb-1">{project.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="w-full bg-neutral-700 rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2 transition-all"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs px-2 py-1 rounded bg-neutral-700 text-primary">{project.status}</span>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button onClick={() => startEditProject(project)} className="p-1 text-yellow-600 hover:text-yellow-800"><Edit2 className="w-4 h-4" /></Button>
                              <Button onClick={() => deleteProject(project.id)} className="p-1 text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Project Details Modal */}
              {showProjectDetails && selectedProject && (
                <ProjectDetailsModal
                  project={selectedProject}
                  onClose={() => { setShowProjectDetails(false); setSelectedProject(null); }}
                  onEdit={() => { startEditProject(selectedProject); setShowProjectDetails(false); }}
                  onDelete={() => { deleteProject(selectedProject.id); setShowProjectDetails(false); setSelectedProject(null); }}
                  onAttachmentChange={handleProjectAttachmentChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Goal Analytics Modal */}
      {showGoalAnalytics && selectedGoalForAnalytics && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-surface rounded-xl w-full max-w-lg p-6 relative shadow-xl">
            <button
              onClick={() => {
                setShowGoalAnalytics(false);
                setSelectedGoalForAnalytics(null);
              }}
              className="absolute top-4 right-4 text-neutral hover:text-primary"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">Goal Analytics</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">{selectedGoalForAnalytics.title}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-800 p-3 rounded">
                    <div className="text-sm text-neutral-200">Days Active</div>
                    <div className="text-lg font-medium">{getGoalAnalytics(selectedGoalForAnalytics.id)?.daysActive || 0}</div>
                  </div>
                  <div className="bg-neutral-800 p-3 rounded">
                    <div className="text-sm text-neutral-200">Progress per Day</div>
                    <div className="text-lg font-medium">{getGoalAnalytics(selectedGoalForAnalytics.id)?.progressPerDay?.toFixed(1) || 0}%</div>
                  </div>
                  <div className="bg-neutral-800 p-3 rounded">
                    <div className="text-sm text-neutral-200">Milestone Completion</div>
                    <div className="text-lg font-medium">{getGoalAnalytics(selectedGoalForAnalytics.id)?.milestoneCompletionRate?.toFixed(1) || 0}%</div>
                  </div>
                  <div className="bg-neutral-800 p-3 rounded">
                    <div className="text-sm text-neutral-200">Est. Completion</div>
                    <div className="text-lg font-medium">
                      {getGoalAnalytics(selectedGoalForAnalytics.id)?.estimatedCompletion
                        ? new Date(getGoalAnalytics(selectedGoalForAnalytics.id).estimatedCompletion).toLocaleDateString()
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goal Dependencies Modal */}
      {showDependencyModal && selectedGoalForDependency && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-surface rounded-xl w-full max-w-lg p-6 relative shadow-xl">
            <button
              onClick={() => {
                setShowDependencyModal(false);
                setSelectedGoalForDependency(null);
              }}
              className="absolute top-4 right-4 text-neutral hover:text-primary"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">Goal Dependencies</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Current Dependencies</h3>
                <div className="space-y-2">
                  {selectedGoalForDependency.dependencies?.map(depId => {
                    const depGoal = goals.find(g => g.id === depId);
                    return depGoal ? (
                      <div key={depId} className="flex items-center justify-between bg-neutral-800 p-2 rounded">
                        <span>{depGoal.title}</span>
                        <button
                          onClick={() => removeDependency(selectedGoalForDependency.id, depId)}
                          className="text-error hover:text-error-dark"
                        >
                          Remove
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Add Dependency</h3>
                <div className="space-y-2">
                  {goals
                    .filter(g => g.id !== selectedGoalForDependency.id && !selectedGoalForDependency.dependencies?.includes(g.id))
                    .map(goal => (
                      <div key={goal.id} className="flex items-center justify-between bg-neutral-800 p-2 rounded">
                        <span>{goal.title}</span>
                        <button
                          onClick={() => handleAddDependency(selectedGoalForDependency.id, goal.id)}
                          className="text-primary hover:text-primary-dark"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Goal Templates Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-surface rounded-xl w-full max-w-lg p-6 relative shadow-xl">
            <button
              onClick={() => {
                setShowTemplateModal(false);
                setSelectedGoalForTemplate(null);
              }}
              className="absolute top-4 right-4 text-neutral hover:text-primary"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">Goal Templates</h2>
            <div className="space-y-4">
              {selectedGoalForTemplate ? (
                <div>
                  <h3 className="font-medium mb-2">Save as Template</h3>
                  <p className="text-neutral mb-4">Save "{selectedGoalForTemplate.title}" as a template for future use?</p>
                  <Button
                    onClick={() => handleSaveAsTemplate(selectedGoalForTemplate.id)}
                    className="bg-primary text-black px-4 py-2 rounded"
                  >
                    Save Template
                  </Button>
                </div>
              ) : (
                <div>
                  <h3 className="font-medium mb-2">Available Templates</h3>
                  <div className="space-y-2">
                    {templates.map(template => (
                      <div key={template.id} className="flex items-center justify-between bg-neutral-800 p-2 rounded">
                        <span>{template.title}</span>
                        <button
                          onClick={() => handleCreateFromTemplate(template.id)}
                          className="text-primary hover:text-primary-dark"
                        >
                          Use Template
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.message && (
        <div className={`fixed top-8 right-8 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>{toast.message}</div>
      )}
    </BackgroundGrid>
  );
} 