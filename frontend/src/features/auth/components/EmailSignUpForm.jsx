import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { AlertCircle, Mail, Lock, Check, XCircle } from 'lucide-react';

const EmailSignUpForm = ({ onSignUpSuccess, loading, setLoading, setError, formData, compact = false }) => {
  const { signUpWithEmail, submitOnboardingData } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Form validation states
  const [emailValid, setEmailValid] = useState(null);
  const [passwordValid, setPasswordValid] = useState(null);
  const [passwordsMatch, setPasswordsMatch] = useState(null);

  // Email validation
  useEffect(() => {
    if (!email) {
      setEmailValid(null);
      return;
    }
    
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(email));
  }, [email]);

  // Password validation
  useEffect(() => {
    if (!password) {
      setPasswordValid(null);
      return;
    }
    
    setPasswordValid(password.length >= 6);
  }, [password]);

  // Password matching validation
  useEffect(() => {
    if (!confirmPassword) {
      setPasswordsMatch(null);
      return;
    }
    
    setPasswordsMatch(password === confirmPassword);
  }, [confirmPassword, password]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation before submission
    if (!email || !emailValid) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!password || password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const result = await signUpWithEmail(email, password);
      
      // Format onboarding data
      if (formData && Object.keys(formData).filter(key => !!formData[key]).length > 0) {
        try {
          const token = await result.user.getIdToken(true);
          
          // Format onboarding data for backend
          const formattedData = {
            dob: formData.dateOfBirth || '',
            gender: formData.gender?.toLowerCase() || '',
            height_in_cm: formData.heightUnit === 'cm' 
              ? parseInt(formData.height || '0') 
              : Math.round(parseInt(formData.height || '0') * 2.54),
            weight_in_kg: formData.weightUnit === 'kg'
              ? parseInt(formData.weight || '0')
              : Math.round(parseInt(formData.weight || '0') / 2.205),
            primary_fitness_goal: formData.primaryGoal || '',
            target_weight: parseInt(formData.targetWeight || '0') || 0,
            daily_activity_level: formData.activityLevel || '',
            exercise_availability: formData.weeklyExercise || '',
            health_conditions: Array.isArray(formData.healthConditions) 
              ? formData.healthConditions 
              : [],
            other_medical_conditions: formData.otherCondition || '',
            first_name: firstName || '',
            last_name: lastName || ''
          };
          
          // Submit data
          await submitOnboardingData(formattedData, token);
        } catch (onboardingError) {
          console.error("❌ Error submitting onboarding data:", onboardingError);
        }
      }
      
      onSignUpSuccess();
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please log in instead.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address. Please check your email.');
      } else {
        setError(error.message);
      }
      console.error("❌ Error during signup:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label htmlFor="firstName" className="block text-xs font-medium text-gray-700 mb-1.5">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-[#3E7B27]/60 focus:border-[#3E7B27]"
              placeholder="First name"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-xs font-medium text-gray-700 mb-1.5">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-[#3E7B27]/60 focus:border-[#3E7B27]"
              placeholder="Last name (optional)"
            />
          </div>
        </div>
        
        {/* Email field with better proportions */}
        <div>
          <label htmlFor="signup-email" className="block text-xs font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <input
              type="email"
              id="signup-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full pl-9 pr-9 py-1.5 border rounded-md text-xs transition-all outline-none ${
                emailValid === false 
                  ? "border-red-400 focus:ring-1 focus:ring-red-400 focus:border-red-400" 
                  : emailValid === true
                    ? "border-green-500 focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    : "border-gray-200 focus:ring-1 focus:ring-[#3E7B27]/30 focus:border-[#3E7B27]"
              }`}
              placeholder="your@email.com"
            />
            {emailValid !== null && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {emailValid ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-red-400" />
                )}
              </div>
            )}
          </div>
          {emailValid === false && (
            <p className="text-[11px] text-red-400 mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1.5" />
              Please enter a valid email address
            </p>
          )}
        </div>
      </div>
      
      {/* Password fields group with improved spacing */}
      <div className="space-y-3 pt-1">
        <div>
          <label htmlFor="signup-password" className="block text-xs font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <input
              type="password"
              id="signup-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full pl-9 pr-9 py-1.5 border rounded-md text-xs transition-all outline-none ${
                passwordValid === false 
                  ? "border-red-400 focus:ring-1 focus:ring-red-400 focus:border-red-400" 
                  : passwordValid === true
                    ? "border-green-500 focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    : "border-gray-200 focus:ring-1 focus:ring-[#3E7B27]/30 focus:border-[#3E7B27]"
              }`}
              placeholder="••••••••"
            />
            {passwordValid !== null && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {passwordValid ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-red-400" />
                )}
              </div>
            )}
          </div>
          {passwordValid === false && (
            <p className="text-[11px] text-red-400 mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1.5" />
              Password must be at least 6 characters
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="confirm-password" className="block text-xs font-medium text-gray-700 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`w-full pl-9 pr-9 py-1.5 border rounded-md text-xs transition-all outline-none ${
                passwordsMatch === false 
                  ? "border-red-400 focus:ring-1 focus:ring-red-400 focus:border-red-400" 
                  : passwordsMatch === true
                    ? "border-green-500 focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    : "border-gray-200 focus:ring-1 focus:ring-[#3E7B27]/30 focus:border-[#3E7B27]"
              }`}
              placeholder="••••••••"
            />
            {passwordsMatch !== null && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {passwordsMatch ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-red-400" />
                )}
              </div>
            )}
          </div>
          {passwordsMatch === false && (
            <p className="text-[11px] text-red-400 mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1.5" />
              Passwords don't match
            </p>
          )}
        </div>
      </div>
      
      {/* Submit button with better spacing */}
      <div className="pt-1.5">
        <Button 
          type="submit"
          disabled={loading} 
          className="w-full py-2 bg-[#3E7B27] hover:bg-[#346A21] text-white font-medium rounded-md transition-all text-xs"
        >
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </div>
    </form>
  );
};

export default EmailSignUpForm;