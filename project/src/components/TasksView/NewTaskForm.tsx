import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { TaskPriority, TaskCategory } from '../../types';
import { getCurrentDateString } from '../../utils/dateUtils';
import { format } from 'date-fns';

interface NewTaskFormProps {
  onClose: () => void;
  selectedDate?: string;
}

const NewTaskForm: React.FC<NewTaskFormProps> = ({ 
  onClose,
  selectedDate = getCurrentDateString()
}) => {
  const { addTask } = useStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('self-care');
  const [timeEstimate, setTimeEstimate] = useState<number | undefined>(undefined);
  const [date, setDate] = useState(selectedDate);
  
  const handleSubmit = () => {
    if (title.trim()) {
      addTask(
        title,
        description,
        date,
        priority,
        category,
        timeEstimate
      );
      onClose();
    }
  };
  
  const categoryOptions: { value: TaskCategory; label: string; emoji: string }[] = [
    { value: 'self-care', label: 'Self-care', emoji: '🧘' },
    { value: 'physical', label: 'Physical', emoji: '🏃' },
    { value: 'social', label: 'Social', emoji: '👥' },
    { value: 'productive', label: 'Productive', emoji: '📝' },
    { value: 'recovery', label: 'Recovery', emoji: '❤️' }
  ];
  
  const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800 border-blue-200' }
  ];
  
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg">Add New Task</h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Task Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you need to do?"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any details or steps"
            rows={2}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categoryOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCategory(option.value)}
                  className={`px-3 py-2 text-center text-sm rounded-lg border transition-colors duration-200 flex items-center justify-center
                    ${category === option.value 
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-800' 
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <span className="mr-1">{option.emoji}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPriority(option.value)}
                  className={`px-3 py-2 text-center text-sm rounded-lg border transition-colors duration-200
                    ${priority === option.value 
                      ? option.color
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="timeEstimate" className="block text-sm font-medium text-gray-700 mb-1">
              Time Estimate (minutes)
            </label>
            <input
              id="timeEstimate"
              type="number"
              min="1"
              value={timeEstimate || ''}
              onChange={(e) => setTimeEstimate(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="How long will this take?"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={16} className="text-gray-500" />
              </div>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim()}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              !title.trim()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTaskForm;