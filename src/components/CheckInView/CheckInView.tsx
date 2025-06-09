import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import MoodSelector from './MoodSelector';
import UrgeSelector from './UrgeSelector'; // Renamed CravingSelector
import { MoodType, UrgeLevel } from '../../types'; // Renamed CravingLevel
import { getCurrentDateString } from '../../utils/dateUtils';
import { getCheckInByDate } from '../../utils/storageUtils';
// import { getMockResponseBasedOnMood } from '../../utils/mockUtils'; // Removed as per user feedback
// import EmergencyResources from '../Resources/EmergencyResources'; // Removed as per user feedback
import { useAuth } from '../../auth/AuthContext';

const CheckInView: React.FC = () => {
  const { user } = useAuth();
  const { submitCheckIn, sendMessage } = useStore();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [selectedUrgeLevel, setSelectedUrgeLevel] = useState<UrgeLevel | null>(null); // Renamed selectedCravingLevel
  const [notes, setNotes] = useState('');
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  // const [showCrisisResources, setShowCrisisResources] = useState(false); // Removed as per user feedback
  const [showCrisisOptions, setShowCrisisOptions] = useState(false);

  useEffect(() => {
    const today = getCurrentDateString();
    const todayCheckIn = getCheckInByDate(today);

    if (todayCheckIn) {
      setSelectedMood(todayCheckIn.mood);
      setSelectedUrgeLevel(todayCheckIn.urgeLevel); // Renamed selectedCravingLevel and todayCheckIn.cravingLevel
      setNotes(todayCheckIn.notes);
      setAlreadyCheckedIn(true);
    }
  }, []);

  // Show crisis options when extreme urges are selected
  useEffect(() => {
    if (selectedUrgeLevel === 'extreme' || selectedUrgeLevel === 'severe') { // Renamed selectedCravingLevel
      // setShowCrisisResources(true); // Removed as per user feedback
      setShowCrisisOptions(true);
    } else {
      // setShowCrisisResources(false); // Removed as per user feedback
      setShowCrisisOptions(false);
    }
  }, [selectedUrgeLevel]); // Renamed selectedCravingLevel

  const handleSubmit = async () => {
    if (selectedMood && selectedUrgeLevel) { // Renamed selectedCravingLevel
      // Submit the check-in
      submitCheckIn(selectedMood, selectedUrgeLevel, notes); // Renamed selectedCravingLevel
      // If severe/extreme urges, direct user to chat for guidance
      if (selectedUrgeLevel === 'extreme' || selectedUrgeLevel === 'severe') { // Renamed selectedCravingLevel
        setSubmissionComplete(true);
        setTimeout(() => {
          useStore.getState().setActiveTab('chat');
        }, 1500);
      } else {
        setSubmissionComplete(true);
      }
    }
  };

  const handleTalkToCompanion = async () => {
    if (selectedMood && selectedUrgeLevel) { // Renamed selectedCravingLevel
      // Submit the check-in first (it uses its own internal ID system)
      submitCheckIn(selectedMood, selectedUrgeLevel, notes); // Renamed selectedCravingLevel

      // Generate message for chat
      const message = `I'm experiencing ${selectedUrgeLevel} urges right now and feeling ${selectedMood}.`; // Updated message

      // Switch to chat view
      useStore.getState().setActiveTab('chat');

      if (!user || !user.id) {
        console.error("User or user.id is not available for sending message to Companion App.");
        const tempIdForLocal = useStore.getState().messages.length > 0 ? useStore.getState().messages[0].id : 'temp-error-id';
        const localErrorMsg = {
          id: tempIdForLocal + 'error',
          content: 'You need to be logged in to talk to Companion App. Please log in and try again.',
          sender: 'ai' as 'ai' | 'user',
          timestamp: Date.now(),
        };
        useStore.setState(state => ({ messages: [...state.messages, localErrorMsg] }));
        return;
      }

      // Add a small delay to ensure UI has updated after setActiveTab
      setTimeout(() => {
        sendMessage(message, user.id);
      }, 100);
    }
  };

  const resetForm = () => {
    setSelectedMood(null);
    setSelectedUrgeLevel(null); // Renamed selectedCravingLevel
    setNotes('');
    setSubmissionComplete(false);
    setAlreadyCheckedIn(false);
  };

  if (submissionComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h3 className="text-xl font-semibold mb-2">Check-In Complete!</h3>

          {(selectedUrgeLevel === 'extreme' || selectedUrgeLevel === 'severe') ? ( // Renamed selectedCravingLevel
            <div>
              <p className="text-gray-600 mb-3">I've noticed you're experiencing strong urges right now.</p> {/* cravings to urges */}
              <p className="text-gray-600 mb-6">Taking you to the chat for guidance...</p>
            </div>
          ) : (
            <p className="text-gray-600 mb-6">Thank you for checking in today. Your honesty helps build self-awareness, a key skill on your journey.</p>
          )}

          <button
            onClick={resetForm}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200"
          >
            Check In Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {alreadyCheckedIn ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium">You've already checked in today</h3>
              <p className="text-sm text-gray-500">Want to update your check-in?</p>
            </div>
          </div>
          <button
            onClick={resetForm}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors duration-200"
          >
            Update Today's Check-In
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <h2 className="text-xl font-semibold mb-2">Daily Check-In</h2>
          <p className="text-gray-600 text-sm mb-6">Tracking your mood and urges helps build self-awareness and identifies patterns on your journey.</p> {/* cravings to urges */}

          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How are you feeling today?
              </label>
              <MoodSelector selectedMood={selectedMood} onSelectMood={setSelectedMood} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rate your urges/strong desires today {/* cravings to urges/strong desires */}
              </label>
              <UrgeSelector // Renamed CravingSelector
                selectedUrgeLevel={selectedUrgeLevel} // Renamed selectedCravingLevel
                onSelectUrgeLevel={setSelectedUrgeLevel} // Renamed onSelectCravingLevel
              />
            </div>

            {/* Removed CrisisResources section */}

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What's affecting your mood or urges today? Any notable events or feelings?" /* cravings to urges */
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {showCrisisOptions ? (
              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleTalkToCompanion}
                  className="w-full py-3 px-4 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-200"
                >
                  Talk to Companion Now
                </button>
                <button
                  onClick={handleSubmit}
                  className="w-full py-3 px-4 rounded-lg font-medium bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-50 transition-colors duration-200"
                >
                  Submit Check-In Only
                </button>
              </div>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!selectedMood || !selectedUrgeLevel} // Renamed selectedCravingLevel
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200
                  ${(!selectedMood || !selectedUrgeLevel) // Renamed selectedCravingLevel
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
              >
                Submit Check-In
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CheckInView;
