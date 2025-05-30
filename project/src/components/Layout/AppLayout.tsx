import React, { useEffect, useState } from 'react';
import { Heart, CalendarCheck, BookOpen, TrendingUp, X, LifeBuoy, CheckSquare, Lightbulb } from 'lucide-react'; // Added Lightbulb
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import NavItem from './NavItem';
import Header from './Header';
import InsightsView from '../InsightsView/InsightsView'; // Add this import

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeTab, setActiveTab, initializeStore } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  const navItems = [
    { id: 'chat', label: 'Chat', icon: Heart, tab: 'chat' as const },
    { id: 'checkin', label: 'Check In', icon: CalendarCheck, tab: 'checkin' as const },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, tab: 'tasks' as const },
    { id: 'journal', label: 'Journal', icon: BookOpen, tab: 'journal' as const },
    { id: 'progress', label: 'Progress', icon: TrendingUp, tab: 'progress' as const },
    { id: 'insights', label: 'Insights', icon: Lightbulb, tab: 'insights' as const },
    { id: 'resources', label: 'Resources', icon: LifeBuoy, tab: 'resources' as const }
  ];

  return (
    <div className="flex flex-col h-full min-h-screen bg-gradient-to-b from-gray-50 to-white" onKeyDown={handleKeyDown}>
      {/* Make Header sticky */}
      <div className="sticky top-0 z-10 w-full"> {/* Ensure full width and appropriate z-index (restored z-30) */}
        <Header toggleMenu={toggleMenu} isMenuOpen={isMenuOpen} />
      </div>

      {/* Container for sidebar and main content. Removed overflow-hidden to allow page scroll. */}
      <div className="flex flex-1">
        {/* Mobile Navigation Drawer */}
        <motion.div
          className="fixed inset-0 backdrop-blur-sm bg-black/30 z-20 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: isMenuOpen ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ pointerEvents: isMenuOpen ? 'auto' : 'none' }}
          aria-hidden={!isMenuOpen}
        >
          <motion.div
            className="absolute top-0 left-0 h-full w-64 bg-white shadow-lg"
            initial={{ x: '-100%' }}
            animate={{ x: isMenuOpen ? 0 : '-100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold text-indigo-600">Soberi.ai</h2>
              <button
                onClick={toggleMenu}
                className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Close menu"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <nav className="p-4 space-y-2" role="tablist">
              {navItems.map((item) => (
                <NavItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  isActive={activeTab === item.tab}
                  onClick={() => {
                    setActiveTab(item.tab);
                    setIsMenuOpen(false);
                  }}
                  vertical
                />
              ))}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
              {/* Emergency Help Button */}
              <button
                onClick={() => {
                  setActiveTab('resources');
                  setIsMenuOpen(false);
                }}
                className="w-full py-2 px-3 bg-red-50 text-red-700 border border-red-100 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors duration-200"
              >
                <LifeBuoy size={16} className="mr-2" />
                <span className="text-sm font-medium">Emergency Help</span>
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 bg-white/80 backdrop-blur-sm shadow-lg border-r border-gray-100 sticky top-16 z-10 h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Updated Desktop Sidebar Header to be more consistent with Mobile Drawer Header style */}
          <div className="p-4 border-b flex items-center ">
            <h2 className="text-xl font-semibold text-indigo-600">Soberi.ai</h2>
            {/* Removed subtitle for consistency with mobile drawer's simplicity */}
          </div>
          {/* Desktop sidebar nav: Now part of the scrollable sidebar */}
          <nav className="space-y-2 p-4" role="tablist" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={activeTab === item.tab}
                onClick={() => setActiveTab(item.tab)}
                vertical
              />
            ))}
          </nav>

          <div className="p-4 border-t">
            {/* Emergency Help Button */}
            <button
              onClick={() => setActiveTab('resources')}
              className="w-full py-2 px-3 mb-4 bg-red-50 text-red-700 border border-red-100 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors duration-200"
            >
              <LifeBuoy size={16} className="mr-2" />
              <span className="text-sm font-medium">Emergency Help</span>
            </button>

            <div className="text-xs text-gray-500">
              <p className="mb-1">Version 0.1.0</p>
            </div>
          </div>
        </div>

        {/* Bottom Navigation (Mobile) - Removed as per user request
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-lg border-t border-gray-100 z-10 safe-bottom">
          <div className="flex justify-around items-center h-16 px-2" role="tablist" aria-label="Mobile navigation">
            {navItems.slice(0, 5).map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                isActive={activeTab === item.tab}
                onClick={() => setActiveTab(item.tab)}
              />
            ))}
          </div>
        </div>
        */}

        {/* Main Content: Removed overflow-auto so it scrolls with page */}
        <main className="flex-1 pb-20 lg:pb-0 w-full" id="main-content"> {/* Consider adjusting pb-20 if needed after nav removal */}
          <div className="container mx-auto p-4">
            {activeTab === 'insights' ? <InsightsView /> : children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
