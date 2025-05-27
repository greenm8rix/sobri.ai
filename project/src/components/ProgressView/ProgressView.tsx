import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Award, Calendar, AlertTriangle, RefreshCw, Milestone, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ProgressCard from './ProgressCard';
import StreakCalendar from './StreakCalendar';
import RelapseDialog from './RelapseDialog';
import TriggerTracker from './TriggerTracker';
import MilestoneTimeline from './MilestoneTimeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../UI/Tabs';

const ProgressView: React.FC = () => {
  const { userProgress, checkIns } = useStore();
  const [showRelapseDialog, setShowRelapseDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('progress');
  
  const hasStarted = userProgress.startDate !== null;

  if (!hasStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md"
        >
          <div className="w-16 h-16 bg-indigo-100 rounded-full mx-auto flex items-center justify-center mb-5">
            <Calendar size={32} className="text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold mb-3">Start Your Journey</h2>
          <p className="text-gray-600 mb-6">
            Begin tracking your recovery progress by completing your first daily check-in.
          </p>
          <button
            onClick={() => {
              useStore.getState().setActiveTab('checkin');
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200"
          >
            Go to Daily Check-In
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ProgressCard 
          title="Current Streak"
          value={userProgress.currentStreak}
          unit="days"
          icon={<Award size={20} className="text-indigo-500" />}
          color="bg-indigo-50"
          accentColor="text-indigo-600"
          animate={true}
        />
        
        <ProgressCard 
          title="Longest Streak"
          value={userProgress.longestStreak}
          unit="days"
          icon={<Calendar size={20} className="text-emerald-500" />}
          color="bg-emerald-50"
          accentColor="text-emerald-600"
        />
        
        <ProgressCard 
          title="Total Clean Days"
          value={userProgress.totalDaysClean}
          unit="days"
          icon={<Award size={20} className="text-blue-500" />}
          color="bg-blue-50"
          accentColor="text-blue-600"
        />
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="progress">Calendar</TabsTrigger>
          <TabsTrigger value="triggers">Trigger Tracker</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="progress">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium mb-4">Your Progress Calendar</h3>
              <StreakCalendar checkIns={checkIns} />
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <h3 className="text-lg font-medium mb-4">Recovery Tools</h3>
              
              <p className="text-gray-600 text-sm mb-6">
                These tools help you manage your recovery journey effectively.
              </p>
              
              <div className="space-y-4 mt-auto">
                <button
                  onClick={() => setShowRelapseDialog(true)}
                  className="w-full py-3 px-4 flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <AlertTriangle size={18} className="text-orange-500" />
                  <span>Record a Relapse</span>
                </button>
                
                <button
                  onClick={() => {
                    useStore.getState().resetProgress();
                  }}
                  className="w-full py-3 px-4 flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                >
                  <RefreshCw size={18} className="text-gray-600" />
                  <span>Reset Progress</span>
                </button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="triggers">
          <TriggerTracker />
        </TabsContent>
        
        <TabsContent value="milestones">
          <MilestoneTimeline milestones={userProgress.milestones || []} />
        </TabsContent>
      </Tabs>
      
      <RelapseDialog 
        isOpen={showRelapseDialog} 
        onClose={() => setShowRelapseDialog(false)} 
      />
    </div>
  );
};

export default ProgressView;