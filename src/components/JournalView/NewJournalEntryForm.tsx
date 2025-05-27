import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { X, Plus } from 'lucide-react';

interface NewJournalEntryFormProps {
  onComplete: () => void;
}

const NewJournalEntryForm: React.FC<NewJournalEntryFormProps> = ({ onComplete }) => {
  const { addJournalEntry } = useStore();
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      // Remove the last tag when backspace is pressed and input is empty
      setTags(tags.slice(0, -1));
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleSubmit = () => {
    if (content.trim()) {
      addJournalEntry(content, tags);
      setContent('');
      setTags([]);
      onComplete();
    }
  };
  
  // Quick tag suggestions
  const tagSuggestions = ['progress', 'challenge', 'victory', 'trigger', 'coping', 'gratitude'];
  
  return (
    <div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind today?"
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        rows={5}
      />
      
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (optional)
        </label>
        
        <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent mb-3">
          {tags.map(tag => (
            <span 
              key={tag} 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {tag}
              <button 
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1.5 text-indigo-600 hover:text-indigo-900 focus:outline-none"
              >
                <X size={14} />
              </button>
            </span>
          ))}
          
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? "Add tags..." : ""}
            className="flex-1 min-w-[120px] outline-none text-sm"
          />
          
          {tagInput && (
            <button
              type="button"
              onClick={handleAddTag}
              className="inline-flex items-center p-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors duration-200"
            >
              <Plus size={14} />
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-1 mb-6">
          <span className="text-xs text-gray-500 mr-1">Suggestions:</span>
          {tagSuggestions.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => !tags.includes(tag) && setTags([...tags, tag])}
              disabled={tags.includes(tag)}
              className={`text-xs px-2 py-0.5 rounded-full transition-colors duration-200 
                ${tags.includes(tag) 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onComplete}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!content.trim()}
          className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
            !content.trim()
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          Save Entry
        </button>
      </div>
    </div>
  );
};

export default NewJournalEntryForm;