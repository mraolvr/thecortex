import { motion } from 'framer-motion';
import { Edit2, Trash2 } from 'lucide-react';
import useCreativeHubStore from '../../../stores/creativeHubStore';

export default function WritingList({ projects, onSelect, onEdit }) {
  const { deleteWritingProject } = useCreativeHubStore();

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await deleteWritingProject(projectId);
    }
  };

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center p-8 text-neutral-400">
        <p>No writing projects yet. Create your first project to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-light/10 border border-surface-light/20 rounded-lg p-4 hover:border-primary/50 transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-white">{project.title}</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(project)}
                className="text-neutral-400 hover:text-white"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(project.id)}
                className="text-neutral-400 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <p className="text-neutral-400 text-sm mb-2 line-clamp-2">
            {project.description || 'No description provided'}
          </p>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {project.genre && (
              <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                {project.genre}
              </span>
            )}
            <span className="px-2 py-1 bg-surface-light/20 text-neutral-400 text-xs rounded">
              {project.status}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
} 