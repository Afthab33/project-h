import React, { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const ExerciseAvailabilityStep = ({ formData, handleInputChange, errors, setErrors }) => {
  // Enhanced availability options with structured data
  const availabilityOptions = [
    {
      id: '1-2 days/week',
      title: '1-2 days/week',
      description: 'Low frequency',
      icon: '📅',
      color: '#e72208', // red from brand colors
      level: 1,
      forWho: 'Beginners'
    },
    {
      id: '3-4 days/week',
      title: '3-4 days/week',
      description: 'Moderate frequency',
      icon: '📆',
      color: '#3E7B27', // green from brand colors
      level: 2,
      forWho: 'Intermediate'
    },
    {
      id: '5-6 days/week',
      title: '5-6 days/week',
      description: 'High frequency',
      icon: '🗓️',
      color: '#4D55CC', // blue from brand colors
      level: 3,
      forWho: 'Advanced'
    },
    {
      id: '5+ days/week',
      title: '5+ days/week',
      description: 'Very high frequency',
      icon: '⭐',
      color: '#8e44ad', // purple
      level: 4,
      forWho: 'Athletes'
    }
  ];
  
  // Validation logic
  useEffect(() => {
    if (setErrors) {
      if (!formData.weeklyExercise) {
        setErrors(prev => ({ ...prev, weeklyExercise: "Please select your weekly exercise frequency" }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.weeklyExercise;
          return newErrors;
        });
      }
    }
  }, [formData.weeklyExercise, setErrors]);

  return (
    <div>
      {/* More compact intro */}
      <p className="text-gray-600 text-sm mb-3">How many days per week can you commit to exercising?</p>
      
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {availabilityOptions.map(option => {
            const isSelected = formData.weeklyExercise === option.id;
            
            return (
              <label 
                key={option.id}
                className={`
                  block p-3 border rounded-lg cursor-pointer transition-all
                  ${isSelected 
                    ? `border-[${option.color}] bg-[${option.color}]/5 shadow-sm` 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <input 
                  type="radio" 
                  name="weeklyExercise" 
                  value={option.id} 
                  checked={isSelected} 
                  onChange={handleInputChange}
                  className="sr-only"
                  required
                />
                
                <div className="flex items-center">
                  <div className={`
                    w-8 h-8 flex items-center justify-center rounded-full mr-3
                    ${isSelected ? `bg-[${option.color}]/10 text-[${option.color}]` : 'bg-gray-100 text-gray-600'}
                  `}>
                    <span className="text-lg">{option.icon}</span>
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className={`font-medium text-sm ${isSelected ? `text-[${option.color}]` : 'text-gray-800'}`}>
                      {option.title}
                    </div>
                    <div className="flex items-center text-xs">
                      <span className="text-gray-500 truncate">{option.description}</span>
                      <span className={`
                        ml-1.5 px-1.5 py-0.5 rounded-full text-xs
                        ${isSelected ? `bg-[${option.color}]/10 text-[${option.color}]` : 'bg-gray-100 text-gray-600'}
                      `}>
                        {option.forWho}
                      </span>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" viewBox="0 0 20 20" fill={option.color}>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </label>
            );
          })}
        </div>
        
        {/* Error message */}
        {errors?.weeklyExercise && (
          <div className="text-sm text-red-500 mt-1.5 flex items-center">
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            {errors.weeklyExercise}
          </div>
        )}
        
        {/* More compact tip */}
        <div className="mt-3 flex items-start gap-1.5 text-xs text-gray-500">
          <span>💡</span>
          <p>Choose a schedule you can realistically maintain. Consistency is more important than frequency.</p>
        </div>
      </div>
    </div>
  );
};

export default ExerciseAvailabilityStep;