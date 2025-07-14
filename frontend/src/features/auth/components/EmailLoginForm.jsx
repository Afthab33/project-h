import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '@/components/ui/button';

const EmailLoginForm = ({ onLoginSuccess, loading, setLoading, setError }) => {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await signInWithEmail(email, password);
      if (result.user) {
        onLoginSuccess(result.user);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3E7B27]/30 focus:border-[#3E7B27] transition-all outline-none"
          placeholder="your@email.com"
        />
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <a href="#" className="text-xs text-[#3E7B27] hover:underline">
            Forgot password?
          </a>
        </div>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3E7B27]/30 focus:border-[#3E7B27] transition-all outline-none"
          placeholder="••••••••"
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={loading} 
        className="w-full py-2.5 bg-[#3E7B27] hover:bg-[#346A21] text-white font-medium rounded-lg transition-all"
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
};

export default EmailLoginForm;