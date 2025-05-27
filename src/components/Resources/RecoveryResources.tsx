import React from 'react';
import { Users, Book, Award, Calendar, ExternalLink } from 'lucide-react';

const RecoveryResources: React.FC = () => {
  const supportGroups = [
    {
      name: "Alcoholics Anonymous",
      description: "12-step recovery program for alcohol addiction",
      website: "https://www.aa.org/",
      features: ["Find local meetings", "Online meetings available", "Free to join"]
    },
    {
      name: "Narcotics Anonymous",
      description: "12-step program for drug addiction recovery",
      website: "https://www.na.org/",
      features: ["Global community", "Peer support", "Free to join"]
    },
    {
      name: "SMART Recovery",
      description: "Science-based addiction recovery support group",
      website: "https://www.smartrecovery.org/",
      features: ["Alternative to 12-step", "CBT-based approach", "Online & in-person options"]
    },
    {
      name: "Refuge Recovery",
      description: "Buddhist-inspired approach to recovery",
      website: "https://refugerecovery.org/",
      features: ["Mindfulness-based", "Meditation-focused", "Compassionate community"]
    }
  ];

  const educationalResources = [
    {
      name: "NIDA - National Institute on Drug Abuse",
      description: "Research-based information on drug use and addiction",
      website: "https://nida.nih.gov/",
    },
    {
      name: "Recovery Research Institute",
      description: "Non-profit research institute for addiction recovery",
      website: "https://www.recoveryanswers.org/",
    },
    {
      name: "In The Rooms",
      description: "Online recovery meetings and community",
      website: "https://www.intherooms.com/",
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-2">Recovery Resources</h2>
      <p className="text-gray-600 mb-6">
        Recovery is stronger with support. Here are evidence-based resources to help you on your journey.
      </p>
      
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
            <Users size={18} className="text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium">Support Groups</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {supportGroups.map((group) => (
            <div key={group.name} className="border border-gray-100 rounded-lg p-4 hover:border-indigo-200 transition-colors duration-200">
              <h4 className="font-medium mb-1">{group.name}</h4>
              <p className="text-gray-600 text-sm mb-2">{group.description}</p>
              <ul className="text-xs text-gray-500 mb-3">
                {group.features.map((feature, index) => (
                  <li key={index} className="flex items-center mb-1">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></span>
                    {feature}
                  </li>
                ))}
              </ul>
              <a 
                href={group.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs flex items-center text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                <ExternalLink size={12} className="mr-1" />
                Visit Website
              </a>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
            <Book size={18} className="text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium">Educational Resources</h3>
        </div>
        
        <div className="space-y-3">
          {educationalResources.map((resource) => (
            <div key={resource.name} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:border-indigo-200 transition-colors duration-200">
              <div>
                <h4 className="font-medium text-sm">{resource.name}</h4>
                <p className="text-gray-600 text-xs">{resource.description}</p>
              </div>
              <a 
                href={resource.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs flex items-center text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                <ExternalLink size={12} className="mr-1" />
                Visit
              </a>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
            <Award size={18} className="text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium">Recovery Skills</h3>
        </div>
        
        <div className="space-y-3">
          <div className="p-4 border border-gray-100 rounded-lg">
            <h4 className="font-medium mb-2">H.A.L.T.</h4>
            <p className="text-sm text-gray-600 mb-2">
              When cravings hit, check if you're:
            </p>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>
                <span className="font-medium">H</span>ungry
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-2"></span>
                <span className="font-medium">A</span>ngry
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                <span className="font-medium">L</span>onely
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></span>
                <span className="font-medium">T</span>ired
              </li>
            </ul>
            <p className="text-xs text-gray-500 mt-2">
              Address these basic needs first as they often trigger cravings or emotional distress.
            </p>
          </div>
          
          <div className="p-4 border border-gray-100 rounded-lg">
            <h4 className="font-medium mb-2">U.R.G.E. Surfing</h4>
            <p className="text-sm text-gray-600 mb-3">
              A technique to manage cravings:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center mr-2 mt-0.5">U</span>
                <div>
                  <span className="font-medium">Understand</span> that urges are temporary
                </div>
              </li>
              <li className="flex items-start">
                <span className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center mr-2 mt-0.5">R</span>
                <div>
                  <span className="font-medium">Recognize</span> what you're feeling
                </div>
              </li>
              <li className="flex items-start">
                <span className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center mr-2 mt-0.5">G</span>
                <div>
                  <span className="font-medium">Get</span> support or use coping skills
                </div>
              </li>
              <li className="flex items-start">
                <span className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center mr-2 mt-0.5">E</span>
                <div>
                  <span className="font-medium">Expect</span> the urge to pass
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecoveryResources;