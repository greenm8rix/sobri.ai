import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import LoginButton from './LoginButton';
import { Sparkles, Lock, MessageCircle, UserCheck } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [showLegal, setShowLegal] = useState<'none' | 'tos' | 'privacy'>('none');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Welcome Back!</h2>
            <p className="text-gray-600 mt-2">You're already signed in as {user.user_metadata?.full_name || user.email}</p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => window.location.href = '/'}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 p-4">
      <div className="bg-white/90 p-8 rounded-2xl shadow-xl max-w-md w-full border border-indigo-100 relative">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100">
              <Sparkles size={36} className="text-indigo-500" />
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome to Soberi.ai</h2>
          <p className="text-gray-600 text-base mb-2">Your private, AI-powered supportive companion.</p>
          <p className="text-indigo-700 text-sm font-medium">First 10 insights and chats are free. No personal data stored except your email and payment status.</p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="flex items-center gap-3 bg-indigo-50 rounded-lg p-3">
            <MessageCircle size={20} className="text-indigo-500" />
            <span className="text-gray-700 text-sm">Chat with a supportive AI, anytime</span>
          </div>
          <div className="flex items-center gap-3 bg-indigo-50 rounded-lg p-3">
            <UserCheck size={20} className="text-indigo-500" />
            <span className="text-gray-700 text-sm">Track your progress and daily check-ins</span>
          </div>
          <div className="flex items-center gap-3 bg-indigo-50 rounded-lg p-3">
            <Lock size={20} className="text-indigo-500" />
            <span className="text-gray-700 text-sm">Your data is encrypted and stays on your device</span>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col items-center space-y-4">
          <LoginButton className="w-full text-lg py-3" />
          <div className="text-xs text-gray-500 text-center">
            By signing in, you agree to our{' '}
            <button
              className="text-indigo-600 hover:underline focus:outline-none"
              onClick={() => setShowLegal('tos')}
              type="button"
            >
              Terms of Service
            </button>
            {' '}and{' '}
            <button
              className="text-indigo-600 hover:underline focus:outline-none"
              onClick={() => setShowLegal('privacy')}
              type="button"
            >
              Privacy Policy
            </button>.
          </div>
        </div>
        {/* Modal for short legal text */}
        {showLegal !== 'none' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full text-sm relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowLegal('none')}
                aria-label="Close"
              >
                ×
              </button>
              {showLegal === 'tos' && (
                <div>
                  <h3 className="font-semibold mb-2">Terms of Service</h3>
                  <p>By using Soberi.ai, you agree to use the app for personal guidance and companionship only. Do not use the app for unlawful or harmful purposes. Continued use means you accept any changes to these terms.</p>
                </div>
              )}
              {showLegal === 'privacy' && (
                <div>
                  <h3 className="font-semibold mb-2">Privacy Policy</h3>
                  <p>Soberi.ai only stores your email and payment status on our servers. All other data is encrypted and stays on your device. We do not sell or share your personal information.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
