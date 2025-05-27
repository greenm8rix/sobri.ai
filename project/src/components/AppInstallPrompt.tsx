import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
}

const AppInstallPrompt: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event so it can be triggered later
      setInstallPrompt(e as BeforeInstallPromptEvent);
      // Show the prompt to the user
      setShowPrompt(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleInstallClick = () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Clear the saved prompt since it can't be used again
      setInstallPrompt(null);
      setShowPrompt(false);
    });
  };
  
  const dismissPrompt = () => {
    setShowPrompt(false);
    // Store in localStorage that the user has dismissed the prompt
    localStorage.setItem('installPromptDismissed', 'true');
  };
  
  // Don't render anything if there's no prompt or the user has dismissed it
  if (!showPrompt) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-20 left-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 md:left-auto md:right-4 md:bottom-4 md:max-w-sm"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-medium text-gray-800 mb-1">Install MyBoo.ai</h3>
            <p className="text-sm text-gray-600 mb-3">
              Add MyBoo to your home screen for easier access and a better experience.
            </p>
            
            <div className="flex space-x-2">
              <button
                onClick={handleInstallClick}
                className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm"
              >
                <Download size={16} className="mr-1" />
                Install
              </button>
              <button
                onClick={dismissPrompt}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm"
              >
                Maybe Later
              </button>
            </div>
          </div>
          <button 
            onClick={dismissPrompt}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AppInstallPrompt;