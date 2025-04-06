import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const DebugPanel = () => {
  const { currentUser, userProfile, onboardingData, fetchUserData, fetchOnboardingData } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const refreshData = async () => {
    setRefreshing(true);
    try {
      await fetchUserData();
      await fetchOnboardingData();
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setRefreshing(false);
    }
  };
  
  if (!currentUser) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white p-2 rounded-full shadow-lg"
      >
        {isOpen ? "✕" : "🛠️"}
      </button>
      
      {isOpen && (
        <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200 mt-2 w-80">
          <h2 className="font-bold mb-2 flex justify-between">
            Debug Info
            <button 
              onClick={refreshData}
              disabled={refreshing}
              className="text-blue-500 text-sm underline"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </h2>
          
          <div className="text-xs">
            <p><strong>User:</strong> {currentUser?.email}</p>
            <p><strong>Auth:</strong> {currentUser ? "✅" : "❌"}</p>
            <p><strong>Profile:</strong> {userProfile ? "✅" : "❌"}</p>
            <p><strong>Onboarding:</strong> {onboardingData ? "✅" : "❌"}</p>
            
            {onboardingData && (
              <div className="mt-2 p-2 bg-gray-50 rounded overflow-auto max-h-40">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(onboardingData, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugPanel;