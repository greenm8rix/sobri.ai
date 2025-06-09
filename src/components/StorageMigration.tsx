import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { migrateFromLocalStorage, indexedDBStorage } from '../utils/indexedDBUtils';
import { Loader2 } from 'lucide-react';

interface StorageMigrationProps {
  children: React.ReactNode;
}

export const StorageMigration: React.FC<StorageMigrationProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [migrationProgress, setMigrationProgress] = useState('');

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        setMigrationProgress('Initializing storage...');
        
        // Get userId from localStorage
        const userId = localStorage.getItem('Soberi_userId');
        if (!userId) {
          // No user ID yet, just initialize IndexedDB and continue
          await indexedDBStorage.init();
          setIsReady(true);
          return;
        }

        // Initialize IndexedDB
        await indexedDBStorage.init();
        
        // Check if migration is needed
        const hasLocalStorageData = localStorage.getItem('Soberiai-storage') !== null;
        const hasIndexedDBData = await indexedDBStorage.getAppState(userId) !== null;
        
        if (hasLocalStorageData && !hasIndexedDBData) {
          setMigrationProgress('Migrating data to improved storage...');
          await migrateFromLocalStorage(userId);
          
          // Optional: Clear localStorage after successful migration
          // But keep userId for authentication
          const keysToKeep = ['Soberi_userId', 'sb-auth-token'];
          const allKeys = Object.keys(localStorage);
          
          allKeys.forEach(key => {
            if (!keysToKeep.some(keepKey => key.includes(keepKey))) {
              localStorage.removeItem(key);
            }
          });
          
          setMigrationProgress('Migration complete!');
        }
        
        // Initialize the store after storage is ready
        await useStore.getState().initializeStore();
        
        setIsReady(true);
      } catch (err) {
        console.error('Storage initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize storage');
      }
    };

    initializeStorage();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Storage Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">{migrationProgress || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 