import React from 'react';
import { motion } from 'framer-motion';
import { getTimeFromDate } from '../../utils/dateUtils';

interface MessageBubbleProps {
  message: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, sender, timestamp }) => {
  const isUser = sender === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`
        max-w-[85%] md:max-w-[70%]
        ${isUser 
          ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl shadow-lg' 
          : 'bg-white/90 backdrop-blur-sm border border-gray-100 text-gray-800 rounded-2xl shadow-md'}
        px-4 py-3
      `}>
        <p className="whitespace-pre-wrap">{message}</p>
        <div className={`text-xs mt-2 ${isUser ? 'text-indigo-100/80' : 'text-gray-400'}`}>
          {getTimeFromDate(timestamp)}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;