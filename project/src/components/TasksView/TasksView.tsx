import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, Check, Calendar, Clock, ArrowRight, X, PencilIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, TaskCategory, TaskPriority } from '../../types';
import { format } from 'date-fns';
import { getCurrentDateString } from '../../utils/dateUtils';
import NewTaskForm from './NewTaskForm';
import TaskItem from './TaskItem';
import InsightCard from './InsightCard';

const TasksView: React.FC = () => {
  const { tasks, insights, markInsightSeen } = useStore();
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getCurrentDateString());
  const [unshownInsights, setUnshownInsights] = useState<typeof insights>([]);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  
  useEffect(() => {
    // Filter insights that haven't been shown yet
    const unseenInsights = insights.filter(insight => !insight.shown);
    setUnshownInsights(unseenInsights);
  }, [insights]);

  const filteredTasks = tasks
    .filter(task => task.date === selectedDate)
    .sort((a, b) => {
      // First by completed status
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // Then by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  const handleNextInsight = () => {
    // Mark current insight as shown
    if (unshownInsights.length > 0 && currentInsightIndex < unshownInsights.length) {
      markInsightSeen(unshownInsights[currentInsightIndex].id);
    }
    
    // Move to next insight if available
    if (currentInsightIndex < unshownInsights.length - 1) {
      setCurrentInsightIndex(currentInsightIndex + 1);
    } else {
      setCurrentInsightIndex(0);
      setUnshownInsights(unshownInsights.filter(insight => !insight.shown));
    }
  };

  const completedTasks = filteredTasks.filter(task => task.completed);
  const pendingTasks = filteredTasks.filter(task => !task.completed);
  
  return (
    <div className="max-w-3xl mx-auto">
      {/* Emotional Insight Card */}
      <AnimatePresence>
        {unshownInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <InsightCard 
              insight={unshownInsights[currentInsightIndex]} 
              onDismiss={handleNextInsight} 
              total={unshownInsights.length}
              current={currentInsightIndex + 1}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Daily Structure</h2>
          <p className="text-gray-600 text-sm">Having a structured day helps build recovery momentum</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedDate(getCurrentDateString())}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors duration-200 ${
              selectedDate === getCurrentDateString()
                ? 'bg-indigo-100 text-indigo-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setShowNewTaskForm(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 shadow-sm text-sm"
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {showNewTaskForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <NewTaskForm onClose={() => setShowNewTaskForm(false)} selectedDate={selectedDate} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <Calendar size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-1">No tasks for {selectedDate === getCurrentDateString() ? 'today' : format(new Date(selectedDate), 'MMMM d, yyyy')}</h3>
          <p className="text-gray-500 mb-4">Structure your day with meaningful activities</p>
          <button
            onClick={() => setShowNewTaskForm(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200"
          >
            Add Your First Task
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingTasks.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Pending Tasks</h3>
              <div className="space-y-2">
                {pendingTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
          
          {completedTasks.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-3">Completed Tasks</h3>
              <div className="space-y-2 opacity-75">
                {completedTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Daily Inspiration */}
      <div className="mt-8 p-5 bg-indigo-50 rounded-lg border border-indigo-100">
        <h3 className="font-medium text-indigo-900 mb-2">Recovery Perspective</h3>
        <p className="text-indigo-700 text-sm italic">
          "Recovery isn't about reaching a destination of constant happiness. It's about building the capacity to experience the full range of human emotions without being overwhelmed by them or needing to escape them."
        </p>
      </div>
    </div>
  );
};

export default TasksView;