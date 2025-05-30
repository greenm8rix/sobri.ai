import React, { useState } from 'react';
import { Trash2, MoreVertical, Tag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JournalEntry as JournalEntryType } from '../../types';
import { formatDate } from '../../utils/dateUtils';

interface JournalEntryProps {
  entry: JournalEntryType;
  onDelete: (id: string) => void;
  onSelectTag: (tag: string) => void;
}

const JournalEntry: React.FC<JournalEntryProps> = ({ entry, onDelete, onSelectTag }) => {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = () => {
    setIsDeleting(true);
    // Short delay to allow animation to complete
    setTimeout(() => {
      onDelete(entry.id);
    }, 300);
  };
  
  const toggleActions = () => {
    setShowActions(!showActions);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDeleting ? 0 : 1, y: isDeleting ? -20 : 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="text-sm text-gray-500">
            {formatDate(entry.date)}
          </div>
          <div className="relative">
            <button 
              onClick={toggleActions}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
              aria-label="Entry actions"
            >
              <MoreVertical size={16} className="text-gray-500" />
            </button>
            
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10 overflow-hidden"
                >
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="prose prose-sm max-w-none mb-4">
          <p className="whitespace-pre-wrap">{entry.content}</p>
        </div>
        
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {entry.tags.map(tag => (
              <button
                key={tag}
                onClick={() => onSelectTag(tag)}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors duration-200"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default JournalEntry;