import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, PlusCircle, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatDate } from '../../utils/dateUtils';

const TriggerTracker: React.FC = () => {
  const { triggerLogs, addTriggerLog, removeTriggerLog } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [trigger, setTrigger] = useState('');
  const [intensity, setIntensity] = useState<number>(5);
  const [strategy, setStrategy] = useState('');
  const [successful, setSuccessful] = useState<boolean>(true);
  const [notes, setNotes] = useState('');

  const commonTriggers = [
    'Stress', 'Negative emotions', 'Social situations', // Changed 'Being around users' and 'Social pressure'
    'Certain locations', 'Specific events', // Changed 'Celebrations'
    'Boredom', 'Arguments', 'Fatigue'
  ];

  const commonStrategies = [
    'Talked to someone trusted',
    'Mindful acceptance of feelings', // Changed from 'Used urge surfing'
    'Distraction technique',
    'Physical exercise',
    'Mindfulness meditation',
    'Left the situation',
    'Delayed decision (waited it out)',
    'Self-care check (needs, feelings)' // Changed from 'Used HALT check'
  ];

  const handleSubmit = () => {
    if (trigger && strategy) {
      addTriggerLog(trigger, intensity, strategy, successful, notes);
      resetForm();
    }
  };

  const resetForm = () => {
    setTrigger('');
    setIntensity(5);
    setStrategy('');
    setSuccessful(true);
    setNotes('');
    setShowAddForm(false);
  };

  const sortedTriggers = [...triggerLogs].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium">Trigger Tracker</h3>
          <p className="text-sm text-gray-600">Log triggers and strategies to learn what works for you</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-200"
        >
          <PlusCircle size={16} className="mr-1" />
          <span className="text-sm">Add New</span>
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 border border-gray-200 rounded-lg p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Record a Trigger</h4>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  What triggered you?
                </label>
                <input
                  type="text"
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value)}
                  placeholder="Describe what triggered the strong feeling/urge"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {commonTriggers.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTrigger(t)}
                      className="text-xs px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intensity (1-10)
                </label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={intensity}
                    onChange={(e) => setIntensity(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="ml-2 text-sm font-medium w-6 text-center">{intensity}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Mild</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Strategy Used
                </label>
                <input
                  type="text"
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  placeholder="What did you do to cope?"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {commonStrategies.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStrategy(s)}
                      className="text-xs px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Was it successful?
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setSuccessful(true)}
                    className={`px-3 py-1 rounded-lg text-sm ${successful
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setSuccessful(false)}
                    className={`px-3 py-1 rounded-lg text-sm ${!successful
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any additional details about this experience"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!trigger || !strategy}
                  className={`px-3 py-1.5 rounded-lg text-sm ${!trigger || !strategy
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                >
                  Save Trigger
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {sortedTriggers.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={20} className="text-gray-500" />
          </div>
          <h4 className="text-gray-700 font-medium mb-1">No triggers logged yet</h4>
          <p className="text-sm text-gray-500 mb-3">
            Track what triggers strong feelings/urges and which strategies help
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm"
          >
            Log Your First Trigger
          </button>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sortedTriggers.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-3 rounded-lg border ${log.successful
                ? 'border-green-100 bg-green-50'
                : 'border-red-100 bg-red-50'
                }`}
            >
              <div className="flex justify-between">
                <h5 className="font-medium text-sm">{log.trigger}</h5>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">{formatDate(log.date)}</span>
                  <button
                    onClick={() => removeTriggerLog(log.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-600 flex items-center">
                <div className="mr-3">
                  Intensity:
                  <span className="font-medium ml-1">{log.intensity}/10</span>
                </div>
                <div>
                  Strategy:
                  <span className="font-medium ml-1">{log.strategy}</span>
                </div>
              </div>
              {log.notes && (
                <p className="mt-2 text-xs text-gray-600 border-t border-gray-200 pt-1">
                  {log.notes}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TriggerTracker;
