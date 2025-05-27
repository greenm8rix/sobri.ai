import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Trash2, Clock, Search, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MemoryEntry, MemoryType } from '../../types';
import { format } from 'date-fns';

const MemoryDebugView: React.FC = () => {
  const { memories, removeMemory, addMemory } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<MemoryType | 'all'>('all');
  const [showNewMemoryForm, setShowNewMemoryForm] = useState(false);
  const [newMemory, setNewMemory] = useState<{
    content: string;
    type: MemoryType;
    importance: number;
    tags: string;
  }>({
    content: '',
    type: 'personal_detail',
    importance: 5,
    tags: '',
  });
  
  // Filter memories based on search query and type
  const filteredMemories = memories
    .filter(memory => {
      const matchesSearch = searchQuery === '' || 
        memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesType = typeFilter === 'all' || memory.type === typeFilter;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
  const handleCreateMemory = () => {
    if (newMemory.content.trim() === '') return;
    
    const memoryEntry: MemoryEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      content: newMemory.content,
      type: newMemory.type,
      importance: newMemory.importance,
      tags: newMemory.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      accessCount: 0
    };
    
    addMemory(memoryEntry);
    
    // Reset form
    setNewMemory({
      content: '',
      type: 'personal_detail',
      importance: 5,
      tags: '',
    });
    
    setShowNewMemoryForm(false);
  };
  
  const getMemoryTypeColor = (type: MemoryType): string => {
    switch (type) {
      case 'personal_detail':
        return 'bg-blue-100 text-blue-800';
      case 'preference':
        return 'bg-purple-100 text-purple-800';
      case 'breakthrough':
        return 'bg-green-100 text-green-800';
      case 'trigger':
        return 'bg-red-100 text-red-800';
      case 'coping_strategy':
        return 'bg-teal-100 text-teal-800';
      case 'goal':
        return 'bg-amber-100 text-amber-800';
      case 'relapse':
        return 'bg-orange-100 text-orange-800';
      case 'conversation_summary':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const memoryTypes: MemoryType[] = [
    'personal_detail',
    'preference',
    'breakthrough',
    'trigger',
    'coping_strategy',
    'goal',
    'relapse',
    'conversation_summary'
  ];
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Memory System Debug View</h1>
        <p className="text-gray-600">
          This view allows you to inspect and manage MyBoo.ai's memory system, which helps the AI provide more personalized responses.
        </p>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search memories..."
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
        
        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as MemoryType | 'all')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          >
            <option value="all">All Memory Types</option>
            {memoryTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={() => setShowNewMemoryForm(!showNewMemoryForm)}
          className="flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm whitespace-nowrap"
        >
          <Plus size={18} />
          <span>Add Memory</span>
        </button>
      </div>
      
      <AnimatePresence>
        {showNewMemoryForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 bg-white rounded-xl shadow-md border border-gray-200 p-5"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add New Memory</h3>
              <button 
                onClick={() => setShowNewMemoryForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Memory Content
                </label>
                <textarea
                  value={newMemory.content}
                  onChange={(e) => setNewMemory({ ...newMemory, content: e.target.value })}
                  placeholder="Enter memory content..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Memory Type
                  </label>
                  <select
                    value={newMemory.type}
                    onChange={(e) => setNewMemory({ ...newMemory, type: e.target.value as MemoryType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  >
                    {memoryTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Importance (1-10)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={newMemory.importance}
                      onChange={(e) => setNewMemory({ ...newMemory, importance: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <span className="ml-2 text-sm font-medium w-6 text-center">{newMemory.importance}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newMemory.tags}
                  onChange={(e) => setNewMemory({ ...newMemory, tags: e.target.value })}
                  placeholder="mood, recovery, trigger, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewMemoryForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMemory}
                  disabled={!newMemory.content.trim()}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    !newMemory.content.trim()
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  Save Memory
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-medium mb-4">Memory Entries ({filteredMemories.length})</h2>
        
        {filteredMemories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No memories found matching your criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMemories.map((memory) => (
              <div 
                key={memory.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-indigo-200 transition-colors duration-200"
              >
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${getMemoryTypeColor(memory.type)}`}>
                      {memory.type.replace('_', ' ')}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      Importance: {memory.importance}/10
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock size={12} className="mr-1" />
                      {format(new Date(memory.date), 'MMM d, yyyy')}
                    </span>
                    <button
                      onClick={() => removeMemory(memory.id)}
                      className="ml-3 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <p className="mt-2 text-gray-700">{memory.content}</p>
                
                {memory.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {memory.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="mt-2 text-xs text-gray-500">
                  Accessed {memory.accessCount} times
                  {memory.lastAccessed && ` • Last accessed: ${format(new Date(memory.lastAccessed), 'MMM d, yyyy')}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryDebugView;