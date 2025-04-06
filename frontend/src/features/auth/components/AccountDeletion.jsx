import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '@/services/api';
import { Button, Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const AccountDeletion = () => {
  const { currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const handleDeleteAccount = async () => {
    // Show a confirmation dialog
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and will remove all your data."
    );
    
    if (!confirmDelete) return;
    
    try {
      setLoading(true);
      setError('');
      
      // No need to get token manually - API service handles authentication
      const response = await api.post('/user/delete-account', {});
      
      setSuccess(true);
      
      // Log the user out after a brief delay to show the success message
      setTimeout(() => {
        logout();
      }, 3000);
    } catch (error) {
      setError('Failed to delete account: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="border-red-200">
      <CardHeader className="text-red-600 font-semibold">Delete Account</CardHeader>
      <CardContent>
        {success ? (
          <div className="bg-green-50 p-4 rounded-md text-green-800">
            Your account deletion request has been processed. All your data will be removed from our systems within 30 days.
          </div>
        ) : (
          <>
            <p className="mb-4">
              Deleting your account will remove all your personal information, health data, meal plans, and workout plans from our system. This action cannot be undone.
            </p>
            
            <div className="bg-red-50 p-4 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div className="text-sm text-red-700">
                After deletion, all your personalized plans and progress tracking will be permanently lost.
              </div>
            </div>
            
            {error && (
              <div className="mt-4 bg-red-50 p-3 rounded-md text-red-600">
                {error}
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        {!success && (
          <Button 
            variant="destructive" 
            disabled={loading} 
            onClick={handleDeleteAccount}
          >
            {loading ? "Processing..." : "Delete My Account"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AccountDeletion;