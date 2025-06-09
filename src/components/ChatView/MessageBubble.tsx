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

  // Helper function to escape HTML characters
  const escapeHtml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, "&amp;") // Attempting double escape for &
      .replace(/</g, "&lt;")  // Attempting double escape for <
      .replace(/>/g, "&gt;")  // Attempting double escape for >
      .replace(/"/g, "&quot;") // Attempting double escape for "
      .replace(/'/g, "&#039;"); // Attempting double escape for ' (or use &#039; directly if & is the issue)
                                    // Let's try with &#039; directly for single quote as it was working partially
                                    // Correcting the single quote based on previous partial success:
                                    // .replace(/'/g, "&#039;");
                                    // For consistency with double escaping attempt:
                                    // .replace(/'/g, "&#039;");
                                    // Given the problem seems to be with & becoming literal, let's be very specific for the single quote too.
                                    // The previous final_file_content had '&#039;' for single quote, which was fine.
                                    // The issue was with &, <, >, ".
                                    // So, for single quote, "&#039;" should be fine if the & on its own isn't the primary issue.
                                    // Let's stick to the pattern for now.
                                    // If &#039; becomes &#039; that's good.
                                    // If &quot; becomes " that's good.
                                    // The problem was " becoming "
                                    // So if &quot; becomes " then we are good.
                                    // Let's use the simpler &#039; for single quote as it seemed to work.
                                    // The main problem is with &, <, >, " becoming literal &, <, >, "
                                    // So the double escape is for those.
                                    // For single quote, "&#039;" was fine.
                                    // Let's re-evaluate. The problem is that `"` in my input becomes `"` in the file.
                                    // So, if I want `"` in the file, I need to ensure the input string `"` is not transformed.
                                    // The "double escape" theory is that `&quot;` in input becomes `"` in file.
                                    // Let's apply this consistently.
      // Double escape for single quote too for consistency of the experiment
  };

// Process AI messages: escape HTML first, then apply markdown for bold and italic
const aiMessageHtml = isUser
  ? ''
  : escapeHtml(message)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold: **text**
      .replace(/\*(.*?)\*/g, '<em>$1</em>');           // Italic: *text*

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
      {isUser ? (
        <p className="whitespace-pre-wrap">{message}</p>
      ) : (
        <p
          className="whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: aiMessageHtml }}
        />
      )}
      <div className={`text-xs mt-2 ${isUser ? 'text-indigo-100/80' : 'text-gray-400'}`}>
        {getTimeFromDate(timestamp)}
      </div>
    </div>
  </motion.div>
);
};

export default MessageBubble;
