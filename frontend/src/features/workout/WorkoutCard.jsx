/* Main component that displays the workout information
Uses the workout plan data to render UI */

import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dumbbell, Activity, Heart, Timer, ListChecks, ArrowRight, 
  RefreshCw, HelpCircle, Clock, Flame, BarChart3, AlertCircle,
  Loader, LightbulbIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getWorkoutQuestionnaire, 
  submitWorkoutQuestionnaire, 
  generateWorkoutPlan, 
  getWorkoutPlan 
} from './services/workoutService';
import { transformWorkoutPlanData } from './utils/workoutDataFormatter';
import WorkoutQuestionnaire from './components/WorkoutQuestionnaire';
import WorkoutPlanGenerator from './components/WorkoutPlanGenerator';
import ExerciseCard from './components/ExerciseCard';

const WorkoutCard = ({ userData = {}, healthMetrics = {} }) => {
  const { currentUser, getToken } = useAuth();
  
  // State for workout plan and preferences
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [workoutPreferences, setWorkoutPreferences] = useState(null);
  const [activeDay, setActiveDay] = useState('day1');
  
  // UI state
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  
  // Helper functions for UI display
  const getMainMuscleGroups = (dayPlan) => {
    if (!dayPlan || !dayPlan.exercises || dayPlan.exercises.length === 0) return 'Full Body';
    
    // Get all muscle groups from all exercises
    const allMuscles = dayPlan.exercises.flatMap(ex => ex.muscleGroups || []);
    
    // Count occurrences of each muscle group
    const muscleCounts = allMuscles.reduce((acc, muscle) => {
      acc[muscle] = (acc[muscle] || 0) + 1;
      return acc;
    }, {});
    
    // Get the top 2-3 most frequent muscle groups
    const sortedMuscles = Object.entries(muscleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([muscle]) => muscle);
    
    return sortedMuscles.join(', ');
  };
  
  const getTimeEfficiency = (dayPlan) => {
    if (!dayPlan) return 'N/A';
    
    // Extract minutes from duration string (e.g., "45 minutes" -> 45)
    const durationMatch = dayPlan.duration?.match(/(\d+)/);
    const minutes = durationMatch ? parseInt(durationMatch[1], 10) : 45;
    
    // Calculate sets per minute
    const setsPerMinute = (dayPlan.metrics?.totalSets || 0) / minutes;
    
    if (setsPerMinute >= 0.8) return 'High';
    if (setsPerMinute >= 0.5) return 'Medium';
    return 'Low';
  };
  
  const calculateMainWorkoutDuration = (dayPlan) => {
    if (!dayPlan) return 0;
    
    // Extract minutes from duration string
    const durationMatch = dayPlan.duration?.match(/(\d+)/);
    const totalMinutes = durationMatch ? parseInt(durationMatch[1], 10) : 45;
    
    // Subtract warmup and cooldown time
    const warmupTime = Math.ceil(((dayPlan.warmup?.length || 0) * 0.75));
    const cooldownTime = Math.ceil(((dayPlan.cooldown?.length || 0) * 0.5));
    
    return totalMinutes - warmupTime - cooldownTime;
  };
  
  // Active day's workout plan with fallbacks for safety
  const activeDayPlan = workoutPlan?.days?.find(day => day.id === activeDay) || 
    (workoutPlan?.days?.[0] || {
      id: 'day1',
      dayName: 'Day 1',
      focus: 'Full Body',
      duration: '45 minutes',
      warmup: [],
      exercises: [],
      cooldown: [],
      metrics: { totalSets: 0, estimatedCalories: 0, avgReps: 0 }
    });
  
  // On component mount, check if user has workout preferences
  useEffect(() => {
    const checkWorkoutPreferences = async () => {
      try {
        setIsLoadingPreferences(true);
        
        // Get auth token
        const token = await getToken();
        
        
        if (!token) {
          console.error("❌ No auth token available");
          throw new Error('Authentication required');
        }
        
        // 1. Check if user has workout questionnaire data
        
        const response = await getWorkoutQuestionnaire(token);
        
        
        if (response && response.data) {
          
          setWorkoutPreferences(response.data);
          
          try {
            
            const workoutPlanResponse = await getWorkoutPlan(token);
            
            
            // Add this check to handle both object and string responses
            const planData = typeof workoutPlanResponse === 'string' 
              ? { workout_plan: workoutPlanResponse } 
              : workoutPlanResponse;

            
            const formattedWorkoutPlan = transformWorkoutPlanData(planData);
            
            setWorkoutPlan(formattedWorkoutPlan);
          } catch (planError) {
            
          }
        } else {
          
          setShowQuestionnaire(true);
        }
      } catch (error) {
        console.error("❌ Error checking workout preferences:", error);
        setShowQuestionnaire(true);
      } finally {
        setIsLoadingPreferences(false);
      }
    };
    
    if (currentUser) {
      checkWorkoutPreferences();
    }
  }, [currentUser, getToken]);
  
  // Handle workout preferences submission
  const handleWorkoutPreferencesSubmit = async (preferencesData) => {
    try {
      setSubmissionError(null);
      setIsGeneratingPlan(true);
      
      // Get auth token
      const token = await getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Complete data with user metrics
      const completeData = {
        ...preferencesData,  // All the questionnaire data
        // Add user metrics that might be useful
        height: userData.height,
        weight: userData.weight,
        age: userData.age,
        gender: userData.gender
      };
      
      // 1. Submit workout questionnaire
      const questionnaireResponse = await submitWorkoutQuestionnaire(completeData, token);
      
      // 2. Generate workout plan - backend will use stored questionnaire
      const workoutPlanResponse = await generateWorkoutPlan({}, token);
      
      // 3. Get the generated plan
      const planResponse = await getWorkoutPlan(token);
      
      // Format the data using the utility function
      if (planResponse && planResponse.workout_plan) {
        const formattedWorkoutPlan = transformWorkoutPlanData(planResponse);
        setWorkoutPlan(formattedWorkoutPlan);
        
        // Update preferences state and hide questionnaire
        setWorkoutPreferences(completeData);
        setShowQuestionnaire(false);
      } else {
        throw new Error("No workout plan data received from server");
      }
    } catch (error) {
      console.error("❌ Error submitting workout preferences:", error);
      let errorMessage = 'Failed to generate your workout plan. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      setSubmissionError(errorMessage);
    } finally {
      setIsGeneratingPlan(false);
    }
  };
  
  // Handle workout plan generated from the WorkoutPlanGenerator
  const handleWorkoutPlanGenerated = async (generatedPlan) => {
    try {
      setWorkoutPlan(generatedPlan);
      
      // Get auth token
      const token = typeof getToken === 'function' 
        ? await getToken() 
        : await currentUser?.getIdToken(true);
        
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Save the generated plan to the backend
      await generateWorkoutPlan({
        plan: generatedPlan,
        workoutPreferences: workoutPreferences
      }, token);
    } catch (error) {
      console.error('Error saving generated workout plan:', error);
      setSubmissionError("Failed to save your workout plan. Please try again.");
    }
  };
  
  // Regenerate workout plan
  const handleRegeneratePlan = async () => {
    try {
      setIsGeneratingPlan(true);
      setSubmissionError(null);
      
      // Get auth token
      const token = await getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Generate a new workout plan
      await generateWorkoutPlan({}, token);
      
      // Get the newly generated plan
      const planResponse = await getWorkoutPlan(token);
      
      // Format the data
      if (planResponse && planResponse.workout_plan) {
        const formattedWorkoutPlan = transformWorkoutPlanData(planResponse);
        setWorkoutPlan(formattedWorkoutPlan);
      } else {
        throw new Error("No workout plan data received from server");
      }
    } catch (error) {
      console.error("❌ Error regenerating workout plan:", error);
      setSubmissionError("Failed to regenerate your workout plan. Please try again.");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Refresh workout plan
  const handleRefreshWorkoutPlan = async () => {
    try {
      setIsLoadingPreferences(true);
      const token = await getToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Fetch the latest workout plan
      const planResponse = await getWorkoutPlan(token);
      
      
      if (planResponse && planResponse.workout_plan) {
        const formattedWorkoutPlan = transformWorkoutPlanData(planResponse);
        setWorkoutPlan(formattedWorkoutPlan);
      } else {
        
      }
    } catch (error) {
      console.error("Error refreshing workout plan:", error);
    } finally {
      setIsLoadingPreferences(false);
    }
  };
  
  // Retry submitting the questionnaire
  const retrySubmission = () => {
    setSubmissionError(null);
    setShowQuestionnaire(true);
  };
  
  // Loading state
  if (isLoadingPreferences) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 text-gray-400 animate-spin mr-3" /> {/* Replace LoadingSpinner */}
        <span className="ml-3 text-gray-600">Loading your workout data...</span>
      </div>
    );
  }
  
  // Show error state
  if (submissionError && !showQuestionnaire) {
    return (
      <Card className="max-w-2xl mx-auto">
        <div className="h-2 bg-red-500 w-full"></div>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            Unable to Process Workout Plan
          </CardTitle>
          <CardDescription>
            We encountered an issue while creating your fitness program
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 w-full mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {submissionError}
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 max-w-md text-center mb-6">
            This could be due to a connection issue or a problem with our service. Please try again.
          </p>
          
          <Button 
            onClick={retrySubmission} 
            className="bg-[#e72208] hover:bg-[#c61d07]"
          >
            <Dumbbell className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Show questionnaire if needed
  if (showQuestionnaire) {
    // Show questionnaire if not generating
    return (
      <WorkoutQuestionnaire 
        userData={userData}
        healthMetrics={healthMetrics}
        onSubmit={(data) => {
          setIsGeneratingPlan(true);
          handleWorkoutPreferencesSubmit(data);
        }}
      />
    );
  }
  
  // If we have preferences but no workout plan yet, show the generator
  if (workoutPreferences && !workoutPlan) {
    return <WorkoutPlanGenerator 
      userData={{
        ...userData,
        ...workoutPreferences
      }} 
      healthMetrics={healthMetrics} 
      onWorkoutPlanGenerated={handleWorkoutPlanGenerated} 
    />;
  }
  
  // If no workout plan yet, show the generator
  if (!workoutPlan) {
    return <WorkoutPlanGenerator 
      userData={userData} 
      healthMetrics={healthMetrics} 
      onWorkoutPlanGenerated={handleWorkoutPlanGenerated} 
    />;
  }
  
  // Check if we have workoutPlan.days to avoid rendering errors
  if (!workoutPlan.days || workoutPlan.days.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-center">
          <p className="text-gray-500">Invalid workout plan format</p>
          <Button 
            className="mt-4 bg-[#e72208] hover:bg-[#c61d07]" 
            onClick={handleRegeneratePlan}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate New Workout Plan
          </Button>
        </div>
      </div>
    );
  }
  
  // Render the full Workout Tab content with plan
  return (
    <div className="space-y-8">
      {/* Displays error message if there was a problem */}
      {submissionError && (
        <Alert variant="destructive">
          <AlertDescription>{submissionError}</AlertDescription>
        </Alert>
      )}
      
      {/* Workout Overview Card */}
      <Card className="overflow-hidden">
        <div className="mb-6 p-3 bg-amber-50 rounded-md border border-amber-200">
          <div className="flex">
            <div className="shrink-0 mr-3">
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                <LightbulbIcon className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center mb-1">
                <h4 className="font-medium text-amber-800">Beta Feature</h4>
                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700 rounded-sm">PREVIEW</span>
              </div>
              <p className="text-sm text-amber-700">
                We're continuously improving our workout recommendations. This feature is in early access, and the exercise plans may need refinement to perfectly match your fitness level and goals.
              </p>
            </div>
          </div>
        </div>
        <div className="h-2 bg-[#e72208] w-full"></div>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-bold flex items-center">
                <Dumbbell className="h-5 w-5 mr-2 text-[#e72208]" />
                Workout Overview
              </CardTitle>
              <CardDescription>
                Personalized fitness plan based on your goals and preferences
              </CardDescription>
            </div>
            <Badge className="bg-[#e72208]">Active Plan</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Workout Schedule</h4>
                <div className="flex flex-wrap gap-2">
                  {workoutPlan.days.map((day, index) => (
                    <div key={index} className="flex-1 min-w-[100px]">
                      <div 
                        className={`text-center p-2 rounded-md cursor-pointer transition-colors ${
                          activeDay === day.id 
                            ? 'bg-white border-2 border-[#e72208] text-[#e72208] font-medium' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                        onClick={() => setActiveDay(day.id)}
                      >
                        <p className="text-xs font-medium">{day.dayName}</p>
                        <p className="text-[11px] text-gray-600">{day.focus}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Today's Focus</span>
                  <Badge variant="outline" className="bg-[#e72208] bg-opacity-10 text-[#e72208] border-[#e72208] border-opacity-20">
                    {activeDayPlan.focus}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Duration</span>
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1 text-gray-500" />
                    {activeDayPlan.duration}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Exercises</span>
                  <span>{activeDayPlan.exercises.length} exercises</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Sets</span>
                  <span>{activeDayPlan.metrics?.totalSets || 0} sets</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Workout Metrics</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-gray-600">Est. Calories</span>
                    <Flame className="h-4 w-4 text-[#e72208]" />
                  </div>
                  <p className="text-xl font-bold text-[#e72208]">{activeDayPlan.metrics?.estimatedCalories || 0}</p>
                  <p className="text-[11px] text-gray-500">Based on duration and intensity</p>
                </div>
                
                <div className="bg-orange-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-gray-600">Volume</span>
                    <BarChart3 className="h-4 w-4 text-orange-500" />
                  </div>
                  <p className="text-xl font-bold text-orange-500">
                    {(activeDayPlan.metrics?.totalSets || 0) * (activeDayPlan.metrics?.avgReps || 0)}
                  </p>
                  <p className="text-[11px] text-gray-500">Total reps across all sets</p>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-gray-600">Target Areas</span>
                    <Dumbbell className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="font-medium text-blue-600 text-sm">
                    {getMainMuscleGroups(activeDayPlan)}
                  </p>
                  <p className="text-[11px] text-gray-500">Primary muscle focus</p>
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-gray-600">Time Efficiency</span>
                    <Clock className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="font-medium text-green-600">
                    {getTimeEfficiency(activeDayPlan)}
                  </p>
                  <p className="text-[11px] text-gray-500">Sets per minute</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              className="text-[#e72208] border-[#e72208] hover:bg-red-50"
              onClick={() => setShowQuestionnaire(true)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Preferences
            </Button>
            <Button 
              variant="outline"
              onClick={handleRefreshWorkoutPlan} 
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Plan
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Workout Details Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-bold flex items-center">
              <ListChecks className="h-5 w-5 mr-2 text-[#e72208]" />
              {activeDayPlan.dayName}: {activeDayPlan.focus} Workout
            </CardTitle>
          </div>
          <CardDescription className="pt-1">
            Complete {activeDayPlan.exercises.length} exercises in {activeDayPlan.duration}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-1">
          {/* Warm-up section */}
          {activeDayPlan.warmup && activeDayPlan.warmup.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Heart className="h-4 w-4 mr-1 text-pink-500" />
                Warm-up ({Math.ceil(activeDayPlan.warmup.length * 0.75)} minutes)
              </h3>
              <div className="bg-pink-50 p-3 rounded-md">
                <ul className="space-y-2">
                  {activeDayPlan.warmup.map((item, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-pink-100 text-pink-600 mr-2 text-xs font-medium">
                        {index + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Main workout section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Dumbbell className="h-4 w-4 mr-1 text-[#e72208]" />
              Main Workout ({calculateMainWorkoutDuration(activeDayPlan)} minutes)
            </h3>
            
            <div className="space-y-4">
              {activeDayPlan.exercises && activeDayPlan.exercises.length > 0 ? (
                activeDayPlan.exercises.map((exercise, index) => (
                  <ExerciseCard
                    key={index}
                    exercise={exercise}
                    index={index}
                    isExpanded={true} // Always show as expanded
                    onToggle={() => {}} // Empty function since we don't need toggle
                  />
                ))
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-md">
                  <p className="text-gray-500">No exercises found for this day</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Cool-down section */}
          {activeDayPlan.cooldown && activeDayPlan.cooldown.length > 0 && (
            <div className="mb-2">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Timer className="h-4 w-4 mr-1 text-blue-500" />
                Cool-down ({Math.ceil(activeDayPlan.cooldown.length * 0.5)} minutes)
              </h3>
              <div className="bg-blue-50 p-3 rounded-md">
                <ul className="space-y-2">
                  {activeDayPlan.cooldown.map((item, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-2 text-xs font-medium">
                        {index + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Progression Guidelines Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-bold flex items-center">
            <ArrowRight className="h-5 w-5 mr-2 text-[#e72208]" />
            Progression Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-sm text-gray-700">{workoutPlan.progressionNotes || "Follow the workout plan consistently. When exercises become easier, increase weight or reps to continue making progress."}</p>
          </div>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-start">
              <HelpCircle className="h-4 w-4 mr-2 text-[#e72208] mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">When to Increase Intensity</h4>
                <p className="text-xs text-gray-600 mt-1">
                  If you can complete all sets at the upper end of the rep range with proper form for two consecutive workouts, it's time to increase the challenge.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <HelpCircle className="h-4 w-4 mr-2 text-[#e72208] mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">Rest and Recovery</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Allow 48 hours of recovery between training the same muscle groups. Ensure you're getting 7-9 hours of sleep and staying properly hydrated.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <HelpCircle className="h-4 w-4 mr-2 text-[#e72208] mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">Maintaining Proper Form</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Focus on quality over quantity. It's better to do fewer reps with proper form than more reps with poor form. This prevents injury and ensures optimal muscle engagement.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            variant="ghost"
            onClick={handleRegeneratePlan} 
            className="text-[#e72208] font-medium text-sm hover:bg-red-50 hover:text-[#e72208]"
            disabled={isGeneratingPlan}
          >
            {isGeneratingPlan ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" /> {/* Replace LoadingSpinner */}
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Regenerate Workout Plan
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WorkoutCard;