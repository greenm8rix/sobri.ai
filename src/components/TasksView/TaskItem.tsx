import React, { useState } from 'react';
import { Check, Clock, AlertTriangle, Trash2, MoreVertical, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { Task } from '../../types';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { markTaskComplete, removeTask } = useStore();
  const [showOptions, setShowOptions] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'self-care':
        return <span className="text-purple-500">🧘</span>;
      case 'physical':
        return <span className="text-green-500">🏃</span>;
      case 'social':
        return <span className="text-blue-500">👥</span>;
      case 'productive':
        return <span className="text-amber-500">📝</span>;
      default:
        return <span className="text-gray-500">📌</span>;
    }
  };

  const handleComplete = () => {
    markTaskComplete(task.id);
  };

  const handleDelete = () => {
    removeTask(task.id);
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={`relative bg-white rounded-lg shadow-sm border overflow-hidden ${task.completed ? 'border-gray-100' : 'border-gray-200'
        }`}
    >
      <div className="flex items-start p-4">
        <button
          onClick={handleComplete}
          disabled={task.completed}
          className={`flex-shrink-0 w-6 h-6 mr-3 mt-0.5 rounded-full flex items-center justify-center border ${task.completed
              ? 'bg-green-500 border-green-500 text-white cursor-default'
              : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50'
            }`}
          aria-label={task.completed ? 'Task completed' : 'Mark as complete'}
        >
          {task.completed && <Check size={14} />}
        </button>

        <div className="flex-1 mr-3">
          <div className="flex items-center mb-1">
            <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
              {task.title}
            </h4>
          </div>

          <p className={`text-sm mb-2 ${task.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
            {task.description}
          </p>

          <div className="flex items-center text-xs text-gray-500 space-x-3">
            {task.timeEstimate && (
              <div className="flex items-center">
                <Clock size={12} className="mr-1" />
                <span>{task.timeEstimate} min</span>
              </div>
            )}

            <div className="flex items-center">
              {getCategoryIcon(task.category)}
              <span className="ml-1 capitalize">{task.category}</span>
            </div>

            <div className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </div>
          </div>
        </div>

        <div className="relative flex-shrink-0">
          <button
            onClick={toggleOptions}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <MoreVertical size={16} className="text-gray-500" />
          </button>

          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-10 w-32"
              >
                {!task.completed && (
                  <button
                    onClick={handleComplete}
                    className="w-full px-3 py-2 text-left text-sm flex items-center hover:bg-gray-50"
                  >
                    <CheckCircle2 size={14} className="mr-2 text-green-500" />
                    Complete
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-sm flex items-center text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskItem;
