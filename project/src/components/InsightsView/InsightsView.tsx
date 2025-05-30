import React from 'react';
import { useStore } from '../../store/useStore';
import InsightCard from '../TasksView/InsightCard';

const InsightsView: React.FC = () => {
  const { insights, updateInsightNote } = useStore();
  const sortedInsights = [...insights].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span role="img" aria-label="lightbulb">💡</span> Insights
      </h2>
      {sortedInsights.length === 0 ? (
        <div className="text-gray-500 text-center py-12">No insights yet. Insights from your journey will appear here.</div>
      ) : (
        <div className="space-y-8">
          {sortedInsights.map((insight, idx) => (
            <div key={insight.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <InsightCard
                insight={insight}
                onDismiss={() => {}}
                total={1}
                current={1}
              />
              {/* User note box */}
              <div className="mt-4">
                <label htmlFor={`user-note-${insight.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Your Reflection
                </label>
                <textarea
                  id={`user-note-${insight.id}`}
                  className="w-full border rounded-lg p-2 text-sm min-h-[60px] focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Write your thoughts about this insight..."
                  value={insight.userNote || ''}
                  onChange={e => updateInsightNote(insight.id, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InsightsView; 