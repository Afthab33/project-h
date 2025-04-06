// Reusable component for displaying individual exercises
// Shows exercise details, sets/reps, and progression options

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, ArrowUpRight, Minus } from 'lucide-react';

/**
 * ExerciseCard component to display exercise details
 * @param {Object} props 
 * @param {Object} props.exercise - Exercise data
 * @param {number} props.index - Index of the exercise in the list
 * @param {boolean} props.isExpanded - Whether the exercise details are expanded
 * @param {Function} props.onToggle - Handler for toggling expanded state
 */
const ExerciseCard = ({ exercise, index, isExpanded, onToggle }) => {
  return (
    <div className="border rounded-md overflow-hidden">
      <div 
        className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center">
          <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-[#e72208] text-white mr-3 text-xs font-medium">
            {index + 1}
          </span>
          <div>
            <h4 className="font-medium">{exercise.name}</h4>
            <p className="text-xs text-gray-500">
              {exercise.sets} sets • {exercise.reps} reps • {exercise.rest} rest
            </p>
          </div>
        </div>
        <button 
          className="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label={isExpanded ? "Hide details" : "Show details"}
        >
          {isExpanded ? 
            <ChevronUp className="h-5 w-5" /> : 
            <ChevronDown className="h-5 w-5" />
          }
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-4 border-t">
          <div className="mb-3">
            <h5 className="text-xs font-medium mb-1">Muscle Groups:</h5>
            <div className="flex flex-wrap gap-1">
              {exercise.muscleGroups.map((muscle, i) => (
                <Badge key={i} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  {muscle}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="mb-3">
            <h5 className="text-xs font-medium mb-1">Form Notes:</h5>
            <p className="text-sm text-gray-700">{exercise.notes}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="bg-green-50 p-2 rounded-md">
              <h5 className="text-xs font-medium flex items-center text-green-700">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                Progression
              </h5>
              <p className="text-xs text-gray-700 mt-1">{exercise.progression.harder}</p>
            </div>
            
            <div className="bg-blue-50 p-2 rounded-md">
              <h5 className="text-xs font-medium flex items-center text-blue-700">
                <Minus className="h-3 w-3 mr-1" />
                Modification
              </h5>
              <p className="text-xs text-gray-700 mt-1">{exercise.progression.easier}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseCard;