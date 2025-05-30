import React from 'react';
import { motion } from 'framer-motion';
import { CravingLevel } from '../../types';

interface CravingSelectorProps {
  selectedCravingLevel: CravingLevel | null;
  onSelectCravingLevel: (level: CravingLevel) => void;
}

const CravingSelector: React.FC<CravingSelectorProps> = ({ 
  selectedCravingLevel, 
  onSelectCravingLevel 
}) => {
  const cravingLevels: { value: CravingLevel; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'severe', label: 'Severe' },
    { value: 'extreme', label: 'Extreme' },
  ];

  return (
    <div className="space-y-3">
      {cravingLevels.map((level) => {
        const isSelected = selectedCravingLevel === level.value;
        const getColorClass = () => {
          if (isSelected) {
            switch (level.value) {
              case 'none': return 'bg-green-100 border-green-500';
              case 'mild': return 'bg-emerald-100 border-emerald-500';
              case 'moderate': return 'bg-yellow-100 border-yellow-500';
              case 'severe': return 'bg-orange-100 border-orange-500';
              case 'extreme': return 'bg-red-100 border-red-500';
              default: return 'bg-indigo-100 border-indigo-500';
            }
          }
          return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
        };
        
        const getBgFillWidth = () => {
          switch (level.value) {
            case 'none': return 'w-[10%]';
            case 'mild': return 'w-[30%]';
            case 'moderate': return 'w-[50%]';
            case 'severe': return 'w-[75%]';
            case 'extreme': return 'w-[95%]';
            default: return 'w-0';
          }
        };
        
        const getBgColor = () => {
          switch (level.value) {
            case 'none': return 'bg-green-200';
            case 'mild': return 'bg-emerald-200';
            case 'moderate': return 'bg-yellow-200';
            case 'severe': return 'bg-orange-200';
            case 'extreme': return 'bg-red-200';
            default: return 'bg-gray-200';
          }
        };

        return (
          <motion.button
            key={level.value}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectCravingLevel(level.value)}
            className={`relative w-full py-3 px-4 rounded-lg border-2 transition-colors duration-200 overflow-hidden text-left ${getColorClass()}`}
          >
            <div className={`absolute top-0 left-0 h-full ${getBgFillWidth()} ${getBgColor()} opacity-30 rounded-l-md`}></div>
            <span className="relative font-medium">{level.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default CravingSelector;