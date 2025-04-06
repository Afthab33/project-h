/* Acts as the app's router/controller
Manages which screen is displayed (onboarding, login, dashboard)
Stores and passes form data between components
Coordinates the flow from onboarding to login to dashboard */

import React, { useState, useEffect } from 'react';  // Add useEffect
import LandingPage from '../pages/landing/LandingPage';
import OnboardingForm from '../features/onboarding/OnboardingForm';
import Dashboard from '../features/dashboard/Dashboard';
import Login from '../features/auth/components/Login';
import LoginPage from '../features/auth/components/LoginPage';
import { useAuth } from '../contexts/AuthContext';

const AppFlow = () => {
  const { currentUser, submitOnboardingData, getToken } = useAuth();  // Add these
  
  // Flow control states
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showDirectLogin, setShowDirectLogin] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showLoginPage, setShowLoginPage] = useState(false); // Add this
  
  // Add loading and error states for better UX
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  
  // Questionnaire data
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    gender: '',
    height: '',
    heightUnit: 'cm',
    weight: '',
    weightUnit: 'kg',
    primaryGoal: '',
    activityLevel: '',
    targetWeight: '',
    weeklyExercise: '',
    healthConditions: [],
    otherCondition: ''
  });
  
  // Keep a copy of form data for submission after login
  const [pendingSubmission, setPendingSubmission] = useState(null);

  // Auto-submit onboarding data if we have both currentUser and pendingSubmission
  useEffect(() => {
    const submitPendingData = async () => {
      
      
      
      
      if (currentUser && pendingSubmission && Object.keys(pendingSubmission).length > 0) {
        
        setIsSubmitting(true);
        
        try {
          // Add delay to ensure auth process is fully completed
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Get a fresh token
          const token = await getToken(true);
          
          if (!token) {
            console.error("❌ Failed to get authentication token for onboarding submission");
            setSubmissionError("Authentication error. Please try again.");
            return;
          }
          
          
          
          // Format data consistently for backend
          const formattedData = {
            dob: pendingSubmission.dateOfBirth || '',
            gender: (pendingSubmission.gender || '').toLowerCase(),
            height_in_cm: pendingSubmission.heightUnit === 'cm' 
              ? parseInt(pendingSubmission.height || '0') 
              : Math.round(parseInt(pendingSubmission.height || '0') * 2.54),
            weight_in_kg: pendingSubmission.weightUnit === 'kg'
              ? parseInt(pendingSubmission.weight || '0')
              : Math.round(parseInt(pendingSubmission.weight || '0') / 2.205),
            primary_fitness_goal: pendingSubmission.primaryGoal || '',
            target_weight: parseInt(pendingSubmission.targetWeight || '0') || 0,
            daily_activity_level: pendingSubmission.activityLevel || '',
            exercise_availability: pendingSubmission.weeklyExercise || '',
            health_conditions: Array.isArray(pendingSubmission.healthConditions) 
              ? pendingSubmission.healthConditions 
              : [],
            other_medical_conditions: pendingSubmission.otherCondition || ''
          };
          
          
          
          // Submit the data
          await submitOnboardingData(formattedData, token);
          
          
          // Clear the pending submission since it's been processed
          setPendingSubmission(null);
        } catch (error) {
          console.error("❌ Error auto-submitting onboarding data:", error);
          if (error.response) {
            console.error("❌ Server response:", error.response.status, error.response.data);
          }
          setSubmissionError("Failed to save your profile data. Please update it in your dashboard.");
        } finally {
          setIsSubmitting(false);
        }
      }
    };
    
    submitPendingData();
  }, [currentUser, pendingSubmission, submitOnboardingData, getToken]);

  // Add a new function to handle going back to landing page
  const handleBackToLanding = () => {
    setShowDirectLogin(false);
    setShowOnboarding(false);
    setShowLogin(false);
    setShowDashboard(false);
    setShowLoginPage(false); // Add this
    // Also clear pending submission if user backs out
    setPendingSubmission(null);
  };

  // FLOW 1: Start the signup flow (Get Started → Onboarding → Signup/Login)
  const handleGetStarted = () => {
    setShowOnboarding(true);
    setShowDirectLogin(false);
    setShowLogin(false);
    setShowDashboard(false);
  };

  // FLOW 2: Start the direct login flow (Login → Dashboard)
  const handleDirectLogin = () => {
    setShowDirectLogin(true);
    setShowOnboarding(false);
    setShowLogin(false);
    setShowDashboard(false);
  };

  // When completing the onboarding form
  const handleOnboardingComplete = () => {
    
    
    
    // Save a deep copy of the form data to prevent modification
    setPendingSubmission({...formData});
    
    // Continue to login
    setShowOnboarding(false);
    setShowLogin(true);
  };

  // When login is successful
  const handleLoginSuccess = () => {
    // Don't clear form data immediately - let the useEffect handle submission
    
    
    
    setShowLogin(false);
    setShowDirectLogin(false);
    setShowDashboard(true);
    
    // Only clear form data AFTER we've saved pending submission
    setFormData({
      dateOfBirth: '',
      gender: '',
      height: '',
      heightUnit: 'cm',
      weight: '',
      weightUnit: 'kg',
      primaryGoal: '',
      activityLevel: '',
      targetWeight: '',
      weeklyExercise: '',
      healthConditions: [],
      otherCondition: ''
    });
    
    // Note: We don't clear pendingSubmission here - the useEffect does that after successful submission
  };

  // Redirect from login page to signup flow
  const handleRedirectToSignup = () => {
    setShowDirectLogin(false);
    setShowOnboarding(true);
  };

  // Add this new handler
  const handleSwitchToLogin = () => {
    setShowLogin(false);
    setShowLoginPage(true);
  };

  // Show dashboard if user is logged in
  if (currentUser && (showDashboard || (!showOnboarding && !showLogin && !showDirectLogin))) {
    return (
      <>
        {isSubmitting && <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white p-2 text-center z-50">
          Saving your profile data...
        </div>}
        {submissionError && <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-2 text-center z-50">
          {submissionError}
          <button 
            className="ml-2 underline" 
            onClick={() => setSubmissionError(null)}
          >
            Dismiss
          </button>
        </div>}
        <Dashboard initialFormData={pendingSubmission} />
      </>
    );
  }

  // Show login with signup options after completing onboarding
  if (showLogin) {
    return <Login 
      onLoginSuccess={handleLoginSuccess} 
      formData={pendingSubmission} // Use pendingSubmission here
      onBackToLanding={handleBackToLanding} // Add back functionality
      onSwitchToLogin={handleSwitchToLogin} // Add this
    />;
  }

  // Show direct login component (no signup options)
  if (showDirectLogin) {
    return <LoginPage 
      onLoginSuccess={handleLoginSuccess}
      onRedirectToSignup={handleRedirectToSignup} // Allow redirect to signup flow
      onBackToLanding={handleBackToLanding} // Add back functionality
    />;
  }

  // Add this
  if (showLoginPage) {
    return <LoginPage 
      onLoginSuccess={handleLoginSuccess}
      onRedirectToSignup={handleRedirectToSignup}
      onBackToLanding={handleBackToLanding}
    />;
  }

  // Show onboarding form after clicking "Get Started"
  if (showOnboarding) {
    return (
      <OnboardingForm 
        formData={formData} 
        setFormData={setFormData} 
        onSubmit={() => handleOnboardingComplete()} // Make sure formData is passed
        onBackToLanding={handleBackToLanding} // Add back functionality
      />
    );
  }

  // Show landing page by default
  return <LandingPage 
    onGetStarted={handleGetStarted} 
    onLogin={handleDirectLogin} // Use direct login flow for "Login" click
  />;
};

export default AppFlow;