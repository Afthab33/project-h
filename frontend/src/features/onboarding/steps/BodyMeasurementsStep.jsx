import React, { useEffect } from 'react';
import { cmToInches, kgToLbs } from '@/utils/healthMetricsCalculator';
import { AlertCircle } from 'lucide-react';

const BodyMeasurementsStep = ({ formData, handleInputChange, errors, setErrors }) => {
  // Validate measurements when component mounts or values change
  useEffect(() => {
    const newErrors = {};
    
    // Height validation
    if (formData.height) {
      const minHeight = formData.heightUnit === 'cm' ? 120 : 48;  // ~4ft
      const maxHeight = formData.heightUnit === 'cm' ? 220 : 87;  // ~7ft3
      
      if (formData.height < minHeight) {
        newErrors.height = `Height seems too low (min ${minHeight}${formData.heightUnit})`;
      } else if (formData.height > maxHeight) {
        newErrors.height = `Height seems too high (max ${maxHeight}${formData.heightUnit})`;
      }
    }
    
    // Weight validation
    if (formData.weight) {
      const minWeight = formData.weightUnit === 'kg' ? 30 : 66;   // ~66lbs
      const maxWeight = formData.weightUnit === 'kg' ? 250 : 550; // ~550lbs
      
      if (formData.weight < minWeight) {
        newErrors.weight = `Weight seems too low (min ${minWeight}${formData.weightUnit})`;
      } else if (formData.weight > maxWeight) {
        newErrors.weight = `Weight seems too high (max ${maxWeight}${formData.weightUnit})`;
      }
    }
    
    // Target weight validation (if provided)
    if (formData.targetWeight) {
      const minTarget = formData.weightUnit === 'kg' ? 30 : 66;
      const maxTarget = formData.weightUnit === 'kg' ? 250 : 550;
      
      if (formData.targetWeight < minTarget) {
        newErrors.targetWeight = `Target seems too low (min ${minTarget}${formData.weightUnit})`;
      } else if (formData.targetWeight > maxTarget) {
        newErrors.targetWeight = `Target seems too high (max ${maxTarget}${formData.weightUnit})`;
      }
      
      // Check if target is realistic (not more than 30% difference from current weight)
      if (formData.weight && Math.abs(formData.targetWeight - formData.weight) > formData.weight * 0.3) {
        newErrors.targetWeight = "Consider a more realistic target (within 30% of current weight)";
      }
    }
    
    setErrors(prev => ({...prev, ...newErrors}));
  }, [formData.height, formData.weight, formData.targetWeight, formData.heightUnit, formData.weightUnit, setErrors]);

  return (
    <div className="space-y-4">
      {/* Removed unnecessary header text to save space */}
      
      <div className="space-y-5">
        {/* Height Field - More compact, with validation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Height</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input 
                type="number" 
                name="height" 
                value={formData.height || ''} 
                onChange={handleInputChange}
                className={`w-full p-2.5 pr-12 border rounded-lg transition-all outline-none ${
                  errors.height 
                    ? "border-red-400 focus:ring-2 focus:ring-red-400/30 focus:border-red-400" 
                    : "border-gray-300 focus:ring-2 focus:ring-[#4D55CC]/30 focus:border-[#4D55CC]"
                }`}
                placeholder={formData.heightUnit === 'cm' ? 'Height in cm' : 'Height in inches'}
                min={formData.heightUnit === 'cm' ? 120 : 48}
                max={formData.heightUnit === 'cm' ? 220 : 87}
                aria-invalid={errors.height ? "true" : "false"}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-sm">{formData.heightUnit}</span>
              </div>
            </div>
            <select 
              name="heightUnit" 
              value={formData.heightUnit} 
              onChange={handleInputChange}
              className="p-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#4D55CC]/30 focus:border-[#4D55CC] outline-none w-20"
            >
              <option value="cm">cm</option>
              <option value="in">in</option>
            </select>
          </div>
          
          {/* Error message */}
          {errors.height && (
            <div className="text-sm text-red-500 mt-1.5 flex items-center animate-fadeIn">
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              {errors.height}
            </div>
          )}
          
          {/* Conversion display - Only show when valid */}
          {formData.height && !errors.height && formData.heightUnit === 'cm' && (
            <div className="text-xs text-gray-500 mt-1 flex items-center">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#4D55CC] mr-1.5"></span>
              {cmToInches(formData.height)} inches in imperial units
            </div>
          )}
          {formData.height && !errors.height && formData.heightUnit === 'in' && (
            <div className="text-xs text-gray-500 mt-1 flex items-center">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#4D55CC] mr-1.5"></span>
              {Math.round(formData.height * 2.54)} cm in metric units
            </div>
          )}
        </div>
        
        {/* Weight Field - More compact, with validation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Weight</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input 
                type="number" 
                name="weight" 
                value={formData.weight || ''} 
                onChange={handleInputChange}
                className={`w-full p-2.5 pr-12 border rounded-lg transition-all outline-none ${
                  errors.weight 
                    ? "border-red-400 focus:ring-2 focus:ring-red-400/30 focus:border-red-400" 
                    : "border-gray-300 focus:ring-2 focus:ring-[#3E7B27]/30 focus:border-[#3E7B27]"
                }`}
                placeholder={formData.weightUnit === 'kg' ? 'Weight in kg' : 'Weight in lbs'}
                min={formData.weightUnit === 'kg' ? 30 : 66}
                max={formData.weightUnit === 'kg' ? 250 : 550}
                aria-invalid={errors.weight ? "true" : "false"}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-sm">{formData.weightUnit}</span>
              </div>
            </div>
            <select 
              name="weightUnit" 
              value={formData.weightUnit} 
              onChange={handleInputChange}
              className="p-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#3E7B27]/30 focus:border-[#3E7B27] outline-none w-20"
            >
              <option value="kg">kg</option>
              <option value="lbs">lbs</option>
            </select>
          </div>
          
          {/* Error message */}
          {errors.weight && (
            <div className="text-sm text-red-500 mt-1.5 flex items-center animate-fadeIn">
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              {errors.weight}
            </div>
          )}
          
          {/* Conversion display */}
          {formData.weight && !errors.weight && formData.weightUnit === 'kg' && (
            <div className="text-xs text-gray-500 mt-1 flex items-center">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3E7B27] mr-1.5"></span>
              {kgToLbs(formData.weight)} lbs in imperial units
            </div>
          )}
          {formData.weight && !errors.weight && formData.weightUnit === 'lbs' && (
            <div className="text-xs text-gray-500 mt-1 flex items-center">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3E7B27] mr-1.5"></span>
              {Math.round(formData.weight / 2.205)} kg in metric units
            </div>
          )}
        </div>

        {/* Target Weight Field (Optional) - More compact */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Target Weight <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            
            {formData.targetWeight && formData.weight && !errors.targetWeight && (
              <span className="text-xs text-[#e72208] flex items-center">
                {Math.abs(formData.targetWeight - formData.weight).toFixed(1)} {formData.weightUnit} 
                {formData.targetWeight > formData.weight ? ' to gain' : ' to lose'}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input 
                type="number" 
                name="targetWeight" 
                value={formData.targetWeight || ''} 
                onChange={handleInputChange}
                className={`w-full p-2.5 pr-12 border rounded-lg transition-all outline-none ${
                  errors.targetWeight 
                    ? "border-red-400 focus:ring-2 focus:ring-red-400/30 focus:border-red-400" 
                    : "border-gray-300 focus:ring-2 focus:ring-[#e72208]/30 focus:border-[#e72208]"
                }`}
                placeholder={formData.weightUnit === 'kg' ? 'Target weight in kg' : 'Target weight in lbs'}
                aria-invalid={errors.targetWeight ? "true" : "false"}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 text-sm">{formData.weightUnit}</span>
              </div>
            </div>
          </div>
          
          {/* Error message */}
          {errors.targetWeight && (
            <div className="text-sm text-red-500 mt-1.5 flex items-center animate-fadeIn">
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              {errors.targetWeight}
            </div>
          )}
          
          {/* Health note for dramatic changes */}
          {formData.targetWeight && formData.weight && 
           !errors.targetWeight && 
           Math.abs(formData.targetWeight - formData.weight) > formData.weight * 0.15 && (
            <div className="text-xs text-amber-600 mt-1.5 flex items-start bg-amber-50 p-1.5 rounded-md border border-amber-100">
              <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0 mt-0.5" />
              <span>
                A change of {Math.round(Math.abs(formData.targetWeight - formData.weight) / formData.weight * 100)}% 
                in body weight is significant. We recommend consulting with a healthcare provider for a safe plan.
              </span>
            </div>
          )}
          
          {/* BMI calculation and feedback when both height and weight are provided */}
          {formData.height && formData.weight && !errors.height && !errors.weight && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Calculated BMI:</span>
                <BmiIndicator 
                  height={formData.height} 
                  weight={formData.weight} 
                  heightUnit={formData.heightUnit}
                  weightUnit={formData.weightUnit} 
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// BMI Calculation and Display Component
const BmiIndicator = ({ height, weight, heightUnit, weightUnit }) => {
  // Convert to metric for calculation
  const heightInM = heightUnit === 'cm' ? height / 100 : height * 0.0254;
  const weightInKg = weightUnit === 'kg' ? weight : weight / 2.205;
  
  // Calculate BMI
  const bmi = weightInKg / (heightInM * heightInM);
  
  // Determine BMI category and color
  const getBmiCategory = (bmi) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-500" };
    if (bmi < 25) return { category: "Healthy", color: "text-emerald-500" };
    if (bmi < 30) return { category: "Overweight", color: "text-amber-500" };
    return { category: "Obese", color: "text-red-500" };
  };
  
  const { category, color } = getBmiCategory(bmi);
  
  return (
    <div className="flex items-center">
      <span className="text-sm font-medium mr-2">{bmi.toFixed(1)}</span>
      <span className={`text-xs font-medium ${color} px-2 py-0.5 rounded-full bg-gray-100`}>
        {category}
      </span>
    </div>
  );
};

export default BodyMeasurementsStep;