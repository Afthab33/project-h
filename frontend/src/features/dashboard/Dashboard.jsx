import React, { useState, useEffect, useRef } from 'react'; // Add useRef import
import * as calculations from '@/utils/healthMetricsCalculator';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  UtensilsCrossed, 
  User, 
  ChevronRight, 
  LogOut, 
  LayoutGrid, 
  Calendar,
  Settings,
  AlertCircle,
  Bell,
  BarChart2,
  Sparkles,
  Moon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Import components
import HealthSummary from './components/HealthSummary';
import DynamicAISummary from './components/DynamicAISummary';
import AICoach from '../coach/AICoach';
import NutritionCard from '../nutrition/NutritionCard'; 
import WorkoutCard from '../workout/WorkoutCard';
import SleepAnalytics from '../sleep/SleepAnalytics';

/**
 * Main Dashboard Component
 * Serves as the central hub for the application
 */
const Dashboard = () => {
  // Auth context and state
  const { 
    currentUser, 
    userProfile, 
    onboardingData, 
    fetchUserData, 
    fetchOnboardingData, 
    logout 
  } = useAuth();
  
  // Create a ref for the AICoach component
  const aiCoachRef = useRef(null);
  
  // Component state
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [healthMetrics, setHealthMetrics] = useState({});
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  /**
   * Calculate user's health metrics from raw data
   */
  const calculateHealthMetrics = (userData) => {
    try {
      // Safety check for required data
      if (!userData.height || !userData.weight) {
        return;
      }
      
      // Calculate BMI
      const bmi = calculations.calculateBMI(
        userData.height, 
        userData.weight, 
        userData.heightUnit,
        userData.weightUnit
      );
      
      // Calculate BMR (Basal Metabolic Rate)
      const bmr = calculations.calculateBMR(
        userData.height,
        userData.weight,
        userData.gender,
        userData.dateOfBirth,
        userData.heightUnit,
        userData.weightUnit
      );
      
      // Calculate TDEE (Total Daily Energy Expenditure)
      const tdee = calculations.calculateTDEE(bmr, userData.activityLevel);
      
      // Calculate daily calorie target based on fitness goals
      const calorieTarget = calculations.calculateCalorieTarget(tdee, userData.primaryGoal);
      
      // Calculate recommended macronutrient distribution
      const macros = calculations.calculateMacros(calorieTarget, userData.primaryGoal);
      
      // Get BMI category and associated UI color
      const { category: bmiCategory, color: bmiColor } = calculations.getBMICategory(bmi);
      
      // Update state with all calculated metrics
      setHealthMetrics({
        bmi,
        bmiCategory,
        bmiColor,
        weightUnit: userData.weightUnit,
        calorieTarget,
        tdee,
        bmr,
        macros     
      });
    } catch (error) {
      console.error("❌ Dashboard: Error calculating health metrics:", error);
    }
  };

  /**
   * Load user data on component mount or when auth context changes
   */
  useEffect(() => {
    const loadUserData = async () => {
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Ensure we have both user profile and onboarding data
        let profile = userProfile;
        let onboarding = onboardingData;
        
        // Only fetch if we don't have the data already
        if (!profile) {
          profile = await fetchUserData();
          if (!profile) {
            throw new Error('Could not retrieve user profile');
          }
        }
        
        // Onboarding data might not exist for new users
        if (!onboarding) {
          onboarding = await fetchOnboardingData();
        }
        
        // Format user data with proper fallbacks
        const formattedUserData = {
          // From user profile
          displayName: profile?.name || profile?.displayName || '',
          email: profile?.email || '',
          photoURL: profile?.photoURL || '',
          
          // From onboarding data with safe fallbacks
          dateOfBirth: onboarding?.dob || '',
          gender: onboarding?.gender || '',
          height: onboarding?.height_in_cm || 0,
          weight: onboarding?.weight_in_kg || 0,
          heightUnit: 'cm',
          weightUnit: 'kg',
          primaryGoal: onboarding?.primary_fitness_goal || '',
          targetWeight: onboarding?.target_weight || 0,
          activityLevel: onboarding?.daily_activity_level || '',
          weeklyExercise: onboarding?.exercise_availability || '',
          healthConditions: onboarding?.health_conditions || [],
          otherCondition: onboarding?.other_medical_conditions || ''
        };
        
        // Update user data state
        setUserData(formattedUserData);
        
        // Calculate health metrics only if we have necessary data
        if (formattedUserData.height > 0 && formattedUserData.weight > 0) {
          calculateHealthMetrics(formattedUserData);
        } else {
          console.warn("⚠️ Dashboard: Missing height or weight data for calculations");
        }
      } catch (error) {
        console.error("❌ Dashboard: Error loading dashboard data:", error);
        setError(error.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (currentUser) {
      loadUserData();
    } else {
      setIsLoading(false);
      setError("No authenticated user found. Please log in.");
    }
  }, [currentUser, userProfile, onboardingData, fetchUserData, fetchOnboardingData]);

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  /**
   * Handle sleep data processing
   */
  const handleSleepDataProcessed = (sleepData) => {
    if (sleepData && sleepData.length > 0 && aiCoachRef.current) {
      
      
      // Calculate recent sleep metrics for summary
      const recentData = sleepData.slice(-7); // Get last week
      
      // Process the data and update coach context
      aiCoachRef.current.updateContext({ 
        sleepData: sleepData,
        sleepSummaryForDisplay: `${recentData.length} days of sleep data analyzed`
      });
      
      // Force a context refresh on the coach
      setTimeout(() => {
        if (aiCoachRef.current) {
          aiCoachRef.current.refreshContext();
        }
      }, 1000);
    }
  };

  /**
   * Set active tab and close mobile nav if open
   */
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsMobileNavOpen(false);
  };

  /**
   * Render error state when something goes wrong
   */
  if (error && !isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <div className="bg-red-50 border-l-4 border-[#e72208] p-6 rounded-lg shadow-sm">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 mr-3 text-[#e72208] flex-shrink-0" />
            <div>
              <p className="font-bold text-[#e72208]">Error loading dashboard</p>
              <p className="mt-1 text-red-600">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-100 text-[#e72208] rounded hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-0 relative overflow-hidden">
      {/* Enhanced decorative background circles */}
      <div className="absolute top-20 -right-12 w-64 h-64 bg-[#e72208]/15 rounded-full opacity-80"></div>
      <div className="absolute top-110 -left-28 w-64 h-64 bg-[#3E7B27]/15 rounded-full opacity-80"></div>
      <div className="absolute -bottom-20 left-1/4 w-46 h-46 bg-[#4D55CC]/15 rounded-full opacity-80"></div>
      <div className="absolute top-60 left-1/3 w-24 h-24 bg-[#e72208]/10 rounded-full opacity-60"></div>
      <div className="absolute bottom-10 -right-10 w-32 h-32 bg-[#3E7B27]/10 rounded-full opacity-60"></div>
      <div className="absolute top-10 right-1/4 w-20 h-20 bg-[#4D55CC]/10 rounded-full opacity-50"></div>
      
      {/* Single accent line for subtle brand presence */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4D55CC]/30 via-[#3E7B27]/30 to-[#e72208]/30 z-40"></div>
      
      {/* Enhanced top navigation bar - mobile responsive */}
      <div className="fixed top-0 left-0 z-30 w-full bg-white/95 border-b border-gray-100 shadow-sm backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
{/*               <div className="bg-gradient-to-r from-[#4D55CC] to-[#3E7B27] p-1.5 rounded-lg mr-2">
                <LayoutGrid className="h-5 w-5 text-white" />
              </div> */}
{/* <div className="bg-gradient-to-r from-[#4D55CC] to-[#3E7B27] p-1.5 rounded-lg mr-2"> */}
  <img
    src="https://img.icons8.com/?size=100&id=48312&format=png&color=000000"
    alt="Health Icon"
    className="h-5 w-5"
  />
{/* </div> */}

              <h1 className="text-xl font-bold bg-gradient-to-r from-[#4D55CC] to-[#3E7B27] bg-clip-text text-transparent">
                Project Health
              </h1>
            </div>
            
            {userData && (
              <div className="flex items-center gap-2 md:gap-4">
                {/* Mobile menu button */}
                <button
                  className="md:hidden p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200"
                  onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {isMobileNavOpen ? (
                      <path d="M18 6L6 18M6 6l12 12" />
                    ) : (
                      <path d="M3 12h18M3 6h18M3 18h18" />
                    )}
                  </svg>
                </button>
                
                {/* User avatar */}
                <div className="flex items-center">
                  {userData.photoURL ? (
                    <img 
                      src={userData.photoURL} 
                      alt={userData.displayName || "User"} 
                      className="h-9 w-9 rounded-full border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-gradient-to-r from-[#4D55CC] to-[#3E7B27] flex items-center justify-center text-white">
                      {userData.displayName ? userData.displayName.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                </div>
                
                {/* Logout button - hidden on small screens */}
                <button 
                  onClick={handleLogout}
                  className="hidden md:flex py-1.5 px-3 text-sm font-medium text-white bg-[#e13e29] hover:bg-[#d31d04] rounded-md items-center"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Mobile navigation menu */}
          {isMobileNavOpen && (
            <div className="md:hidden bg-white py-3 px-2 border-t border-gray-100 shadow-sm">
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleTabChange('home')}
                  className={`flex items-center px-4 py-2 rounded-lg text-left ${activeTab === 'home' ? 'bg-[#4D55CC]/10 text-[#4D55CC]' : 'hover:bg-gray-100'}`}
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  <span>Dashboard</span>
                </button>
                
                <button
                  onClick={() => handleTabChange('nutrition')}
                  className={`flex items-center px-4 py-2 rounded-lg text-left ${activeTab === 'nutrition' ? 'bg-[#3E7B27]/10 text-[#3E7B27]' : 'hover:bg-gray-100'}`}
                >
                  <div className="relative flex items-center">
                    <UtensilsCrossed className="h-4 w-4 mr-2" />
                    <span>Nutrition</span>
                    <span className="absolute -top-2 -right-2 px-1 py-0.5 text-[8px] font-semibold bg-amber-100 text-amber-700 rounded-sm leading-none">BETA</span>
                  </div>
                </button>
                
                <button
                  onClick={() => handleTabChange('fitness')}
                  className={`flex items-center px-4 py-2 rounded-lg text-left ${activeTab === 'fitness' ? 'bg-[#e72208]/10 text-[#e72208]' : 'hover:bg-gray-100'}`}
                >
                  <div className="relative flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    <span>Fitness</span>
                    <span className="absolute -top-2 -right-2 px-1 py-0.5 text-[8px] font-semibold bg-amber-100 text-amber-700 rounded-sm leading-none">BETA</span>
                  </div>
                </button>
                
                <button
                  onClick={() => handleTabChange('sleep')}
                  className={`flex items-center px-4 py-2 rounded-lg text-left ${activeTab === 'sleep' ? 'bg-[#4D55CC]/10 text-[#4D55CC]' : 'hover:bg-gray-100'}`}
                >
                  <Moon className="h-4 w-4 mr-2" />
                  <span>Sleep</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-[#e13e29] rounded-lg text-left hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Create a spacer div that pushes content down by exactly the height of the navbar */}
      <div className="h-16"></div>
      
      {/* Main content container with significantly increased top padding */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-10 md:pt-10 pb-16 md:pb-20 relative z-10">
        {/* Secondary dashboard title with greeting - now with extra margin on mobile */}
        <div className="mt-10 md:mt-14 mb-6 md:mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <span className="text-sm text-gray-500 font-medium mb-1 block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Hello, {userData?.displayName?.split(' ')[0] || 'there'} 👋
            </h2>
          </div>
        </div>

        {/* AI Summary - Direct component, no extra card wrapper */}
        <DynamicAISummary 
          userData={userData || {}}
          healthMetrics={healthMetrics}
          activeTab={activeTab}
          onChatOpen={() => setAiChatOpen(true)}
          isRenamed={true}
        />
        
        {/* Improved Tabs navigation */}
        <Tabs 
          defaultValue="home" 
          className="w-full" 
          onValueChange={setActiveTab}
          value={activeTab}
        >
          {/* Improved Tab Navigation - hidden on mobile as we use the top menu */}
          <div className="mb-6 md:mb-8 hidden md:block">
            <TabsList className="inline-flex p-1 rounded-xl bg-gray-100/80 shadow-sm">
              <TabsTrigger 
                value="home" 
                className="rounded-lg px-4 md:px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#4D55CC] transition-all"
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                <span>Dashboard</span>
                
              </TabsTrigger>
              <TabsTrigger 
                value="nutrition" 
                className="rounded-lg px-4 md:px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#3E7B27] transition-all"
              >
                <div className="relative">
                  <span className="absolute -top-2 -right-2 px-1 py-0.5 text-[8px] font-semibold bg-amber-100 text-amber-700 rounded-sm leading-none">BETA</span>
                  <div className="flex items-center">
                    <UtensilsCrossed className="h-4 w-4 mr-2" />
                    <span>Nutrition</span>
                  </div>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="fitness" 
                className="rounded-lg px-4 md:px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#e72208] transition-all"
              >
                <div className="relative">
                  <span className="absolute -top-2 -right-2 px-1 py-0.5 text-[8px] font-semibold bg-amber-100 text-amber-700 rounded-sm leading-none">BETA</span>
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    <span>Fitness</span>
                  </div>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="sleep" 
                className="rounded-lg px-4 md:px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#4D55CC] transition-all"
              >
                <Moon className="h-4 w-4 mr-2" />
                <span>Sleep</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Mobile tab indicator */}
          <div className="md:hidden mb-6">
            <div className="flex items-center">
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center mr-2
                ${activeTab === 'home' ? 'bg-[#4D55CC]/10 text-[#4D55CC]' : 
                  activeTab === 'nutrition' ? 'bg-[#3E7B27]/10 text-[#3E7B27]' :
                  activeTab === 'fitness' ? 'bg-[#e72208]/10 text-[#e72208]' :
                  'bg-[#4D55CC]/10 text-[#4D55CC]'
                }
              `}>
                {activeTab === 'home' ? <LayoutGrid className="h-5 w-5" /> : 
                 activeTab === 'nutrition' ? <UtensilsCrossed className="h-5 w-5" /> :
                 activeTab === 'fitness' ? <Activity className="h-5 w-5" /> :
                 <Moon className="h-5 w-5" />}
              </div>
              <h3 className="font-medium text-lg">
                {activeTab === 'home' ? 'Dashboard' : 
                 activeTab === 'nutrition' ? 'Nutrition' :
                 activeTab === 'fitness' ? 'Fitness' :
                 'Sleep'}
              </h3>
            </div>
          </div>
          
          {/* Loading state */}
          {isLoading ? (
            <div className="w-full h-64 flex justify-center items-center mt-4 mb-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4D55CC]"></div>
                <p className="mt-4 text-gray-500">Loading your personalized dashboard...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Dashboard Tab - Shows health overview first */}
              <TabsContent value="home" className="space-y-6 md:space-y-8 mt-0">
                {/* Health summary metrics - Only on Dashboard tab */}
                <div className="mb-6 md:mb-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2 text-[#4D55CC]" />
                    Health Overview
                  </h3>
                  <HealthSummary 
                    userData={userData || {}} 
                    healthMetrics={healthMetrics}
                  />
                </div>

                {/* Improved AI Coach Card with better height handling */}
                <div className="overflow-hidden rounded-2xl shadow-md border-0 bg-white mb-12">
                  <div className="bg-gradient-to-r from-[#4D55CC] to-[#3E7B27] p-4 flex items-center">
                    <div className="bg-white/20 p-2 rounded-lg mr-3">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Chat with Oats</h3>
                      <p className="text-xs text-white/80">Your AI Health &amp; Fitness Coach</p>
                    </div>
                  </div>
                  <div className="h-full">
                    <AICoach 
                      ref={aiCoachRef}
                      userData={userData || {}} 
                      healthMetrics={healthMetrics}
                      contextHint={activeTab}
                      hideHeader={true}
                      fixedHeight={false}
                    />
                  </div>
                </div>
              </TabsContent>
              
              {/* Nutrition Tab */}
              <TabsContent value="nutrition" className="mt-0">
                <Card className="rounded-2xl shadow-md border-0 bg-white">
                  <CardContent className="p-4 md:p-6">
                    <NutritionCard 
                      userData={userData || {}}
                      healthMetrics={healthMetrics}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Fitness Tab */}
              <TabsContent value="fitness" className="mt-0">
                <Card className="rounded-2xl shadow-md border-0 bg-white">
                  <CardContent className="p-4 md:p-6">
                    <WorkoutCard
                      userData={userData || {}}
                      healthMetrics={healthMetrics}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sleep Tab */}
              <TabsContent value="sleep" className="mt-0">
                <Card className="rounded-2xl shadow-md border-0 bg-white">
                  <CardContent className="p-4 md:p-6">
                    <SleepAnalytics 
                      userData={userData || {}}
                      healthMetrics={healthMetrics}
                      onDataProcessed={handleSleepDataProcessed}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
