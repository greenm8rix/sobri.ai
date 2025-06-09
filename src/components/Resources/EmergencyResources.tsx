import React from 'react';
import { Phone, MessageSquare, Globe } from 'lucide-react';

interface EmergencyResourcesProps {
  compact?: boolean;
}

const EmergencyResources: React.FC<EmergencyResourcesProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Support resources are currently being updated.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-4 text-red-600">Immediate Support</h2>
      <p className="text-gray-600 mb-6">
        Support resources are currently being updated. If you are in a crisis or need immediate assistance, please contact your local emergency services.
      </p>
      {/* Placeholder for future resource links or information */}
    </div>
  );
};

export default EmergencyResources;
