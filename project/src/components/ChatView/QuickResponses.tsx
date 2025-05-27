import React from 'react';
import { motion } from 'framer-motion';

interface QuickResponsesProps {
  onSelect: (message: string) => void;
}

const QuickResponses: React.FC<QuickResponsesProps> = ({ onSelect }) => {
  // Generate contextual suggestions based on recovery themes
  const suggestions = [
    "I'm struggling with cravings today",
    "I feel like I might relapse",
    "What coping strategies can help me?",
    "I'm feeling really good today",
    "How do I handle triggers?",
    "I slipped up yesterday"
  ];

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2">Quick responses:</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(suggestion)}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs transition-colors duration-200"
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuickResponses;