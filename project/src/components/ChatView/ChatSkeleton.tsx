import React from 'react';
import Skeleton from '../UI/Skeleton';

const ChatSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col space-y-4 animate-pulse">
      {/* User message */}
      <div className="flex justify-end">
        <div className="max-w-[70%] bg-indigo-600 rounded-tl-lg rounded-tr-lg rounded-bl-lg px-4 py-3">
          <Skeleton className="bg-indigo-400 h-4 w-24 mb-2" />
          <Skeleton className="bg-indigo-400 h-4 w-32" />
          <div className="text-xs mt-1 text-indigo-100">
            <Skeleton className="bg-indigo-400 h-3 w-12 mt-1" />
          </div>
        </div>
      </div>
      
      {/* AI response typing indicator */}
      <div className="flex justify-start">
        <div className="max-w-[70%] bg-white border border-gray-200 rounded-tl-lg rounded-tr-lg rounded-br-lg px-4 py-3 shadow-sm">
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSkeleton;