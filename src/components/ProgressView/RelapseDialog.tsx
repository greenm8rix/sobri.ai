import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../auth/AuthContext';

interface RelapseDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const RelapseDialog: React.FC<RelapseDialogProps> = ({ isOpen, onClose }) => {
  const { markSetback, sendMessage } = useStore(); // Changed markRelapse to markSetback
  const { user } = useAuth(); // Get user from useAuth
  const supabaseUserId = user?.id;
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Record the setback
    markSetback();

    // Send a message to the AI about the setback
    if (supabaseUserId) {
      if (reason.trim()) {
        await sendMessage(`I had a setback. ${reason.trim()}`, supabaseUserId);
      } else {
        await sendMessage("I had a setback and could use some guidance.", supabaseUserId);
      }
    } else {
      console.error("Cannot send setback message: Supabase User ID is missing.");
      // Optionally, handle this case in the UI, e.g., show an error message
    }

    setIsSubmitting(false);
    setReason('');
    onClose();

    // Navigate to chat for guidance
    useStore.getState().setActiveTab('chat');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
          >
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">Record a Setback</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <p className="mb-4 text-gray-700">
                Recording a setback will reset your current streak, but it's an important part of the journey.
                Soberi.ai is here to help you through this moment.
              </p>

              <div className="mb-4">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  What happened? (optional)
                </label>
                <textarea
                  id="reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Share what led to this moment if you'd like..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              <div className="flex space-x-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2">Processing</span>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </>
                  ) : (
                    'Record & Get Guidance'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RelapseDialog;
