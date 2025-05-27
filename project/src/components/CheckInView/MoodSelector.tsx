import React from 'react';
import { motion } from 'framer-motion';
import { MoodType } from '../../types';

interface MoodSelectorProps {
  selectedMood: MoodType | null;
  onSelectMood: (mood: MoodType) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onSelectMood }) => {
  const moods: { value: MoodType; emoji: string; label: string }[] = [
    { value: 'terrible', emoji: '😞', label: 'Terrible' },
    { value: 'bad', emoji: '😔', label: 'Bad' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'good', emoji: '🙂', label: 'Good' },
    { value: 'great', emoji: '😄', label: 'Great' },
  ];

  return (
    <div className="grid grid-cols-5 gap-2">
      {moods.map((mood) => (
        <motion.button
          key={mood.value}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectMood(mood.value)}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 hover:shadow-md ${
            selectedMood === mood.value
              ? 'bg-gradient-to-b from-indigo-100 to-indigo-50 border-2 border-indigo-500 shadow-inner'
              : 'bg-white/80 backdrop-blur-sm border border-gray-100 hover:bg-gray-50'
          }`}
        >
          <span className="text-2xl mb-1">{mood.emoji}</span>
          <span className="text-xs font-medium tracking-wide">{mood.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default MoodSelector;