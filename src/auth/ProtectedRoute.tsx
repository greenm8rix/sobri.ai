import React from 'react';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = <div className="flex items-center justify-center min-h-screen">
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      <h2 className="text-2xl font-semibold mb-4">Please Sign In</h2>
      <p className="text-gray-600 mb-6">You need to be signed in to access this page.</p>
    </div>
  </div>
}) => {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  // If user is not authenticated, show the fallback
  if (!user) {
    return <>{fallback}</>;
  }

  // If user is authenticated, show the protected content
  return <>{children}</>;
};

export default ProtectedRoute;