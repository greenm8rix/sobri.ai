import React, { useState, useEffect, useRef } from 'react';
import { Send, RefreshCw, AlertTriangle, Info, X, Heart, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import MessageBubble from './MessageBubble';
import { getWelcomeMessage } from '../../utils/mockUtils';
import ChatSkeleton from './ChatSkeleton';
import QuickResponses from './QuickResponses';
import LegalDisclaimer from '../Legal/LegalDisclaimer';

const ChatView: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const { messages, sendMessage, isLoading, insights, markInsightSeen } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [showEmotionalInsight, setShowEmotionalInsight] = useState(false);
  const [currentInsight, setCurrentInsight] = useState<string | null>(null);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Check for unshown insights
    const unshownInsights = insights.filter(insight => !insight.shown);
    if (unshownInsights.length > 0 && !showEmotionalInsight) {
      setCurrentInsight(unshownInsights[0].content);
      setShowEmotionalInsight(true);
      markInsightSeen(unshownInsights[0].id);
    }
  }, [insights, markInsightSeen]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    await sendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickResponseClick = async (message: string) => {
    await sendMessage(message);
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mb-4"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 2,
                }}
              >
                <Heart size={36} className="text-indigo-500" />
              </motion.div>
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-800">Welcome to Soberi.ai</h3>
            <p className="text-gray-600 max-w-md">
              I'm your personal recovery companion. Chat with me anytime about your journey,
              challenges, or victories. How are you feeling today?
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 text-left w-full max-w-md bg-white rounded-lg p-4 shadow-sm border border-gray-100"
            >
              <p className="text-gray-600 text-sm">{getWelcomeMessage()}</p>
            </motion.div>

            <div className="w-full max-w-md mt-2">
              <QuickResponses onSelect={handleQuickResponseClick} />
            </div>

            {/* Emotional Journey Banner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="w-full max-w-md mt-4 p-4 bg-amber-50 border border-amber-100 rounded-lg"
            >
              <h4 className="font-medium text-amber-800 mb-1">About The Recovery Journey</h4>
              <p className="text-sm text-amber-700">
                Recovery often feels worse before it feels better as your brain heals and you learn to process emotions without substances. This discomfort isn't failure—it's evidence of healing. Trust the process.
              </p>
            </motion.div>
          </div>
        ) : (
          <>
            <AnimatePresence>
              {showInfoBanner && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4 flex items-start"
                >
                  <Info size={18} className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-800 text-sm">Privacy Assured</h4>
                    <p className="text-blue-700 text-xs mt-1">
                      Everything you share is private and confidential. I'm here to support your recovery without judgment.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInfoBanner(false)}
                    className="text-blue-500 hover:text-blue-700 ml-2 flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Emotional Insight Banner */}
            <AnimatePresence>
              {showEmotionalInsight && currentInsight && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4 flex items-start"
                >
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3 flex-shrink-0">
                    <Lightbulb size={16} className="text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-amber-800 text-sm">Recovery Insight</h4>
                    <p className="text-amber-700 text-sm mt-1">
                      {currentInsight}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEmotionalInsight(false)}
                    className="text-amber-500 hover:text-amber-700 ml-2 flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message.content}
                sender={message.sender}
                timestamp={message.timestamp}
              />
            ))}
            {isLoading && <ChatSkeleton />}

            {!isLoading && messages.length > 0 && (
              <div className="my-4">
                <QuickResponses onSelect={handleQuickResponseClick} />
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t bg-white p-4">
        <div className="relative flex items-center">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 resize-none border border-gray-300 rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 max-h-32"
            rows={1}
            aria-label="Message input"
          />
          <button
            onClick={handleSendMessage}
            disabled={inputValue.trim() === '' || isLoading}
            className={`absolute right-3 p-1 rounded-full 
              ${inputValue.trim() === '' || isLoading
                ? 'bg-gray-200 text-gray-400'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
              } transition-colors duration-200`}
            aria-label="Send message"
          >
            {isLoading ? (
              <RefreshCw size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        <div className="flex justify-center mt-2">
          <button
            onClick={() => useStore.getState().setActiveTab('resources')}
            className="flex items-center text-xs text-orange-600 hover:text-orange-800"
          >
            <AlertTriangle size={12} className="mr-1" />
            <span>Need urgent help? Access crisis resources</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;