import React from 'react';
import { motion } from 'framer-motion';
import { X, Lightbulb, Heart, AlertCircle } from 'lucide-react';
import { EmotionalInsight } from '../../types';

interface InsightCardProps {
  insight: EmotionalInsight;
  onDismiss: () => void;
  total: number;
  current: number;
}

const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  onDismiss,
  total,
  current
}) => {
  const getIcon = () => {
    switch (insight.type) {
      case 'insight':
        return <Lightbulb className="text-amber-500" size={20} />;
      case 'encouragement':
        return <Heart className="text-pink-500" size={20} />;
      case 'reminder':
        return <AlertCircle className="text-blue-500" size={20} />;
      default:
        return <Lightbulb className="text-amber-500" size={20} />;
    }
  };

  const getBgColor = () => {
    switch (insight.type) {
      case 'insight':
        return 'bg-amber-50 border-amber-100';
      case 'encouragement':
        return 'bg-pink-50 border-pink-100';
      case 'reminder':
        return 'bg-blue-50 border-blue-100';
      default:
        return 'bg-amber-50 border-amber-100';
    }
  };

  const getTextColor = () => {
    switch (insight.type) {
      case 'insight':
        return 'text-amber-800';
      case 'encouragement':
        return 'text-pink-800';
      case 'reminder':
        return 'text-blue-800';
      default:
        return 'text-amber-800';
    }
  };

  return (
    <motion.div
      className={`rounded-lg border p-4 ${getBgColor()}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-3">
            {getIcon()}
          </div>
          <h3 className={`font-medium ${getTextColor()}`}>
            {insight.type === 'insight' && 'Insight'}
            {insight.type === 'encouragement' && 'Encouragement'}
            {insight.type === 'reminder' && 'Helpful Reminder'}
          </h3>
        </div>
        <div className="flex items-center">
          {total > 1 && (
            <span className="text-xs mr-3 opacity-75">
              {current} of {total}
            </span>
          )}
          <button
            onClick={onDismiss}
            className={`p-1 rounded-full hover:bg-white/20 ${getTextColor()}`}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <p className={`mt-3 ${getTextColor()}`}>
        {insight.content}
      </p>
    </motion.div>
  );
};

export default InsightCard;
