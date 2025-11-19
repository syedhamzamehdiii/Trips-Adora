import React, { useState } from 'react';
import { FiRefreshCw, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { syncLocalStorageProductsToDatabase } from '@/utils/syncProductsToDatabase';

const SyncProductsPage = () => {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);
    
    try {
      const syncResult = await syncLocalStorageProductsToDatabase();
      setResult(syncResult);
    } catch (error) {
      console.error('Sync error:', error);
      setResult({ synced: 0, errors: 1 });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Sync Products to Database</h1>
        <p className="text-gray-600 mb-6">
          This will sync all published products from localStorage to the database so they appear on the customer platform.
        </p>
        
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiRefreshCw className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync Products'}
        </button>

        {result && (
          <div className={`mt-6 p-4 rounded-lg ${result.errors > 0 ? 'bg-yellow-50' : 'bg-green-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              {result.errors > 0 ? (
                <FiXCircle className="text-yellow-600" />
              ) : (
                <FiCheckCircle className="text-green-600" />
              )}
              <span className="font-semibold">Sync Complete</span>
            </div>
            <p className="text-sm text-gray-700">
              ✅ {result.synced} products synced successfully
              {result.errors > 0 && ` ⚠️ ${result.errors} errors occurred`}
            </p>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> New products will automatically sync when published. 
            This tool is only needed for existing products that were created before the database integration.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SyncProductsPage;

