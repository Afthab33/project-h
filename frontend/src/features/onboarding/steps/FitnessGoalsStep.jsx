import React, { useEffect } from 'react';
import { 
  AlertCircle, 
  Check, 
  ArrowUp, 
  ArrowDown, 
  Flame, 
  Dumbbell, 
  Timer, 
  Scale, 
  Leaf 
} from 'lucide-react';

const FitnessGoalsStep = ({ formData, handleInputChange, errors, setErrors }) => {
  // Goal options with Lucide icons instead of emojis
  const fitnessGoals = [
    {
      id: 'lose_weight',
      icon: <Flame className="h-5 w-5 sm:h-6 sm:w-6" />,
      title: 'Lose Weight',
      description: 'Burn fat and achieve a leaner physique',
      color: '#e72208' // red - fitness color
    },
    {
      id: 'gain_muscle',
      icon: <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6" />,
      title: 'Gain Muscle',
      description: 'Build strength and increase muscle mass',
      color: '#3E7B27' // green - nutrition color
    },
    {
      id: 'improve_endurance',
      icon: <Timer className="h-5 w-5 sm:h-6 sm:w-6" />,
      title: 'Improve Endurance',
      description: 'Enhance cardiovascular health and stamina',
      color: '#4D55CC' // blue - sleep color
    },
    {
      id: 'maintain_weight',
      icon: <Scale className="h-5 w-5 sm:h-6 sm:w-6" />,
      title: 'Maintain & Tone',
      description: 'Sustain weight while improving body composition',
      color: '#8e44ad' // purple
    },
    {
      id: 'general_wellness',
      icon: <Leaf className="h-5 w-5 sm:h-6 sm:w-6" />,
      title: 'General Wellness',
      description: 'Boost energy and improve overall health',
      color: '#16a085' // teal
    }
  ];

  // Helper function to get selected goal metadata
  const getSelectedGoal = () => {
    return fitnessGoals.find(goal => goal.id === formData.primaryGoal) || fitnessGoals[0];
  };
  
  // Validate target weight when component mounts or values change
  useEffect(() => {
    if (!formData.targetWeight || !formData.weight) return;
    
    const newErrors = {};
    const selectedGoal = getSelectedGoal();
    
    // For weight loss goals, target should be less than current
    if (formData.primaryGoal === 'lose_weight' && parseFloat(formData.targetWeight) >= parseFloat(formData.weight)) {
      newErrors.targetWeight = "Target weight should be less than your current weight";
    }
    
    // For muscle gain goals, target should be more than current
    if (formData.primaryGoal === 'gain_muscle' && parseFloat(formData.targetWeight) <= parseFloat(formData.weight)) {
      newErrors.targetWeight = "Target weight should be more than your current weight";
    }
    
    // Check if target is realistic (not more than 30% difference from current weight)
    if (Math.abs(formData.targetWeight - formData.weight) > formData.weight * 0.3) {
      newErrors.targetWeight = "Consider a more realistic target (within 30% of current weight)";
    }
    
    // Apply minimum/maximum constraints
    const minWeight = formData.weightUnit === 'kg' ? 30 : 66;
    const maxWeight = formData.weightUnit === 'kg' ? 250 : 550;
    
    if (formData.targetWeight < minWeight) {
      newErrors.targetWeight = `Target seems too low (min ${minWeight}${formData.weightUnit})`;
    } else if (formData.targetWeight > maxWeight) {
      newErrors.targetWeight = `Target seems too high (max ${maxWeight}${formData.weightUnit})`;
    }
    
    setErrors(prev => ({...prev, ...newErrors}));
  }, [formData.primaryGoal, formData.targetWeight, formData.weight, formData.weightUnit, setErrors]);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Primary Goal Selection - Fixed to show full descriptions */}
      <div>
        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2.5 sm:mb-3">Primary Fitness Goal</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {fitnessGoals.map(goal => (
            <label 
              key={goal.id}
              className={`
                p-3 sm:p-4 border rounded-lg flex items-start transition-all cursor-pointer hover:shadow-sm
                ${formData.primaryGoal === goal.id 
                  ? `border-${goal.color.replace('#', '')} bg-opacity-5 shadow-sm` 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              style={{
                borderColor: formData.primaryGoal === goal.id ? goal.color : '',
                backgroundColor: formData.primaryGoal === goal.id ? `${goal.color}10` : ''
              }}
            >
              <input 
                type="radio" 
                name="primaryGoal" 
                value={goal.id} 
                checked={formData.primaryGoal === goal.id} 
                onChange={handleInputChange}
                className="sr-only"
              />
              <div 
                className={`
                  w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 flex items-center justify-center rounded-full mr-3 sm:mr-4 mt-0.5
                `}
                style={{
                  backgroundColor: formData.primaryGoal === goal.id ? `${goal.color}15` : 'rgb(243 244 246)',
                  color: formData.primaryGoal === goal.id ? goal.color : 'rgb(107 114 128)'
                }}
              >
                {goal.icon}
              </div>
              <div className="flex-1">
                <div 
                  className={`font-medium text-sm sm:text-base`}
                  style={{
                    color: formData.primaryGoal === goal.id ? goal.color : 'rgb(31 41 55)'
                  }}
                >
                  {goal.title}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 line-clamp-2">{goal.description}</div>
              </div>
              {formData.primaryGoal === goal.id && (
                <Check 
                  className="h-4 w-4 sm:h-5 sm:w-5 ml-2 flex-shrink-0 mt-1.5" 
                  style={{ color: goal.color }} 
                />
              )}
            </label>
          ))}
        </div>
        
        {/* Error message if no goal selected */}
        {errors.primaryGoal && (
          <div className="text-xs sm:text-sm text-red-500 mt-1.5 sm:mt-2 flex items-center animate-fadeIn">
            <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
            <span>{errors.primaryGoal}</span>
          </div>
        )}
      </div>
      
      {/* Target Weight Section - Only show for relevant goals */}
      {(formData.primaryGoal === 'lose_weight' || formData.primaryGoal === 'gain_muscle') && (
        <div className="mt-5 sm:mt-6 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-1.5 sm:mb-2">
            <label className="text-sm sm:text-base font-medium text-gray-700">Target Weight</label>
            
            {formData.targetWeight && formData.weight && !errors.targetWeight && (
              <div className="text-xs sm:text-sm flex items-center">
                {formData.primaryGoal === 'lose_weight' ? (
                  <div className="flex items-center text-[#e72208] font-medium">
                    <ArrowDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                    {Math.abs(formData.targetWeight - formData.weight).toFixed(1)} {formData.weightUnit} to lose
                  </div>
                ) : (
                  <div className="flex items-center text-[#3E7B27] font-medium">
                    <ArrowUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                    {Math.abs(formData.targetWeight - formData.weight).toFixed(1)} {formData.weightUnit} to gain
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input 
                type="number" 
                name="targetWeight" 
                value={formData.targetWeight || ''} 
                onChange={handleInputChange}
                className={`w-full p-2 sm:p-2.5 pr-12 border rounded-lg transition-all outline-none text-sm sm:text-base ${
                  errors.targetWeight 
                    ? "border-red-400 focus:ring-2 focus:ring-red-400/30 focus:border-red-400" 
                    : `border-gray-300 focus:ring-2 focus:ring-[${getSelectedGoal().color}]/30 focus:border-[${getSelectedGoal().color}]`
                }`}
                placeholder={formData.primaryGoal === 'lose_weight' ? 'Enter target (lower) weight' : 'Enter target (higher) weight'}
                min={formData.weightUnit === 'kg' ? 30 : 66}
                max={formData.weightUnit === 'kg' ? 250 : 550}
                aria-invalid={errors.targetWeight ? "true" : "false"}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-sm">{formData.weightUnit}</span>
              </div>
            </div>
          </div>
          
          {/* Error message */}
          {errors.targetWeight && (
            <div className="text-xs sm:text-sm text-red-500 mt-1.5 sm:mt-2 flex items-center animate-fadeIn">
              <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span>{errors.targetWeight}</span>
            </div>
          )}
          
          {/* Visual weight comparison when both current and target weights are set */}
          {formData.targetWeight && formData.weight && !errors.targetWeight && (
            <div className="mt-3 sm:mt-4 bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-1.5 sm:mb-2">
                <span>Current: {formData.weight} {formData.weightUnit}</span>
                <span>Target: {formData.targetWeight} {formData.weightUnit}</span>
              </div>
              <div className="relative h-2 sm:h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`absolute top-0 bottom-0 ${
                    formData.primaryGoal === 'lose_weight' ? 'right-0' : 'left-0'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.abs(formData.targetWeight - formData.weight) / Math.max(formData.weight, formData.targetWeight) * 100)}%`,
                    backgroundColor: getSelectedGoal().color
                  }}
                ></div>
              </div>
              
              {/* Health impact note for significant changes */}
              {Math.abs(formData.targetWeight - formData.weight) > formData.weight * 0.15 && (
                <div className="text-xs sm:text-sm text-amber-600 mt-2.5 sm:mt-3 flex items-start">
                  <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 flex-shrink-0 mt-0.5" />
                  <span>
                    A {Math.round(Math.abs(formData.targetWeight - formData.weight) / formData.weight * 100)}% 
                    {formData.primaryGoal === 'lose_weight' ? ' weight loss' : ' weight gain'} 
                    is significant. We'll create a safe, progressive plan.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FitnessGoalsStep;