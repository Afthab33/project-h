/* Component that handles the workout plan generation process
Shows loading and error states during plan creation */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dumbbell, RefreshCw, AlertCircle, Activity, Loader } from 'lucide-react'; // Add Loader
import { generateWorkoutPlan, getWorkoutPlan } from '../services/workoutService';
import { transformWorkoutPlanData } from '../utils/workoutDataFormatter';
import { useAuth } from '../../../contexts/AuthContext';

/**
 * Component that handles workout plan generation with a polished UI
 */
const WorkoutPlanGenerator = ({ userData, healthMetrics, onWorkoutPlanGenerated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMadeAttempt, setHasMadeAttempt] = useState(false);
  const { getToken } = useAuth();

  // Prepare workout params from user data
  const workoutPlanParams = {
    ...userData,
    ...healthMetrics,
    fitnessLevel: userData.fitnessLevel || "Intermediate",
    days_per_week: userData.days_per_week || 3,
    session_duration: userData.session_duration || "30-45",
    preferred_days: userData.preferred_days || ["Monday", "Wednesday", "Friday"],
    health_conditions: userData.health_conditions || '',
    movement_restrictions: userData.movement_restrictions || ''
  };

  // Function to generate workout plan
  const generatePlan = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get auth token
      const token = await getToken();
      
      if (!token) {
        throw new Error("Authentication required. Please log in again.");
      }

      // Generate the workout plan
      const generationResponse = await generateWorkoutPlan({}, token);

      // IMPORTANT: Add a small delay to ensure Firestore has time to update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Fetch the generated plan
      const workoutPlanResponse = await getWorkoutPlan(token);

      // Transform the data for the UI with better error checking
      if (workoutPlanResponse && workoutPlanResponse.workout_plan) {
        // Add more specific logging to debug the transformation
        
        const formattedWorkoutPlan = transformWorkoutPlanData(workoutPlanResponse);
        onWorkoutPlanGenerated(formattedWorkoutPlan);
      } else {
        console.error("❌ Invalid workout plan structure:", workoutPlanResponse);
        throw new Error("No workout plan data returned from the server");
      }
    } catch (error) {
      console.error("❌ Error generating workout plan:", error);
      setError(error.message || "Failed to generate workout plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate on first load
  useEffect(() => {
    if (!hasMadeAttempt) {
      setHasMadeAttempt(true);
      generatePlan();
    }
  }, [hasMadeAttempt]);

  // Loading state UI
  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <div className="h-2 bg-[#e72208] w-full"></div>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center">
            <Dumbbell className="h-5 w-5 mr-2 text-[#e72208]" />
            Generating Your Workout Plan
          </CardTitle>
          <CardDescription>
            Creating a personalized fitness program based on your goals and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#e72208] mb-6"></div>
          <p className="text-lg text-gray-700 mb-2">Building your personalized workout regimen...</p>
          <p className="text-sm text-gray-500 max-w-md text-center">
            This may take a moment as we're designing exercises to match your fitness level, equipment access, and specific goals.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Error state UI
  if (error) {
    return (
      <Card className="max-w-2xl mx-auto">
        <div className="h-2 bg-red-500 w-full"></div>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            Unable to Generate Workout Plan
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
                  {error}
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 max-w-md text-center mb-6">
            This could be due to a connection issue or a problem with our service. Please try again.
          </p>
          
          <Button 
            onClick={() => generatePlan()} 
            className="bg-[#e72208] hover:bg-[#c61d07]"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Default state (should rarely be seen due to auto-generation)
  return (
    <Card className="max-w-2xl mx-auto">
      <div className="h-2 bg-[#e72208] w-full"></div>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center">
          <Dumbbell className="h-5 w-5 mr-2 text-[#e72208]" />
          Generate Your Workout Plan
        </CardTitle>
        <CardDescription>
          Create a personalized fitness program based on your goals and abilities
        </CardDescription>
      </CardHeader>
      <CardContent className="py-8 text-center">
        <p className="mb-6 text-gray-600">
          Click the button below to generate a personalized workout plan tailored to your:
        </p>
        <ul className="text-left max-w-md mx-auto mb-6 space-y-2">
          <li className="flex items-start">
            <span className="text-[#e72208] mr-2">✓</span>
            <span>Fitness level: <strong>{workoutPlanParams.fitnessLevel}</strong></span>
          </li>
          <li className="flex items-start">
            <span className="text-[#e72208] mr-2">✓</span>
            <span>Schedule: <strong>{workoutPlanParams.days_per_week} days/week</strong></span>
          </li>
          <li className="flex items-start">
            <span className="text-[#e72208] mr-2">✓</span>
            <span>Equipment access and workout location</span>
          </li>
          {workoutPlanParams.health_conditions && (
            <li className="flex items-start">
              <span className="text-[#e72208] mr-2">✓</span>
              <span>Health considerations and movement modifications</span>
            </li>
          )}
        </ul>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          onClick={() => generatePlan()} 
          className="bg-[#e72208] hover:bg-[#c61d07]"
        >
          <Activity className="h-4 w-4 mr-2" />
          Generate Workout Plan
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WorkoutPlanGenerator;