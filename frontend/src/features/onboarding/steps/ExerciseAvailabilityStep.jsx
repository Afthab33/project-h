import React, { useEffect } from 'react';
import { 
  AlertCircle, 
  Calendar, 
  CalendarCheck, 
  CalendarDays, 
  CalendarClock, 
  Lightbulb, 
  CheckCircle2 
} from 'lucide-react';

const ExerciseAvailabilityStep = ({ formData, handleInputChange, errors, setErrors }) => {
  // Enhanced availability options with Lucide React icons
  const availabilityOptions = [
    {
      id: '1-2 days/week',
      title: '1-2 days/week',
      description: 'Low frequency',
      icon: <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: '#e72208', // red from brand colors
      level: 1,
      forWho: 'Beginners'
    },
    {
      id: '3-4 days/week',
      title: '3-4 days/week',
      description: 'Moderate frequency',
      icon: <CalendarCheck className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: '#3E7B27', // green from brand colors
      level: 2,
      forWho: 'Intermediate'
    },
    {
      id: '5-6 days/week',
      title: '5-6 days/week',
      description: 'High frequency',
      icon: <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: '#4D55CC', // blue from brand colors
      level: 3,
      forWho: 'Advanced'
    },
    {
      id: '5+ days/week',
      title: '5+ days/week',
      description: 'Very high frequency',
      icon: <CalendarClock className="h-4 w-4 sm:h-5 sm:w-5" />,
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
    <div className="space-y-4 sm:space-y-5">
      {/* More descriptive but compact heading */}
      <div>
        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">Exercise Frequency</label>
        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">How many days per week can you commit to exercising?</p>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {availabilityOptions.map(option => {
            const isSelected = formData.weeklyExercise === option.id;
            
            return (
              <label 
                key={option.id}
                className="block cursor-pointer transition-all border rounded-lg hover:shadow-sm"
                style={{
                  borderColor: isSelected ? option.color : '#e5e7eb',
                  backgroundColor: isSelected ? `${option.color}10` : 'white'
                }}
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
                
                <div className="flex items-center p-3 sm:p-4">
                  <div 
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full mr-3 sm:mr-4 flex-shrink-0"
                    style={{
                      backgroundColor: isSelected ? `${option.color}15` : '#f3f4f6',
                      color: isSelected ? option.color : '#6b7280'
                    }}
                  >
                    {option.icon}
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div 
                      className="font-medium text-sm sm:text-base"
                      style={{
                        color: isSelected ? option.color : '#1f2937'
                      }}
                    >
                      {option.title}
                    </div>
                    <div className="flex flex-wrap items-center text-xs sm:text-sm mt-0.5">
                      <span className="text-gray-500 mr-1.5">{option.description}</span>
                      <span 
                        className="px-1.5 py-0.5 rounded-full text-xs mt-0.5 sm:mt-0"
                        style={{
                          backgroundColor: isSelected ? `${option.color}15` : '#f3f4f6',
                          color: isSelected ? option.color : '#6b7280'
                        }}
                      >
                        {option.forWho}
                      </span>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <CheckCircle2 
                      className="h-4 w-4 sm:h-5 sm:w-5 ml-2 flex-shrink-0" 
                      style={{ color: option.color }} 
                    />
                  )}
                </div>
              </label>
            );
          })}
        </div>
        
        {/* Error message */}
        {errors?.weeklyExercise && (
          <div className="text-xs sm:text-sm text-red-500 mt-1.5 sm:mt-2 flex items-center animate-fadeIn">
            <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
            <span>{errors.weeklyExercise}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExerciseAvailabilityStep;