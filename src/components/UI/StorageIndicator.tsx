import React, { useEffect, useState } from 'react';
import { getStorageUsage } from '../../utils/indexedDBUtils';
import { HardDrive, AlertTriangle } from 'lucide-react';

export const StorageIndicator: React.FC = () => {
  const [storageInfo, setStorageInfo] = useState<{
    usage: number;
    quota: number;
    percentage: number;
  } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const checkStorage = async () => {
      const info = await getStorageUsage();
      setStorageInfo(info);
    };

    checkStorage();
    // Check storage every minute
    const interval = setInterval(checkStorage, 60000);

    return () => clearInterval(interval);
  }, []);

  if (!storageInfo || storageInfo.quota === 0) return null;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (percentage: number): string => {
    if (percentage < 50) return 'text-green-400';
    if (percentage < 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressBarColor = (percentage: number): string => {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
        title="Storage Usage"
      >
        <HardDrive className={`w-5 h-5 ${getStatusColor(storageInfo.percentage)}`} />
        {storageInfo.percentage > 80 && (
          <AlertTriangle className="w-3 h-3 text-red-400 absolute -top-1 -right-1" />
        )}
      </button>

      {isExpanded && (
        <div className="absolute bottom-full mb-2 right-0 w-64 bg-gray-800 rounded-lg shadow-lg p-4 z-50">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">Storage Usage</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Used</span>
              <span>{formatBytes(storageInfo.usage)}</span>
            </div>
            
            <div className="flex justify-between text-xs text-gray-400">
              <span>Available</span>
              <span>{formatBytes(storageInfo.quota)}</span>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressBarColor(storageInfo.percentage)}`}
                style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
              />
            </div>
            
            <div className="text-center text-xs text-gray-400 mt-1">
              {storageInfo.percentage.toFixed(1)}% used
            </div>

            {storageInfo.percentage > 80 && (
              <div className="mt-3 p-2 bg-red-900/20 border border-red-800 rounded text-xs text-red-400">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                Storage is running low. Older messages will be automatically removed if needed.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 