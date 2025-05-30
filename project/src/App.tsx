import React, { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { useAuth } from './auth/AuthContext';
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
import ProtectedRoute from './auth/ProtectedRoute';
import LoginPage from './auth/LoginPage';

function App() {
  const { activeTab, initializeStore, setActiveTab } = useStore();
  const { refreshUserStatus } = useAuth();
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  useEffect(() => {
    // Initialize store with data from localStorage
    initializeStore();

    // Set page title based on app name
    document.title = 'Soberi.ai - Your Recovery Companion';

    // Check for URL parameters to determine initial tab or payment success
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const paymentSuccess = params.get('payment_success');

    if (paymentSuccess === 'true') {
      refreshUserStatus();
      // Optionally, remove the query params from URL to clean it up
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (tabParam) {
      const validTabs = ['chat', 'checkin', 'journal', 'progress', 'resources', 'tasks'];
      if (validTabs.includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    }

    // Check if it's the first visit
    const hasSeenDisclaimer = localStorage.getItem('Soberi_has_seen_disclaimer') === 'true';
    if (!hasSeenDisclaimer) {
      setShowDisclaimerModal(true);
    }
  }, [initializeStore, setActiveTab, refreshUserStatus]);

  const handleCloseDisclaimer = () => {
    setShowDisclaimerModal(false);
    localStorage.setItem('Soberi_has_seen_disclaimer', 'true');
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
      <ProtectedRoute fallback={<LoginPage />}>
      <div className="font-sans bg-gray-50 flex flex-col min-h-screen w-full">
        <AppLayout>
          {renderActiveView()}
        </AppLayout>
        <AppInstallPrompt />
        <DisclaimerModal isOpen={showDisclaimerModal} onClose={handleCloseDisclaimer} />
      </div>
      </ProtectedRoute>
    </ErrorBoundary>
  );
}

export default App;