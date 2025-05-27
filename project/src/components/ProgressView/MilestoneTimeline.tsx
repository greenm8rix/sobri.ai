import React from 'react';
import { motion } from 'framer-motion';
import { Milestone } from '../../types';
import { formatDate } from '../../utils/dateUtils';
import { Award, AlertTriangle, Trophy } from 'lucide-react';

interface MilestoneTimelineProps {
  milestones: Milestone[];
}

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ milestones }) => {
  // Sort milestones by date (newest first)
  const sortedMilestones = [...milestones].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'streak':
        return <Award className="text-indigo-500" />;
      case 'relapse':
        return <AlertTriangle className="text-orange-500" />;
      case 'achievement':
        return <Trophy className="text-yellow-500" />;
      default:
        return <Award className="text-indigo-500" />;
    }
  };
  
  const getColorClass = (type: string) => {
    switch (type) {
      case 'streak':
        return 'bg-indigo-50 border-indigo-100';
      case 'relapse':
        return 'bg-orange-50 border-orange-100';
      case 'achievement':
        return 'bg-yellow-50 border-yellow-100';
      default:
        return 'bg-gray-50 border-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold mb-2">Your Recovery Journey</h3>
      <p className="text-gray-600 mb-6">
        Every step matters - celebrate your progress and learn from setbacks.
      </p>
      
      {sortedMilestones.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
            <Trophy size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-1">No milestones yet</h3>
          <p className="text-gray-500 mb-4">
            Keep going! Your first milestone will appear when you reach a streak of 7 days.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-200 z-0"></div>
          
          <div className="space-y-8 relative z-10">
            {sortedMilestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex gap-4"
              >
                <div className="w-12 h-12 rounded-full border-2 border-white bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                  {getIcon(milestone.type)}
                </div>
                
                <div className={`flex-1 p-4 rounded-lg border ${getColorClass(milestone.type)}`}>
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">
                      {milestone.type === 'streak' && `${milestone.value} Day Streak`}
                      {milestone.type === 'relapse' && `Relapse Recovery`}
                      {milestone.type === 'achievement' && `Achievement Unlocked`}
                    </h4>
                    <span className="text-xs text-gray-500">{formatDate(milestone.date)}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                  
                  {milestone.type === 'relapse' && (
                    <p className="text-xs text-orange-700 mt-2">
                      Remember, recovery isn't linear. Each relapse is an opportunity to learn and grow stronger.
                    </p>
                  )}
                  
                  {milestone.type === 'streak' && milestone.value >= 30 && (
                    <div className="mt-2 text-xs text-indigo-600 bg-indigo-50 p-2 rounded">
                      <span className="font-medium">Amazing work!</span> You've reached a significant milestone in your recovery journey.
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneTimeline;