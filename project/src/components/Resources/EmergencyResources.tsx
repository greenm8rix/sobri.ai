import React from 'react';
import { Phone, Heart, ExternalLink } from 'lucide-react';

interface EmergencyResourcesProps {
  compact?: boolean;
}

const EmergencyResources: React.FC<EmergencyResourcesProps> = ({ compact = false }) => {
  const resources = [
    {
      name: "SAMHSA's National Helpline",
      description: "Treatment referral and information service for substance use disorders",
      phone: "1-800-662-4357",
      website: "https://www.samhsa.gov/find-help/national-helpline",
      available: "24/7, 365 days a year",
      languages: "English & Spanish"
    },
    {
      name: "National Suicide Prevention Lifeline",
      description: "Crisis support for mental health emergencies",
      phone: "988 or 1-800-273-8255",
      website: "https://988lifeline.org/",
      available: "24/7",
      languages: "Multiple languages available"
    },
    {
      name: "Crisis Text Line",
      description: "Crisis support via text message",
      phone: "Text HOME to 741741",
      website: "https://www.crisistextline.org/",
      available: "24/7",
      languages: "English"
    },
    {
      name: "FindTreatment.gov",
      description: "Locate substance use treatment facilities near you",
      website: "https://findtreatment.gov/",
      available: "24/7 for online resources",
      languages: "English"
    }
  ];

  if (compact) {
    // Compact version for embedding in other components
    return (
      <div className="text-sm">
        <div className="flex items-center gap-2 mb-2">
          <Phone size={16} className="text-orange-700" />
          <a href="tel:18006624357" className="text-orange-700 font-medium hover:underline">
            SAMHSA Helpline: 1-800-662-4357
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-orange-700" />
          <a href="sms:741741&body=HOME" className="text-orange-700 font-medium hover:underline">
            Crisis Text Line: Text HOME to 741741
          </a>
        </div>
      </div>
    );
  }

  // Full version
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-4">Emergency Resources</h2>
      <p className="text-gray-600 mb-6">
        If you're experiencing a crisis or need immediate support, these resources are available 24/7. Your conversation remains confidential, and your privacy is respected.
      </p>

      <div className="space-y-6">
        {resources.map((resource) => (
          <div key={resource.name} className="border-b border-gray-100 pb-5 last:border-b-0 last:pb-0">
            <h3 className="font-medium text-lg mb-1">{resource.name}</h3>
            <p className="text-gray-600 text-sm mb-3">{resource.description}</p>

            <div className="space-y-2">
              {resource.phone && (
                <div className="flex items-start">
                  <Phone size={18} className="text-indigo-500 mr-2 mt-0.5" />
                  <div>
                    <a
                      href={`tel:${resource.phone.replace(/\D/g, '')}`}
                      className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                    >
                      {resource.phone}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start">
                <ExternalLink size={18} className="text-indigo-500 mr-2 mt-0.5" />
                <div>
                  <a
                    href={resource.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    {resource.website.replace('https://', '')}
                  </a>
                </div>
              </div>

              <div className="text-xs text-gray-500 mt-1">
                Available: {resource.available} • {resource.languages}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="font-medium mb-2 text-blue-800">Your Privacy Matters</h3>
        <p className="text-sm text-blue-700">
          All helplines prioritize your confidentiality. Soberi.ai does not monitor or share any information about your calls
          or messages with these services. These are independent resources available to support you when needed.
        </p>
      </div>
    </div>
  );
};

export default EmergencyResources;