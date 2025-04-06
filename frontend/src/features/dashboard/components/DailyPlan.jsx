import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, Activity, ArrowRight } from 'lucide-react';

const DailyPlan = ({ userData, healthMetrics, onNutritionClick, onFitnessClick }) => {
  const { calorieTarget, macros = {} } = healthMetrics;
  
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-md font-medium mb-4">Your Daily Plan</h3>
        
        {/* Nutrition Summary */}
        <div className="border-b pb-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <UtensilsCrossed className="h-4 w-4 mr-2 text-[#3E7B27]" />
              <h4 className="font-medium">Today's Nutrition</h4>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onNutritionClick}
              className="text-[#3E7B27]"
            >
              <span className="mr-1">View Plan</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="bg-blue-50 p-2 rounded text-center">
              <p className="text-xs text-gray-500">Protein</p>
              <p className="font-medium">{macros.protein || '--'}%</p>
              <p className="text-xs">{Math.round((calorieTarget || 0) * (macros.protein || 0) / 100 / 4)}g</p>
            </div>
            
            <div className="bg-green-50 p-2 rounded text-center">
              <p className="text-xs text-gray-500">Carbs</p>
              <p className="font-medium">{macros.carbs || '--'}%</p>
              <p className="text-xs">{Math.round((calorieTarget || 0) * (macros.carbs || 0) / 100 / 4)}g</p>
            </div>
            
            <div className="bg-yellow-50 p-2 rounded text-center">
              <p className="text-xs text-gray-500">Fat</p>
              <p className="font-medium">{macros.fat || '--'}%</p>
              <p className="text-xs">{Math.round((calorieTarget || 0) * (macros.fat || 0) / 100 / 9)}g</p>
            </div>
          </div>
          
          <p className="text-xs text-gray-500">Daily target: {calorieTarget || '--'} calories</p>
        </div>
        
        {/* Fitness Summary */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Activity className="h-4 w-4 mr-2 text-[#e72208]" />
              <h4 className="font-medium">Today's Workout</h4>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onFitnessClick}
              className="text-[#e72208]"
            >
              <span className="mr-1">View Workout</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Simple workout summary */}
          <div className="bg-gray-50 p-3 rounded">
            <p className="font-medium mb-1">Upper Body Strength</p>
            <div className="flex items-center justify-between text-sm">
              <span>30 minutes</span>
              <span>4 exercises</span>
              <span className="bg-green-100 px-2 py-0.5 rounded text-green-800 text-xs">Beginner</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyPlan;