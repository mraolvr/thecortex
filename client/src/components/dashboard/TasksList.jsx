import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, Square, ListTodo, Trash2, Edit2, 
  Plus, X, Calendar, Flag, Filter 
} from 'lucide-react';
import { listItem, staggerContainer, fadeIn } from '../../utils/animations';
import { format } from 'date-fns';

const priorityColors = {
  high: 'text-red-500',
  medium: 'text-yellow-500',
  low: 'text-green-500'
};

export default function TasksList({ tasks, updateTask }) {
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    category: 'Other',
    priority: 'medium',
    dueDate: ''
  });

  const filteredTasks = selectedCategory === 'All' 
    ? tasks
    : selectedCategory === 'Overdue'
    ? tasks.filter(task => new Date(task.dueDate) < new Date())
    : selectedCategory === 'Due Today'
    ? tasks.filter(task => new Date(task.dueDate).toDateString() === new Date().toDateString())
    : tasks.filter(task => task.category === selectedCategory);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskForm.title.trim()) return;
    // Add task logic here
    setNewTaskForm({
      title: '',
      description: '',
      category: 'Other',
      priority: 'medium',
      dueDate: ''
    });
    setShowAddModal(false);
  };

  const handleStartEdit = (task) => {
    setEditingTask(task.id);
    setEditForm({
      title: task.title,
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate || ''
    });
  };

  const handleSaveEdit = (taskId) => {
    if (!editForm.title.trim()) return;
    // Edit task logic here
    setEditingTask(null);
    setEditForm({});
  };

  // Toggle task completion and update backend
  const toggleTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    await updateTask(taskId, { status: task.status === 'done' ? 'todo' : 'done' });
  };

  return (
    <motion.div 
      className="p-8 rounded-2xl shadow-xl bg-gradient-to-br from-white/80 via-green-50/80 to-blue-100/80 dark:from-gray-900/80 dark:via-gray-800/80 dark:to-blue-900/80 border-l-8 border-green-400 dark:border-blue-500 backdrop-blur-md"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeIn}
    >
      <div className="mb-4">
        <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2 drop-shadow">
          <ListTodo className="w-7 h-7 text-green-500" /> Tasks
        </h2>
      </div>
      <div className="flex items-center gap-2 mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="flex items-center justify-between p-1 bg-gradient-to-br from-white/80 via-teal-100/80 to-pink-200/80 dark:from-green-900/80 dark:via-blue-900/80 dark:to-blue-900/80 border-l-4 border-blue-400 dark:border-blue-500 rounded-lg shadow group"
        >
          <option value="All">All Tasks</option>
          <option value="Overdue">Overdue</option>
          <option value="Due Today">Due Today</option>
          {Array.from(new Set(tasks.map(task => task.category))).map((category, index) => (
            <option key={`${category}-${index}`} value={category}>{category}</option>
          ))}
        </select>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-2 bg-green-100 dark:bg-cyan-900 text-green-600 dark:text-green-200 rounded-full hover:bg-cyan-200 dark:hover:bg-cyan-800 transition-colors shadow"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-2 text-neutral hover:text-error transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-xl font-bold mb-6 text-center">Add New Task</h3>
              <form onSubmit={handleAddTask} className="space-y-4">
                <input
                  type="text"
                  value={newTaskForm.title}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title: e.target.value })}
                  placeholder="Task title..."
                  className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                  autoFocus
                  required
                />
                <textarea
                  value={newTaskForm.description}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, description: e.target.value })}
                  placeholder="Description (optional)"
                  className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24 placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                />
                <div className="flex gap-2">
                  <select
                    value={newTaskForm.category}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, category: e.target.value })}
                    className="px-3 py-2 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-300 dark:border-neutral-700 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {Array.from(new Set(tasks.map(task => task.category))).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                    className="px-3 py-2 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <input
                  type="date"
                  value={newTaskForm.dueDate}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 text-neutral rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="space-y-3"
        variants={staggerContainer}
      >
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              variants={listItem}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex items-center justify-between p-3 bg-gradient-to-br from-blue-600/80  dark:to-blue-900/80 border-l-4 border-blue-400 dark:border-blue-500 rounded-lg shadow group"
            >
              <div className="flex items-center space-x-3 flex-1">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="focus:outline-none focus:ring-2 focus:ring-primary rounded"
                >
                  {task.status === 'done' ? (
                    <CheckSquare className="w-5 h-5 text-primary" />
                  ) : (
                    <Square className="w-5 h-5 text-neutral" />
                  )}
                </button>
                <span className={task.status === 'done' ? 'line-through text-neutral' : ''}>
                  {task.title}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleStartEdit(task)}
                  className="p-1 text-neutral hover:text-primary transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1 text-neutral hover:text-error transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
} 