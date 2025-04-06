import React, { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const ActivityLevelStep = ({ formData, handleInputChange, errors, setErrors }) => {
  // Activity levels remain unchanged
  const activityLevels = [
    {
      id: 'sedentary',
      level: '1',
      title: 'Sedentary',
      description: 'Little to no exercise, mostly sitting all day',
      icon: '🪑',
      color: '#e72208'
    },
    {
      id: 'lightly_active',
      level: '2',
      title: 'Lightly Active',
      description: 'Light exercise 1-3 days per week',
      icon: '🚶',
      color: '#e86e4d'
    },
    {
      id: 'moderately_active',
      level: '3',
      title: 'Moderately Active',
      description: 'Moderate exercise 3-5 days per week',
      icon: '🚴',
      color: '#3E7B27'
    },
    {
      id: 'active',
      level: '4',
      title: 'Active',
      description: 'Intense exercise 6-7 days per week or physically active job',
      icon: '🏃',
      color: '#2f669a'
    },
    {
      id: 'very_active',
      level: '5',
      title: 'Very Active',
      description: 'Highly strenuous exercise and physically demanding jobs',
      icon: '🏋️',
      color: '#4D55CC'
    }
  ];
  
  // Validation logic remains unchanged
  useEffect(() => {
    if (setErrors) {
      if (!formData.activityLevel) {
        setErrors(prev => ({ ...prev, activityLevel: "Please select your activity level" }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.activityLevel;
          return newErrors;
        });
      }
    }
  }, [formData.activityLevel, setErrors]);

  // Function to render activity level dots instead of bars
  const renderLevelIndicator = (level, color) => {
    return (
      <div className="flex items-center gap-0.5 mt-0 ml-[10px]">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className={`
              h-[5px] w-[5px] rounded-full
              ${i < parseInt(level) ? `bg-[${color}]` : 'bg-gray-200'}
            `}
          ></div>
        ))}
      </div>
    );
  };

  return (
    <div>
      {/* Removed text description to save more space */}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Daily Activity Level</label>
        <div className="space-y-2">
          {activityLevels.map((activity) => {
            const isSelected = formData.activityLevel === activity.id;
            
            return (
              <label 
                key={activity.id}
                className={`
                  block p-2 border rounded-lg cursor-pointer transition-all
                  ${isSelected 
                    ? `border-[${activity.color}] bg-[${activity.color}]/5 shadow-sm` 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <input 
                  type="radio" 
                  name="activityLevel" 
                  value={activity.id} 
                  checked={isSelected} 
                  onChange={handleInputChange}
                  className="sr-only"
                  required
                />
                
                <div className="flex items-center">
                  <div className={`
                    flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full mr-2.5
                    ${isSelected ? `bg-[${activity.color}]/10` : 'bg-gray-100'}
                  `}>
                    <span className="text-sm">{activity.icon}</span>
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center">
                      <span className={`
                        inline-flex items-center justify-center w-4 h-4 rounded-full 
                        text-white text-xs font-medium mr-1
                        ${isSelected ? `bg-[${activity.color}]` : 'bg-gray-300'}
                      `}>
                        {activity.level}
                      </span>
                      <span className={`
                        font-medium text-sm
                        ${isSelected ? `text-[${activity.color}]` : 'text-gray-800'}
                      `}>
                        {activity.title}
                      </span>
                      
                      {/* Simple dot indicators - shown for all options */}
                      {renderLevelIndicator(activity.level, activity.color)}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{activity.description}</p>
                  </div>
                  
                  {isSelected && (
                    <div className="ml-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill={activity.color}>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Removed the animated bar indicator */}
              </label>
            );
          })}
        </div>
        
        {/* Error message */}
        {errors?.activityLevel && (
          <div className="text-sm text-red-500 mt-1.5 flex items-center">
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            {errors.activityLevel}
          </div>
        )}
        
        {/* Even more compact tip */}
        <div className="mt-2 flex items-start gap-1.5 text-xs text-gray-500">
          <span>💡</span>
          <p>Your activity level determines your calorie needs for optimal results.</p>
        </div>
      </div>
    </div>
  );
};

export default ActivityLevelStep;