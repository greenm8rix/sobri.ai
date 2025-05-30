import React from 'react';

const LegalFooter: React.FC = () => {
  return (
    <div className="text-center py-4 text-xs text-gray-500 border-t">
      <p className="mb-1">
        © 2025 Soberi.ai - All Rights Reserved
      </p>
      <div className="flex justify-center space-x-4">
        <a href="#terms" className="hover:text-indigo-600 transition-colors duration-200">Terms of Service</a>
        <a href="#privacy" className="hover:text-indigo-600 transition-colors duration-200">Privacy Policy</a>
        <a href="#ai" className="hover:text-indigo-600 transition-colors duration-200">AI Transparency</a>
      </div>
    </div>
  );
};

export default LegalFooter;