import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface ProgressCardProps {
  title: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
  accentColor: string;
  animate?: boolean;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  value,
  unit,
  icon,
  color,
  accentColor,
  animate = false,
}) => {
  const controls = useAnimation();
  const prevValue = useRef(value);
  
  useEffect(() => {
    if (animate && value > prevValue.current) {
      controls.start({
        scale: [1, 1.1, 1],
        transition: { duration: 0.5 }
      });
    }
    prevValue.current = value;
  }, [value, animate, controls]);

  return (
    <motion.div 
      animate={controls}
      className={`${color} rounded-xl p-5 border border-gray-100`}
    >
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
          {icon}
        </div>
        <h3 className="text-gray-700 font-medium">{title}</h3>
      </div>
      <div className={`text-3xl font-bold ${accentColor}`}>
        {value}
        <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
      </div>
    </motion.div>
  );
};

export default ProgressCard;