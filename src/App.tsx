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
import { StorageMigration } from './components/StorageMigration';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';

function App() {
  const { activeTab, setActiveTab } = useStore();
  const { refreshUserStatus } = useAuth();
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  useEffect(() => {
    // Set page title based on app name
    document.title = 'Soberi.ai - Your Supportive Companion'; // Updated title

    // Handle app state changes on mobile
    if (Capacitor.isNativePlatform()) {
      let appStateListener: PluginListenerHandle;
      let backButtonListener: PluginListenerHandle;

      const setupListeners = async () => {
        appStateListener = await CapacitorApp.addListener('appStateChange', ({ isActive }) => {
          if (isActive) {
            // App has become active
            refreshUserStatus();
          }
        });

        backButtonListener = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            CapacitorApp.exitApp();
          }
        });
      };

      setupListeners();

      return () => {
        appStateListener?.remove();
        backButtonListener?.remove();
      };
    }

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
    const hasSeenDisclaimer = localStorage.getItem('Soberi_has_seen_disclaimer') === 'true'; // Updated localStorage key
    if (!hasSeenDisclaimer) {
      setShowDisclaimerModal(true);
    }
  }, [setActiveTab, refreshUserStatus]);

  const handleCloseDisclaimer = () => {
    setShowDisclaimerModal(false);
    localStorage.setItem('Soberi_has_seen_disclaimer', 'true'); // Updated localStorage key
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
      <StorageMigration>
        <ProtectedRoute fallback={<LoginPage />}>
          <div className={`font-sans bg-gray-50 flex flex-col min-h-screen w-full ${Capacitor.isNativePlatform() ? 'safe-area-inset' : ''}`}>
            <AppLayout>
              {renderActiveView()}
            </AppLayout>
            {!Capacitor.isNativePlatform() && <AppInstallPrompt />}
            <DisclaimerModal isOpen={showDisclaimerModal} onClose={handleCloseDisclaimer} />
          </div>
        </ProtectedRoute>
      </StorageMigration>
    </ErrorBoundary>
  );
}

export default App;
