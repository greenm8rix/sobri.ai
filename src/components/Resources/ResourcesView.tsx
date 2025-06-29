import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../UI/Tabs';
import EmergencyResources from '../Resources/EmergencyResources';
import RecoveryResources from '../Resources/RecoveryResources';
import CopingSkills from '../ResourcesView/CopingSkills'; // Corrected path
import LegalTermsView from '../Legal/LegalTermsView';

const ResourcesView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('emergency');
  const [legalView, setLegalView] = useState<'terms' | 'privacy' | 'ai' | null>(null);

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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Helpful Resources</h1>
        <p className="text-gray-600">
          Access support information and coping strategies to strengthen your personal journey.
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

import { useEffect } from 'react';
export default ResourcesView;
