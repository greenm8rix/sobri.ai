import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../UI/Tabs';
import EmergencyResources from '../Resources/EmergencyResources';
import RecoveryResources from '../Resources/RecoveryResources';
import CopingSkills from './CopingSkills';
import LegalTermsView from '../Legal/LegalTermsView';
import MemoryDebugView from '../MemoryView/MemoryDebugView';
import MemoryContextDemo from '../MemoryView/MemoryContextDemo';

const ResourcesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('emergency');
  const [legalView, setLegalView] = useState<'terms' | 'privacy' | 'ai' | null>(null);
  const [showMemoryDebug, setShowMemoryDebug] = useState(false);

  // Handle legal view links from footer
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#terms') {
        setLegalView('terms');
      } else if (hash === '#privacy') {
        setLegalView('privacy');
      } else if (hash === '#ai') {
        setLegalView('ai');
      } else if (hash === '#memory-debug') {
        setShowMemoryDebug(true);
      }
    };

    handleHashChange(); // Check on initial render
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  if (legalView) {
    return (
      <LegalTermsView
        type={legalView}
        onBack={() => {
          setLegalView(null);
          window.history.pushState("", document.title, window.location.pathname + window.location.search);
        }}
      />
    );
  }

  if (showMemoryDebug) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => {
              setShowMemoryDebug(false);
              window.history.pushState("", document.title, window.location.pathname + window.location.search);
            }}
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Resources
          </button>
        </div>

        <Tabs value="memory-debug" onValueChange={(value) => { }}>
          <TabsList className="mb-6">
            <TabsTrigger value="memory-debug">Memory Debug</TabsTrigger>
            <TabsTrigger value="memory-context">Context Demo</TabsTrigger>
          </TabsList>

          <TabsContent value="memory-debug">
            <MemoryDebugView />
          </TabsContent>

          <TabsContent value="memory-context">
            <MemoryContextDemo />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Recovery Resources</h1>
        <p className="text-gray-600">
          Access helplines, support groups, and coping strategies to strengthen your recovery journey.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="emergency">Emergency Help</TabsTrigger>
          <TabsTrigger value="resources">Support Groups</TabsTrigger>
          <TabsTrigger value="coping">Coping Skills</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
        </TabsList>

        <TabsContent value="emergency">
          <EmergencyResources />
        </TabsContent>

        <TabsContent value="resources">
          <RecoveryResources />
        </TabsContent>

        <TabsContent value="coping">
          <CopingSkills />
        </TabsContent>

        <TabsContent value="legal">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Legal Information</h2>
            <p className="text-gray-600 mb-6">
              Review our legal documents and policies:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setLegalView('terms')}
                className="p-5 border border-gray-200 rounded-lg hover:border-indigo-200 transition-colors duration-200"
              >
                <h3 className="font-medium text-lg mb-2">Terms of Service</h3>
                <p className="text-sm text-gray-600">
                  Review the terms and conditions for using Soberi.ai
                </p>
              </button>

              <button
                onClick={() => setLegalView('privacy')}
                className="p-5 border border-gray-200 rounded-lg hover:border-indigo-200 transition-colors duration-200"
              >
                <h3 className="font-medium text-lg mb-2">Privacy Policy</h3>
                <p className="text-sm text-gray-600">
                  Learn how we collect, use, and protect your data
                </p>
              </button>

              <button
                onClick={() => setLegalView('ai')}
                className="p-5 border border-gray-200 rounded-lg hover:border-indigo-200 transition-colors duration-200"
              >
                <h3 className="font-medium text-lg mb-2">AI Transparency</h3>
                <p className="text-sm text-gray-600">
                  Information about how our AI technology works
                </p>
              </button>
            </div>

            {/* Debug link - only visible in development */}
            <div className="mt-8 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Developer Options</h3>
              <button
                onClick={() => setShowMemoryDebug(true)}
                className="text-xs text-gray-500 hover:text-indigo-600"
              >
                Memory System Debug
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResourcesView;