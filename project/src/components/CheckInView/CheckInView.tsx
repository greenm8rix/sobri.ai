import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import MoodSelector from './MoodSelector';
import CravingSelector from './CravingSelector';
import { MoodType, CravingLevel } from '../../types';
import { getCurrentDateString } from '../../utils/dateUtils';
import { getCheckInByDate } from '../../utils/storageUtils';
import { getMockResponseBasedOnMood } from '../../utils/mockUtils';
import EmergencyResources from '../Resources/EmergencyResources';

const CheckInView: React.FC = () => {
  const { submitCheckIn, sendMessage } = useStore();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [selectedCravingLevel, setSelectedCravingLevel] = useState<CravingLevel | null>(null);
  const [notes, setNotes] = useState('');
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [showCrisisResources, setShowCrisisResources] = useState(false);
  const [showCrisisOptions, setShowCrisisOptions] = useState(false);

  useEffect(() => {
    const today = getCurrentDateString();
    const todayCheckIn = getCheckInByDate(today);
    
    if (todayCheckIn) {
      setSelectedMood(todayCheckIn.mood);
      setSelectedCravingLevel(todayCheckIn.cravingLevel);
      setNotes(todayCheckIn.notes);
      setAlreadyCheckedIn(true);
    }
  }, []);

  // Show crisis resources when extreme cravings are selected
  useEffect(() => {
    if (selectedCravingLevel === 'extreme' || selectedCravingLevel === 'severe') {
      setShowCrisisResources(true);
      setShowCrisisOptions(true);
    } else {
      setShowCrisisResources(false);
      setShowCrisisOptions(false);
    }
  }, [selectedCravingLevel]);

  const handleSubmit = async () => {
    if (selectedMood && selectedCravingLevel) {
      // Submit the check-in
      submitCheckIn(selectedMood, selectedCravingLevel, notes);
      
      // Generate appropriate response based on mood and craving level
      const response = getMockResponseBasedOnMood(selectedMood, selectedCravingLevel, useStore.getState().userProgress.currentStreak);
      
      // Send a message from the AI to provide personalized feedback
      await sendMessage(`Based on your check-in (Mood: ${selectedMood}, Cravings: ${selectedCravingLevel}): ${response}`);
      
      // If severe/extreme cravings, direct user to chat for immediate support
      if (selectedCravingLevel === 'extreme' || selectedCravingLevel === 'severe') {
        setSubmissionComplete(true);
        setTimeout(() => {
          useStore.getState().setActiveTab('chat');
        }, 1500);
      } else {
        setSubmissionComplete(true);
      }
    }
  };

  const handleTalkToMyBoo = async () => {
    if (selectedMood && selectedCravingLevel) {
      // Submit the check-in
      submitCheckIn(selectedMood, selectedCravingLevel, notes);
      
      // Generate crisis response for chat
      const message = `I'm having ${selectedCravingLevel} cravings right now and feeling ${selectedMood}.`;
      
      // Switch to chat view
      useStore.getState().setActiveTab('chat');
      
      // Add a small delay to ensure UI has updated
      setTimeout(() => {
        sendMessage(message);
      }, 100);
    }
  };

  const resetForm = () => {
    setSelectedMood(null);
    setSelectedCravingLevel(null);
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
          
          {(selectedCravingLevel === 'extreme' || selectedCravingLevel === 'severe') ? (
            <div>
              <p className="text-gray-600 mb-3">I've noticed you're experiencing strong cravings right now.</p>
              <p className="text-gray-600 mb-6">Taking you to the chat for immediate support...</p>
            </div>
          ) : (
            <p className="text-gray-600 mb-6">Thank you for checking in today. Your honesty helps build self-awareness, a key skill in recovery.</p>
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
          <p className="text-gray-600 text-sm mb-6">Tracking your mood and cravings helps build self-awareness and identifies patterns in your recovery journey.</p>
          
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How are you feeling today?
              </label>
              <MoodSelector selectedMood={selectedMood} onSelectMood={setSelectedMood} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rate your cravings today
              </label>
              <CravingSelector 
                selectedCravingLevel={selectedCravingLevel} 
                onSelectCravingLevel={setSelectedCravingLevel} 
              />
            </div>
            
            {/* Emotional Recovery Context */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-indigo-50 border border-indigo-100 rounded-lg p-4"
            >
              <h3 className="text-indigo-900 font-medium mb-2">Recovery Context</h3>
              <p className="text-indigo-700 text-sm mb-3">
                Recovery often feels worse before it gets better as your brain heals and you learn to process emotions. This discomfort isn't failure—it's evidence of healing.
              </p>
              <p className="text-indigo-700 text-sm">
                You're developing the strength to feel difficult emotions without substances. This skill takes time but becomes easier with practice.
              </p>
            </motion.div>
            
            {showCrisisResources && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-orange-50 border border-orange-200 rounded-lg p-4"
              >
                <h3 className="text-orange-800 font-medium mb-2">Need immediate help?</h3>
                <p className="text-orange-700 text-sm mb-3">
                  Strong cravings are temporary and will pass. You're not alone in this moment.
                </p>
                <EmergencyResources compact={true} />
                <p className="text-orange-700 text-sm mt-3">
                  After submitting your check-in, we'll provide personalized strategies and connect you with immediate support.
                </p>
              </motion.div>
            )}
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What's affecting your mood or cravings today? Any triggers or victories to note?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            
            {showCrisisOptions ? (
              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleTalkToMyBoo}
                  className="w-full py-3 px-4 rounded-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors duration-200"
                >
                  Talk to MyBoo Now
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
                disabled={!selectedMood || !selectedCravingLevel}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200
                  ${(!selectedMood || !selectedCravingLevel) 
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