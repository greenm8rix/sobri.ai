import React from 'react';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import LegalDisclaimer from '../Legal/LegalDisclaimer';
import LoginButton from '../../auth/LoginButton';

interface HeaderProps {
  toggleMenu: () => void;
  isMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleMenu, isMenuOpen }) => {
  const { activeTab, userProgress } = useStore();

  const getTitle = () => {
    switch (activeTab) {
      case 'chat':
        return 'Chat with Soberi';
      case 'checkin':
        return 'Daily Check-In';
      case 'journal':
        return 'Journal';
      case 'progress':
        return 'Your Progress';
      case 'resources':
        return 'Resources';
      case 'tasks':
        return 'Tasks';
      case 'insights':
        return 'Insights';
      default:
        return 'Soberi.ai';
    }
  };

  const getSubtitle = () => {
    switch (activeTab) {
      case 'chat':
        return 'Share your thoughts and feelings';
      case 'checkin':
        return 'Track your daily status';
      case 'journal':
        return 'Reflect and record your journey';
      case 'progress':
        return `${userProgress.currentStreak} day${userProgress.currentStreak !== 1 ? 's' : ''} clean`;
      case 'resources':
        return 'Support and tools';
      case 'tasks':
        return 'Structure your day';
      case 'insights':
        return 'Reflect on your recovery insights';
      default:
        return 'Your recovery companion';
    }
  };

  return (
    <header className="bg-white border-b px-4 py-3 flex flex-col lg:px-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={toggleMenu}
            className="mr-3 p-2 rounded-full hover:bg-gray-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          <div>
            <motion.h1
              className="text-lg font-semibold text-gray-800"
              key={activeTab}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {getTitle()}
            </motion.h1>
            <motion.p
              className="text-xs text-gray-500"
              key={`${activeTab}-subtitle`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {getSubtitle()}
            </motion.p>
          </div>
        </div>

        <div className="flex items-center">
          {activeTab === 'progress' && (
            <div className="hidden sm:block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
              {userProgress.currentStreak > 0
                ? `${userProgress.currentStreak} day streak 🔥`
                : 'Start your journey today'}
            </div>
          )}
          <div className="ml-4">
            <LoginButton />
          </div>
        </div>
      </div>

      {activeTab === 'chat' && (
        <div className="mt-1 flex justify-end z-50">
          <LegalDisclaimer type="mini" />
        </div>
      )}
    </header>
  );
};

export default Header;