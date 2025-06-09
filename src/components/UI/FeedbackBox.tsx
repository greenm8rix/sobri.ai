import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { X } from 'lucide-react'; // For a close button

const CHAT_MESSAGE_COUNT_KEY = 'Soberi_chatMessagesCount';
const FEEDBACK_MILESTONE_SHOWN_KEY_PREFIX = 'Soberi_feedbackMilestoneShown_';
const MILESTONES = [10, 100, 300];

interface FeedbackModalProps {
  chatMessageCount: number;
  onClose: () => void;
  initialFeedback?: string; // In case you want to pre-fill from a smaller prompt
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ chatMessageCount, onClose, initialFeedback = '' }) => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState(initialFeedback);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError('Feedback cannot be empty.');
      return;
    }

    setIsSending(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('send-feedback-email', {
        body: {
          feedbackMessage: feedback,
          userEmail: user?.email || null,
        },
      });

      if (funcError) throw funcError;

      if (data && data.message) {
        setMessage(data.message);
        setFeedback('');
        // Mark this milestone as shown so it doesn't pop up again immediately
        // The parent component will handle permanent storage of shown milestones
        setTimeout(() => { // Give user time to read success message
          onClose();
        }, 2000);
      } else {
        throw new Error(data?.error || 'Failed to send feedback. Unknown error.');
      }

    } catch (err: any) {
      console.error('Feedback submission error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const getMilestoneIncentiveMessage = () => {
    if (chatMessageCount >= 300) return "You're a valued contributor (300+ messages)! Your feedback is highly prioritized and if actionable, could be implemented in 1 day or less!";
    if (chatMessageCount >= 100) return "Thanks for being an active user (100+ messages)! We're listening closely. Actionable feedback might be implemented in 1 day or less!";
    if (chatMessageCount >= 10) return "You've hit 10 messages! Your insights help us improve. Good feedback could be implemented quickly!";
    return "Your feedback is valuable to us!";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Share Your Feedback</h3>
        <p className="text-sm text-gray-600 mb-1">
          Only this message will be sent to our team.
        </p>
        <p className="text-sm text-indigo-600 font-medium mb-3">
          {getMilestoneIncentiveMessage()}
        </p>
        <form onSubmit={handleSubmit}>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us what you think..."
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 min-h-[120px]"
            rows={5}
            disabled={isSending}
          />
          <div className="mt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending || !feedback.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors duration-200 disabled:opacity-50"
            >
              {isSending ? 'Sending...' : 'Send Feedback'}
            </button>
          </div>
        </form>
        {message && <p className="mt-3 text-sm text-green-600 text-center">{message}</p>}
        {error && <p className="mt-3 text-sm text-red-600 text-center">Error: {error}</p>}
      </div>
    </div>
  );
};

// This is a new HOC or parent component part that will manage when to show the FeedbackModal
export const MilestoneFeedbackManager: React.FC = () => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentChatMessageCount, setCurrentChatMessageCount] = useState<number>(0);
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);

  useEffect(() => {
    const count = parseInt(localStorage.getItem(CHAT_MESSAGE_COUNT_KEY) || '0', 10);
    setCurrentChatMessageCount(count);

    // Check if any milestone is hit and not yet shown
    for (const milestone of MILESTONES) {
      if (count >= milestone) {
        const shownKey = `${FEEDBACK_MILESTONE_SHOWN_KEY_PREFIX}${milestone}`;
        if (!localStorage.getItem(shownKey)) {
          setActiveMilestone(milestone);
          setShowFeedbackModal(true);
          break; // Show for the first unshown milestone hit
        }
      }
    }
  }, []); // Runs once on mount

  // This function is called when the chat message count might have changed.
  // It re-reads the count from localStorage and checks for new milestones.
  const handleNewChatMessage = useCallback(() => {
    const newCount = parseInt(localStorage.getItem(CHAT_MESSAGE_COUNT_KEY) || '0', 10);
    setCurrentChatMessageCount(newCount);

    if (showFeedbackModal) return; // Don't interrupt if modal is already shown for a reason

    for (const milestone of MILESTONES) {
      if (newCount >= milestone) {
        const shownKey = `${FEEDBACK_MILESTONE_SHOWN_KEY_PREFIX}${milestone}`;
        if (!localStorage.getItem(shownKey)) {
          setActiveMilestone(milestone);
          setShowFeedbackModal(true);
          break;
        }
      }
    }
  }, [showFeedbackModal]);

  // Listen for changes to the chat message count in localStorage.
  // This allows the component to react when your chat input logic updates the count.
  useEffect(() => {
    window.addEventListener('storage', (event) => {
      if (event.key === CHAT_MESSAGE_COUNT_KEY) {
        handleNewChatMessage();
      }
    });
    // Call it once in case the count updated right before mount
    handleNewChatMessage();
    return () => window.removeEventListener('storage', handleNewChatMessage);
  }, [handleNewChatMessage]);


  const handleCloseModal = () => {
    if (activeMilestone) {
      // Mark this milestone as shown so it doesn't pop up again for this session/user
      localStorage.setItem(`${FEEDBACK_MILESTONE_SHOWN_KEY_PREFIX}${activeMilestone}`, 'true');
    }
    setShowFeedbackModal(false);
    setActiveMilestone(null);
  };

  if (!showFeedbackModal || activeMilestone === null) {
    return null; // Don't render anything if modal shouldn't be shown
  }

  return <FeedbackModal chatMessageCount={currentChatMessageCount} onClose={handleCloseModal} />;
};
