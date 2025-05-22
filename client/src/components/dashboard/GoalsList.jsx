import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Trash2, Edit2, Plus, X, Check, Calendar, Flag } from 'lucide-react';
import useGoalsStore from '../../stores/goalsStore';
import { listItem, staggerContainer, fadeIn, scaleIn } from '../../utils/animations';
import { format, differenceInDays } from 'date-fns';

const priorityColors = {
  high: 'text-red-500',
  medium: 'text-yellow-500',
  low: 'text-green-500'
};

export default function GoalsList() {
  const { goals, addGoal, updateProgress, deleteGoal, updateGoal, isLoading, error, clearError, fetchGoals } = useGoalsStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    milestones: []
  });
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    milestones: []
  });
  const [showMilestones, setShowMilestones] = useState({});

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title.trim()) return;
    const result = await addGoal({
      title: newGoal.title.trim(),
      description: newGoal.description.trim(),
      priority: newGoal.priority,
      dueDate: newGoal.dueDate,
      milestones: newGoal.milestones
    });
    if (!result) {
      alert('Failed to add goal. Please try again.');
      return;
    }
    setNewGoal({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      milestones: []
    });
    setShowAddForm(false);
  };

  const handleStartEdit = (goal) => {
    setEditingGoal(goal.id);
    setEditForm({
      title: goal.title || '',
      description: goal.description || '',
      priority: goal.priority || 'medium',
      dueDate: goal.due_date ? format(new Date(goal.due_date), 'yyyy-MM-dd') : '',
      milestones: goal.milestones || []
    });
  };

  const handleSaveEdit = async (goalId) => {
    console.log('handleSaveEdit called for goalId:', goalId, editForm);
    if (!editForm.title.trim()) return;
    try {
      const result = await updateGoal(goalId, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        priority: editForm.priority,
        dueDate: editForm.dueDate ? format(new Date(editForm.dueDate), 'yyyy-MM-dd') : '',
        milestones: editForm.milestones
      });
      console.log('Update result:', result);
      if (!result) {
        alert('Failed to update goal. Check the console for details.');
        return;
      }
      setEditingGoal(null);
      setEditForm({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        milestones: []
      });
    } catch (err) {
      alert('An error occurred while updating the goal. Check the console for details.');
      console.error('Error in handleSaveEdit:', err);
    }
  };

  const handleAddMilestone = (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    const milestones = goal.milestones || [];
    updateGoal(goalId, {
      milestones: [...milestones, { id: crypto.randomUUID(), title: '', completed: false }]
    });
  };

  const handleUpdateMilestone = (goalId, milestoneId, updates) => {
    const goal = goals.find(g => g.id === goalId);
    const milestones = goal.milestones.map(m =>
      m.id === milestoneId ? { ...m, ...updates } : m
    );
    updateGoal(goalId, { milestones });
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-primary';
  };

  const getDaysRemaining = (due_date) => {
    const days = differenceInDays(new Date(due_date), new Date());
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    return `${days} days left`;
  };

  return (
    <motion.div 
      className="p-8 rounded-2xl shadow-xl bg-gradient-to-br from-white/80 via-yellow-50/80 to-pink-100/80 dark:from-gray-900/80 dark:via-gray-800/80 dark:to-pink-900/80 border-l-8 border-yellow-400 dark:border-pink-500 backdrop-blur-md"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={fadeIn}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white flex items-center gap-2 drop-shadow">
          <Target className="w-7 h-7 text-yellow-500" /> Goals
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="p-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-200 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors shadow"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showAddForm && (
          <motion.form 
            onSubmit={handleAddGoal} 
            className="mb-6 space-y-4"
            variants={scaleIn}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {isLoading && <div className="text-blue-500">Saving...</div>}
            {error && (
              <div className="text-red-500 flex items-center gap-2">
                {error}
                <button onClick={clearError} className="ml-2 text-xs underline">Dismiss</button>
              </div>
            )}
            <input
              type="text"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              placeholder="Goal title..."
              className="w-full px-3 py-2 bg-background-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <textarea
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              placeholder="Description (optional)"
              className="w-full px-3 py-2 bg-background-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24"
            />
            <div className="flex gap-2">
              <select
                value={newGoal.priority}
                onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                className="px-3 py-2 bg-background-light rounded-lg"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <input
                type="date"
                value={newGoal.dueDate}
                onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })}
                className="flex-1 px-3 py-2 bg-background-light rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-primary text-white rounded-lg py-2 hover:bg-primary-dark transition-colors"
              >
                Add Goal
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-2 text-neutral hover:text-error transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.div 
        className="space-y-4"
        variants={staggerContainer}
      >
        <AnimatePresence mode="popLayout">
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              layout
              variants={listItem}
              initial="initial"
              animate="animate"
              exit="exit"
              className="p-4 bg-neutral-950 rounded-lg space-y-3 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {editingGoal === goal.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editForm.title || ''}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full bg-background px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                      />
                      <textarea
                        value={editForm.description || ''}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full px-2 py-1 bg-background rounded focus:outline-none focus:ring-2 focus:ring-primary resize-none h-20"
                        placeholder="Description (optional)"
                      />
                      <div className="flex gap-2">
                        <select
                          value={editForm.priority || 'medium'}
                          onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                          className="px-2 py-1 bg-background rounded text-sm"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        <input
                          type="date"
                          value={editForm.dueDate || ''}
                          onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                          className="px-2 py-1 bg-background rounded text-sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-medium text-lg">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-neutral mt-1">{goal.description}</p>
                      )}
                      <div className="flex gap-2 mt-2 text-xs">
                        <span className={`px-2 py-0.5 bg-background rounded ${priorityColors[goal.priority]}`}>
                          {goal.priority}
                        </span>
                        <span className="px-2 py-0.5 bg-background rounded text-neutral">
                          {getDaysRemaining(goal.due_date)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {editingGoal === goal.id ? (
                    <>
                      <button
                        type="button"
                        tabIndex={0}
                        onClick={() => {
                          console.log('Save button clicked for goalId:', goal.id);
                          console.log('editForm state:', editForm);
                          handleSaveEdit(goal.id);
                        }}
                        className="p-1 text-primary hover:text-primary-dark transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingGoal(null)}
                        className="p-1 text-neutral hover:text-error transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEdit(goal)}
                        className="p-1 text-neutral hover:text-primary transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1 text-neutral hover:text-error transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm text-neutral">
                  <span>Progress</span>
                  <span>{goal.progress}%</span>
                </div>
                <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${getProgressColor(goal.progress)}`}
                    style={{ width: `${goal.progress}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowMilestones({ ...showMilestones, [goal.id]: !showMilestones[goal.id] })}
                  className="text-sm text-neutral hover:text-primary transition-colors flex items-center gap-1"
                >
                  <span>Milestones</span>
                  {showMilestones[goal.id] ? (
                    <motion.span initial={{ rotate: 0 }} animate={{ rotate: 180 }}>▼</motion.span>
                  ) : (
                    <motion.span initial={{ rotate: 180 }} animate={{ rotate: 0 }}>▼</motion.span>
                  )}
                </button>

                <AnimatePresence>
                  {showMilestones[goal.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-2 space-y-2 overflow-hidden"
                    >
                      {(goal.milestones || []).map((milestone) => (
                        <div key={milestone.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={milestone.completed}
                            onChange={(e) => handleUpdateMilestone(goal.id, milestone.id, { completed: e.target.checked })}
                            className="rounded border-neutral"
                          />
                          <input
                            type="text"
                            value={milestone.title}
                            onChange={(e) => handleUpdateMilestone(goal.id, milestone.id, { title: e.target.value })}
                            placeholder="Milestone title..."
                            className="flex-1 bg-background px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddMilestone(goal.id)}
                        className="text-sm text-neutral hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Milestone</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
} 