import React from 'react';
import { motion } from 'framer-motion';

interface QuickResponsesProps {
  onSelect: (message: string) => void;
}

const QuickResponses: React.FC<QuickResponsesProps> = ({ onSelect }) => {
  // Generate contextual suggestions based on helpful themes
  const suggestions = [
    "I'm feeling a bit down today.",
    "Can we talk about managing stress?",
    "I had a good day today!",
    "What are some healthy coping skills?",
    "I'm facing a challenge.",
    "I need some encouragement."
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
