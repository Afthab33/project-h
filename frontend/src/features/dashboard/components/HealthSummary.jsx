import React, { useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Scale, Flame, Heart, Activity } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const HealthSummary = ({ userData, healthMetrics, className = "" }) => {
  const { 
    bmi, 
    bmiCategory, 
    bmiColor, 
    calorieTarget, 
    tdee, 
    bmr 
  } = healthMetrics || {};

  // Handle both string and number BMI values
  const bmiDisplay = bmi ? Number(bmi).toFixed(1) : '--';

  return (
    <Card className={`border-gray-100 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3 cursor-help group">
                  <div className="p-2.5 rounded-xl bg-[#4D55CC]/10 group-hover:bg-[#4D55CC]/20 transition-colors">
                    <Scale className="h-5 w-5 text-[#4D55CC]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 leading-none mb-1.5">BMI</p>
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-lg font-semibold">
                        {bmiDisplay}
                      </p>
                      {bmiCategory && (
                        <span className={`text-xs py-0.5 px-1.5 rounded-full ${bmiColor ? `bg-${bmiColor.replace('text-', '')}/10 ${bmiColor}` : 'bg-gray-100 text-gray-500'} font-medium`}>
                          {bmiCategory}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">Body Mass Index measures body fat based on height and weight</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Daily Target */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3 cursor-help group">
                  <div className="p-2.5 rounded-xl bg-[#3E7B27]/10 group-hover:bg-[#3E7B27]/20 transition-colors">
                    <Flame className="h-5 w-5 text-[#3E7B27]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 leading-none mb-1.5">Daily Target</p>
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-lg font-semibold">{calorieTarget || '--'}</p>
                      <span className="text-xs text-gray-500">cal</span>
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">Recommended daily calorie intake for your goals</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Weight */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3 cursor-help group">
                  <div className="p-2.5 rounded-xl bg-[#e72208]/10 group-hover:bg-[#e72208]/20 transition-colors">
                    <Activity className="h-5 w-5 text-[#e72208]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 leading-none mb-1.5">Weight</p>
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-lg font-semibold">{userData?.weight || '--'}</p>
                      <span className="text-xs text-gray-500">{userData?.weightUnit || 'kg'}</span>
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">Your current weight measurement</p>
              </TooltipContent>
            </Tooltip>
            
            {/* BMR */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3 cursor-help group">
                  <div className="p-2.5 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                    <Heart className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 leading-none mb-1.5">BMR</p>
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-lg font-semibold">{bmr?.toFixed(0) || '--'}</p>
                      <span className="text-xs text-gray-500">cal</span>
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">Basal Metabolic Rate - calories burned at complete rest</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthSummary;