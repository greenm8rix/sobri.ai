import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, Search, Tag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../../utils/dateUtils';
import JournalEntry from './JournalEntry';
import NewJournalEntryForm from './NewJournalEntryForm';

const JournalView: React.FC = () => {
  const { journalEntries, removeJournalEntry } = useStore();
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const toggleNewEntryForm = () => {
    setShowNewEntryForm(!showNewEntryForm);
  };

  const closeForm = () => {
    setShowNewEntryForm(false);
  };

  // Extract all unique tags from journal entries
  const allTags = Array.from(
    new Set(journalEntries.flatMap(entry => entry.tags))
  );

  // Filter entries based on search query and selected tag
  const filteredEntries = journalEntries
    .filter(entry => {
      const matchesSearch = searchQuery === '' || 
        entry.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag === null || 
        entry.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search journal entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleNewEntryForm}
          className="flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm"
        >
          <Plus size={18} />
          <span>New Entry</span>
        </motion.button>
      </div>

      {allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <div className="flex items-center mr-1">
            <Tag size={16} className="text-gray-500 mr-1" />
            <span className="text-sm text-gray-600">Filter:</span>
          </div>
          {selectedTag !== null && (
            <button
              onClick={() => setSelectedTag(null)}
              className="text-xs flex items-center gap-1 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors duration-200"
            >
              Clear
              <X size={12} />
            </button>
          )}
          {allTags.map(tag => (
            <motion.button
              key={tag}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`text-xs px-3 py-1 rounded-full transition-colors duration-200 ${
                selectedTag === tag
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {tag}
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showNewEntryForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="mb-8 bg-white rounded-xl shadow-md border border-gray-200 p-5"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">New Journal Entry</h3>
              <button 
                onClick={closeForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            <NewJournalEntryForm onComplete={closeForm} />
          </motion.div>
        )}
      </AnimatePresence>

      {filteredEntries.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-1">No journal entries yet</h3>
          <p className="text-gray-500 mb-4">Start writing to record your thoughts and progress</p>
          <button
            onClick={toggleNewEntryForm}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200"
          >
            Create Your First Entry
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <JournalEntry 
              key={entry.id} 
              entry={entry} 
              onDelete={removeJournalEntry} 
              onSelectTag={setSelectedTag}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default JournalView;