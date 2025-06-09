import React from 'react';
import { motion } from 'framer-motion';
import { UrgeLevel } from '../../types'; // Changed CravingLevel to UrgeLevel

interface UrgeSelectorProps { // Changed CravingSelectorProps
    selectedUrgeLevel: UrgeLevel | null; // Changed selectedCravingLevel
    onSelectUrgeLevel: (level: UrgeLevel) => void; // Changed onSelectCravingLevel
}

const urgeLevels: { level: UrgeLevel; label: string; color: string }[] = [ // Changed cravingLevels
    { level: 'none', label: 'None', color: 'bg-green-500' },
    { level: 'mild', label: 'Mild', color: 'bg-lime-500' },
    { level: 'moderate', label: 'Moderate', color: 'bg-yellow-500' },
    { level: 'severe', label: 'Severe', color: 'bg-orange-500' },
    { level: 'extreme', label: 'Extreme', color: 'bg-red-500' },
];

const UrgeSelector: React.FC<UrgeSelectorProps> = ({ selectedUrgeLevel, onSelectUrgeLevel }) => { // Changed CravingSelector, selectedCravingLevel, onSelectCravingLevel
    return (
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {urgeLevels.map((item) => ( // Changed cravingLevels
                <motion.button
                    key={item.level}
                    onClick={() => onSelectUrgeLevel(item.level)} // Changed onSelectCravingLevel
                    className={`w-full py-3 sm:py-4 rounded-lg text-white text-xs sm:text-sm font-medium focus:outline-none transition-all duration-200
            ${selectedUrgeLevel === item.level ? 'ring-4 ring-offset-2 ring-indigo-400 scale-105' : 'hover:opacity-80'}
            ${item.color}
          `}
                    whileHover={{ scale: selectedUrgeLevel === item.level ? 1.05 : 1.02 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {item.label}
                </motion.button>
            ))}
        </div>
    );
};

export default UrgeSelector; // Changed CravingSelector
