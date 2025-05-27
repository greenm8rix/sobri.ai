import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4' 
}) => {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded ${width} ${height} ${className}`}
      aria-hidden="true"
    />
  );
};

export default Skeleton;