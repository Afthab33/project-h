import React, { useEffect, useState } from 'react';
import { 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  Heart, 
  Droplets, 
  Brain, 
  HeartPulse, 
  ActivitySquare, 
  Bone, 
  Wind, 
  Bandage 
} from 'lucide-react';

const HealthConditionsStep = ({ formData, handleInputChange, errors, setErrors }) => {
  // For initialization without race conditions
  const [initialized, setInitialized] = useState(false);

  // Health conditions with Lucide icons
  const healthConditions = [
    { 
      id: 'No conditions', 
      icon: <CheckCircle2 className="h-4 w-4" />, 
      category: 'general',
      color: '#16a085' // teal
    },
    { 
      id: 'Diabetes', 
      icon: <Droplets className="h-4 w-4" />, 
      category: 'metabolic',
      color: '#e72208' // red
    },
    { 
      id: 'High Blood Pressure', 
      icon: <HeartPulse className="h-4 w-4" />, 
      category: 'cardiovascular',
      color: '#e72208' // red
    },
    { 
      id: 'Thyroid Issues', 
      icon: <Brain className="h-4 w-4" />, 
      category: 'hormonal',
      color: '#4D55CC' // blue
    },
    { 
      id: 'PCOS/PCOD', 
      icon: <ActivitySquare className="h-4 w-4" />, 
      category: 'hormonal',
      color: '#4D55CC' // blue
    },
    { 
      id: 'Heart Disease', 
      icon: <Heart className="h-4 w-4" />, 
      category: 'cardiovascular',
      color: '#e72208' // red
    },
    { 
      id: 'Joint Pain/Arthritis', 
      icon: <Bone className="h-4 w-4" />, 
      category: 'musculoskeletal',
      color: '#8e44ad' // purple
    },
    { 
      id: 'Asthma', 
      icon: <Wind className="h-4 w-4" />, 
      category: 'respiratory',
      color: '#3E7B27' // green
    },
    { 
      id: 'Recent Injury', 
      icon: <Bandage className="h-4 w-4" />, 
      category: 'musculoskeletal',
      color: '#8e44ad' // purple
    }
  ];

  // Initialize health conditions with "No conditions" as default
  useEffect(() => {
    if (!initialized) {
      const healthCondArr = formData.healthConditions || [];
      if (!Array.isArray(healthCondArr) || healthCondArr.length === 0) {
        handleInputChange({
          target: {
            name: 'healthConditions',
            value: ['No conditions']
          }
        });
      }
      setInitialized(true);
    }
  }, [initialized, formData.healthConditions, handleInputChange]);

  // Handle condition selection
  const handleConditionSelect = (conditionId) => {
    const currentConditions = Array.isArray(formData.healthConditions) 
      ? [...formData.healthConditions] 
      : [];
    
    let newConditions;
    
    if (conditionId === 'No conditions') {
      // If selecting "No conditions", clear all other conditions
      newConditions = currentConditions.includes('No conditions') ? [] : ['No conditions'];
    } else {
      // Remove "No conditions" if it exists
      newConditions = currentConditions.filter(id => id !== 'No conditions');
      
      // Toggle the selected condition
      if (currentConditions.includes(conditionId)) {
        newConditions = newConditions.filter(id => id !== conditionId);
      } else {
        newConditions.push(conditionId);
      }
      
      // If no conditions are selected, don't auto-add "No conditions"
      if (newConditions.length === 0) {
        newConditions = [];
      }
    }
    
    handleInputChange({
      target: {
        name: 'healthConditions',
        value: newConditions
      }
    });
  };

  // Validate other conditions text length
  useEffect(() => {
    if (formData.otherCondition && formData.otherCondition.length > 500) {
      setErrors?.(prev => ({
        ...prev,
        otherCondition: 'Please keep your description under 500 characters'
      }));
    } else if (errors?.otherCondition) {
      setErrors?.(prev => {
        const newErrors = { ...prev };
        delete newErrors.otherCondition;
        return newErrors;
      });
    }
  }, [formData.otherCondition, errors, setErrors]);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Health Conditions</label>
        <p className="text-xs text-gray-600 mb-2">
          Select any health conditions that apply to tailor your plan.
        </p>
        
        {/* 3-column grid on larger screens for more horizontal layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 sm:gap-2">
          {healthConditions.map((condition) => {
            const isSelected = Array.isArray(formData.healthConditions) && 
                              formData.healthConditions.includes(condition.id);
            // Remove the isDisabled logic that was preventing selection of other conditions
            
            return (
              <button
                key={condition.id}
                type="button"
                onClick={() => handleConditionSelect(condition.id)}
                className={`
                  flex items-center p-2 border rounded-lg transition-all text-left outline-none
                  cursor-pointer focus:outline-none focus:ring-1 focus:ring-offset-1
                `}
                style={{
                  borderColor: isSelected ? condition.color : '#e5e7eb',
                  backgroundColor: isSelected ? `${condition.color}10` : 'white'
                }}
              >
                <div 
                  className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full mr-2"
                  style={{
                    backgroundColor: isSelected ? `${condition.color}15` : '#f3f4f6',
                    color: isSelected ? condition.color : '#6b7280'
                  }}
                >
                  {condition.icon}
                </div>
                
                <span 
                  className="text-xs flex-1"
                  style={{
                    fontWeight: isSelected ? 500 : 400,
                    color: isSelected ? condition.color : '#374151'
                  }}
                >
                  {condition.id}
                </span>
                
                {isSelected && (
                  <CheckCircle2 
                    className="h-3.5 w-3.5 ml-1 flex-shrink-0" 
                    style={{ color: condition.color }} 
                  />
                )}
              </button>
            );
          })}
        </div>
        
        {/* Combined "Other Considerations" and disclaimer for space efficiency */}
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-medium text-gray-700">
              Other Health Considerations
            </label>
            {formData.otherCondition && !errors?.otherCondition && (
              <div className="text-[10px] text-gray-500">
                {500 - formData.otherCondition.length} left
              </div>
            )}
          </div>
          
          <textarea 
            name="otherCondition" 
            value={formData.otherCondition || ''} 
            onChange={handleInputChange}
            className={`w-full p-2 border rounded-lg resize-none transition-all text-xs ${
              errors?.otherCondition 
                ? "border-red-400 focus:ring-1 focus:ring-red-400/30 focus:border-red-400" 
                : "border-gray-300 focus:ring-1 focus:ring-[#4D55CC]/30 focus:border-[#4D55CC]"
            }`}
            placeholder="Any other conditions, allergies, or restrictions? (Optional)"
            rows="1"
            maxLength="500"
          />
          
          {errors?.otherCondition && (
            <div className="text-[10px] text-red-500 mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
              <span>{errors.otherCondition}</span>
            </div>
          )}
        </div>
        
        {/* Disclaimer moved to inline with less padding */}
        <div className="mt-2 flex items-start bg-gray-50 p-1.5 rounded-md border border-gray-100">
          <Info className="h-3 w-3 text-[#e72208] mr-1.5 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-gray-600 leading-tight">
            <span className="font-medium">Note:</span> This information helps personalize your plan but isn't medical advice. Consult a healthcare professional.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HealthConditionsStep;