import React, { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import AppLayout from './components/Layout/AppLayout';
import ChatView from './components/ChatView/ChatView';
import CheckInView from './components/CheckInView/CheckInView';
import JournalView from './components/JournalView/JournalView';
import ProgressView from './components/ProgressView/ProgressView';
import ResourcesView from './components/ResourcesView/ResourcesView';
import TasksView from './components/TasksView/TasksView';
import ErrorBoundary from './components/ErrorBoundary';
import AppInstallPrompt from './components/AppInstallPrompt';
import DisclaimerModal from './components/Legal/DisclaimerModal';

function App() {
  const { activeTab, initializeStore, setActiveTab } = useStore();
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  
  useEffect(() => {
    // Initialize store with data from localStorage
    initializeStore();
    
    // Set page title based on app name
    document.title = 'MyBoo.ai - Your Recovery Companion';
    
    // Check for URL parameters to determine initial tab
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    
    if (tabParam) {
      const validTabs = ['chat', 'checkin', 'journal', 'progress', 'resources', 'tasks'];
      if (validTabs.includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    }

    // Check if it's the first visit
    const hasSeenDisclaimer = localStorage.getItem('myboo_has_seen_disclaimer') === 'true';
    if (!hasSeenDisclaimer) {
      setShowDisclaimerModal(true);
    }
  }, [initializeStore, setActiveTab]);
  
  const handleCloseDisclaimer = () => {
    setShowDisclaimerModal(false);
    localStorage.setItem('myboo_has_seen_disclaimer', 'true');
  };
  
  const renderActiveView = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatView />;
      case 'checkin':
        return <CheckInView />;
      case 'journal':
        return <JournalView />;
      case 'progress':
        return <ProgressView />;
      case 'resources':
        return <ResourcesView />;
      case 'tasks':
        return <TasksView />;
      default:
        return <ChatView />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="font-sans bg-gray-50 flex flex-col min-h-screen w-full">
        <AppLayout>
          {renderActiveView()}
        </AppLayout>
        <AppInstallPrompt />
        <DisclaimerModal isOpen={showDisclaimerModal} onClose={handleCloseDisclaimer} />
      </div>
    </ErrorBoundary>
  );
}

export default App;