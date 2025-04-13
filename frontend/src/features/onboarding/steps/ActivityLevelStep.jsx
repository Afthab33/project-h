import React, { useEffect } from 'react';
import { 
  AlertCircle, 
  Check, 
  Armchair, 
  PersonStanding, 
  Bike, 
  Dumbbell,
  Activity, // Replacing Running with Activity
  Lightbulb // Correct name for LightbulbIcon
} from 'lucide-react';

const ActivityLevelStep = ({ formData, handleInputChange, errors, setErrors }) => {
  // Activity levels with Lucide icons
  const activityLevels = [
    {
      id: 'sedentary',
      level: '1',
      title: 'Sedentary',
      description: 'Little to no exercise, mostly sitting all day',
      icon: <Armchair className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: '#e72208'
    },
    {
      id: 'lightly_active',
      level: '2',
      title: 'Lightly Active',
      description: 'Light exercise 1-3 days per week',
      icon: <PersonStanding className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: '#e86e4d'
    },
    {
      id: 'moderately_active',
      level: '3',
      title: 'Moderately Active',
      description: 'Moderate exercise 3-5 days per week',
      icon: <Bike className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: '#3E7B27'
    },
    {
      id: 'active',
      level: '4',
      title: 'Active',
      description: 'Intense exercise 6-7 days per week or physically active job',
      icon: <Activity className="h-4 w-4 sm:h-5 sm:w-5" />, // Changed from Running to Activity
      color: '#2f669a'
    },
    {
      id: 'very_active',
      level: '5',
      title: 'Very Active',
      description: 'Highly strenuous exercise and physically demanding jobs',
      icon: <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5" />,
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
      <div className="flex items-center gap-0.5 mt-0 ml-2 sm:ml-3">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className={`h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full`}
            style={{ 
              backgroundColor: i < parseInt(level) ? color : '#e5e7eb' 
            }}
          ></div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">Daily Activity Level</label>
        <div className="space-y-2 sm:space-y-3">
          {activityLevels.map((activity) => {
            const isSelected = formData.activityLevel === activity.id;
            
            return (
              <label 
                key={activity.id}
                className={`
                  block p-2.5 sm:p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm
                `}
                style={{
                  borderColor: isSelected ? activity.color : '#e5e7eb',
                  backgroundColor: isSelected ? `${activity.color}10` : 'white'
                }}
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
                  <div 
                    className={`
                      flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full mr-3 sm:mr-4
                    `}
                    style={{
                      backgroundColor: isSelected ? `${activity.color}15` : '#f3f4f6',
                      color: isSelected ? activity.color : '#6b7280'
                    }}
                  >
                    {activity.icon}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center">
                      <span 
                        className={`
                          inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full 
                          text-white text-xs font-medium mr-2
                        `}
                        style={{
                          backgroundColor: isSelected ? activity.color : '#d1d5db'
                        }}
                      >
                        {activity.level}
                      </span>
                      <span 
                        className={`
                          font-medium text-sm sm:text-base
                        `}
                        style={{
                          color: isSelected ? activity.color : '#1f2937'
                        }}
                      >
                        {activity.title}
                      </span>
                      
                      {/* Activity level indicator dots */}
                      {renderLevelIndicator(activity.level, activity.color)}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-1.5 ml-7 sm:ml-8">{activity.description}</p>
                  </div>
                  
                  {/* Checkmark for selected option */}
                  {isSelected && (
                    <div className="ml-auto flex-shrink-0">
                      <Check 
                        className="h-4 w-4 sm:h-5 sm:w-5" 
                        style={{ color: activity.color }} 
                      />
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
        
        {/* Error message */}
        {errors?.activityLevel && (
          <div className="text-xs sm:text-sm text-red-500 mt-1.5 sm:mt-2 flex items-center animate-fadeIn">
            <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
            <span>{errors.activityLevel}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLevelStep;