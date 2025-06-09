import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Send, RefreshCw } from 'lucide-react';

const MemoryContextDemo: React.FC = () => {
  const [message, setMessage] = useState('');
  const [context, setContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateContextFromMemories } = useStore();

  const handleGenerateContext = async () => {
    if (!message.trim()) return;
    setIsGenerating(true);
    // Generate memory context based on the message
    const memoryContext = await generateContextFromMemories(message);
    setContext(memoryContext);
    setIsGenerating(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Memory Context Demo</h1>
        <p className="text-gray-600">
          This demo shows how the AI generates context from past memories to provide more personalized responses.
          Type a message and see what memories the AI would retrieve.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-medium mb-4">Test Memory Retrieval</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter a message to generate context
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message like you would in chat..."
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleGenerateContext}
            disabled={!message.trim() || isGenerating}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200
              ${!message.trim() || isGenerating
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw size={18} className="mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send size={18} className="mr-2" />
                Generate Context
              </>
            )}
          </button>
        </div>
      </div>

      {context && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium mb-4">Retrieved Memory Context</h2>

          {context.trim() === '' ? (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4">
              <p className="text-amber-800">
                No relevant memories found for this message. This could be because:
              </p>
              <ul className="list-disc pl-5 mt-2 text-amber-700 text-sm">
                <li>The AI doesn't have enough memories stored yet</li>
                <li>The message doesn't contain topics that match any stored memories</li>
                <li>The message is too generic or doesn't contain personal information</li>
              </ul>
            </div>
          ) : (
            <>
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-4">
                <p className="text-indigo-800 text-sm">
                  This is the context the AI would use to generate a more personalized response.
                  This information isn't shown to you during normal conversations but helps the AI
                  remember important details about your personal journey.
                </p>
              </div>

              <pre className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm overflow-x-auto whitespace-pre-wrap">
                {context}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MemoryContextDemo;
