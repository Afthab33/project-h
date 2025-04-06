import React, { useEffect } from 'react';
import { AlertCircle, Info } from 'lucide-react';

const HealthConditionsStep = ({ formData, handleInputChange, errors, setErrors }) => {
  // Health conditions with icons and categories - more compact layout
  const healthConditions = [
    { id: 'No conditions', icon: '✅', category: 'general' },
    { id: 'Diabetes', icon: '🩸', category: 'metabolic' },
    { id: 'High Blood Pressure', icon: '❤️', category: 'cardiovascular' },
    { id: 'Thyroid Issues', icon: '🧠', category: 'hormonal' },
    { id: 'PCOS/PCOD', icon: '🔄', category: 'hormonal' },
    { id: 'Heart Disease', icon: '💔', category: 'cardiovascular' },
    { id: 'Joint Pain/Arthritis', icon: '🦴', category: 'musculoskeletal' },
    { id: 'Asthma', icon: '🫁', category: 'respiratory' },
    { id: 'Recent Injury', icon: '🤕', category: 'musculoskeletal' }
  ];

  // Handle the special case of "No conditions"
  const handleNoConditionsChange = (e) => {
    if (e.target.checked) {
      // If "No conditions" is checked, uncheck all other conditions
      const event = {
        target: {
          name: 'healthConditions',
          value: ['No conditions']
        }
      };
      handleInputChange(event);
    } else if (formData.healthConditions.length === 1 && formData.healthConditions[0] === 'No conditions') {
      // If "No conditions" is the only one checked and being unchecked, set to empty array
      const event = {
        target: {
          name: 'healthConditions',
          value: []
        }
      };
      handleInputChange(event);
    }
  };

  // Handle regular condition changes
  const handleConditionChange = (condition, isChecked) => {
    let newConditions;
    
    if (condition === 'No conditions' && isChecked) {
      // If "No conditions" is checked, uncheck all others
      newConditions = ['No conditions'];
    } else {
      // Start with current conditions, removing "No conditions" if it's there
      newConditions = formData.healthConditions.filter(c => c !== 'No conditions');
      
      // Add or remove the condition
      if (isChecked) {
        newConditions.push(condition);
      } else {
        newConditions = newConditions.filter(c => c !== condition);
      }
    }
    
    const event = {
      target: {
        name: 'healthConditions',
        value: newConditions
      }
    };
    handleInputChange(event);
  };

  // Add validation for health conditions
  useEffect(() => {
    // No validation errors for this step as all fields are optional
    // However, we'll check for textarea length just in case
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
    <div>
      {/* Removed unnecessary space-y-8 max-w-md mx-auto div */}
      {/* Removed text-center mb-8 div */}
      
      <p className="text-sm text-gray-600 mb-4">Select any health conditions that apply to tailor your plan.</p>
      
      {/* Removed background, shadow, padding and border to save space */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Health Conditions</label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {healthConditions.map((condition) => {
              const isChecked = formData.healthConditions.includes(condition.id);
              const isNoConditions = condition.id === 'No conditions';
              
              // Determine if this checkbox should be disabled
              const isDisabled = 
                (isNoConditions ? false : formData.healthConditions.includes('No conditions')) || 
                (isNoConditions && formData.healthConditions.length > 0 && !isChecked);
              
              return (
                <label 
                  key={condition.id}
                  className={`
                    flex items-center p-2.5 border rounded-lg transition-all
                    ${isChecked 
                      ? 'border-[#4D55CC] bg-[#4D55CC]/5' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <input 
                    type="checkbox" 
                    name="healthConditions" 
                    value={condition.id} 
                    checked={isChecked} 
                    onChange={(e) => {
                      if (!isDisabled) {
                        if (isNoConditions) {
                          handleNoConditionsChange(e);
                        } else {
                          handleConditionChange(condition.id, e.target.checked);
                        }
                      }
                    }}
                    disabled={isDisabled}
                    className="sr-only"
                    aria-label={condition.id}
                  />
                  <span className="inline-block text-lg mr-2.5">{condition.icon}</span>
                  <span className={`text-sm ${isChecked ? 'font-medium text-[#4D55CC]' : 'text-gray-700'}`}>
                    {condition.id}
                  </span>
                  {isChecked && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-auto text-[#4D55CC]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </label>
              );
            })}
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Other Health Considerations</label>
            <textarea 
              name="otherCondition" 
              value={formData.otherCondition || ''} 
              onChange={handleInputChange}
              className={`w-full p-2.5 border rounded-lg resize-none transition-all outline-none ${
                errors?.otherCondition 
                  ? "border-red-400 focus:ring-2 focus:ring-red-400/30 focus:border-red-400" 
                  : "border-gray-300 focus:ring-2 focus:ring-[#4D55CC]/30 focus:border-[#4D55CC]"
              }`}
              placeholder="Any other conditions, allergies, or restrictions? (Optional)"
              rows="2"
              maxLength="500"
            />
            {errors?.otherCondition && (
              <div className="text-sm text-red-500 mt-1 flex items-center">
                <AlertCircle className="h-3.5 w-3.5 mr-1" />
                {errors.otherCondition}
              </div>
            )}
            {formData.otherCondition && !errors?.otherCondition && (
              <div className="text-xs text-gray-500 mt-1">
                {500 - formData.otherCondition.length} characters left
              </div>
            )}
          </div>
          
          {/* More compact disclaimer */}
          <div className="mt-4 flex items-start text-xs text-gray-600 p-2 bg-gray-50 rounded-md border border-gray-100">
            <Info className="h-3.5 w-3.5 text-[#e72208] mr-1.5 flex-shrink-0 mt-0.5" />
            <p>
              <span className="font-medium">Note:</span> This personalizes your plan but isn't medical advice. Consult a healthcare professional before starting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthConditionsStep;