import React from 'react';
import { motion } from 'framer-motion';
import { ElementType } from 'react'; // Import ElementType

interface NavItemProps {
  icon: ElementType; // Use ElementType for the icon prop
  label: string;
  isActive: boolean;
  onClick: () => void;
  vertical?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  label,
  isActive,
  onClick,
  vertical = false
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`
        relative w-full flex ${vertical ? 'flex-row items-center' : 'flex-col items-center justify-center'} 
        ${isActive
          ? vertical
            ? 'text-indigo-600 bg-indigo-50 font-medium'
            : 'text-indigo-600 font-medium'
          : 'text-gray-500 hover:text-gray-700'
        }
        ${vertical ? 'p-3 rounded-lg' : 'py-2'}
        transition-colors duration-200 focus:outline-none
      `}
      aria-label={label}
      aria-pressed={isActive}
      role="tab"
      tabIndex={0}
    >
      <Icon size={vertical ? 20 : 24} className={vertical ? 'mr-3' : 'mb-1'} aria-hidden="true" />
      <span className={vertical ? 'text-sm' : 'text-xs'}>{label}</span>

      {isActive && !vertical && (
        <motion.div
          className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full transform -translate-x-1/2 mb-0.5"
          layoutId="bottom-indicator"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          aria-hidden="true"
        />
      )}
    </motion.button>
  );
};

export default NavItem;
