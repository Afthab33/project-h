import React, { useEffect, useState } from 'react';
import { AlertCircle, Ruler, Scale, Target } from 'lucide-react';

const cmToInches = (cm) => {
  return cm ? parseFloat(cm) / 2.54 : 0;
};

const kgToLbs = (kg) => {
  return kg ? Math.round(parseFloat(kg) * 2.205) : 0;
};

const BodyMeasurementsStep = ({ formData, handleInputChange, errors, setErrors }) => {
  const [feet, setFeet] = useState(0);
  const [inches, setInches] = useState(0);

  useEffect(() => {
    if (formData.heightUnit === 'ft' && formData.previousHeightUnit === 'cm' && formData.height) {
      const totalInches = Math.round(formData.height / 2.54);
      const ft = Math.floor(totalInches / 12);
      const inch = totalInches % 12;
      setFeet(ft);
      setInches(inch);
      
      const newHeight = ft * 12 + inch;
      if (newHeight !== formData.height) {
        handleInputChange({
          target: {
            name: 'height',
            value: newHeight
          }
        });
      }
    }
    else if (formData.heightUnit === 'ft' && formData.previousHeightUnit === 'in' && formData.height) {
      const ft = Math.floor(formData.height / 12);
      const inch = formData.height % 12;
      setFeet(ft);
      setInches(inch);
    }
    // When switching to cm from feet/inches, convert total inches to cm
    else if (formData.heightUnit === 'cm' && formData.previousHeightUnit === 'ft' && formData.height) {
      const heightInCm = Math.round(formData.height * 2.54);
      handleInputChange({
        target: {
          name: 'height',
          value: heightInCm
        }
      });
    }
    // When switching to inches from feet/inches, keep the total inches value
    else if (formData.heightUnit === 'in' && formData.previousHeightUnit === 'ft' && formData.height) {
    }
  }, [formData.heightUnit, formData.previousHeightUnit]);

  const handleUnitChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'heightUnit') {
      handleInputChange({
        target: {
          name: 'previousHeightUnit',
          value: formData.heightUnit
        }
      });
    }
    
    handleInputChange(e);
  };

  const handleFeetInchesChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'feet') {
      setFeet(parseInt(value) || 0);
    } else if (name === 'inches') {
      setInches(parseInt(value) || 0);
    }
    
    const totalInches = (name === 'feet' ? parseInt(value) || 0 : feet) * 12 + 
                        (name === 'inches' ? parseInt(value) || 0 : inches);
    
    handleInputChange({
      target: {
        name: 'height',
        value: totalInches
      }
    });
  };

  useEffect(() => {
    const newErrors = {};
    
    // Height validation
    if (formData.height) {
      if (formData.heightUnit === 'cm') {
        const minHeight = 120;  // ~4ft
        const maxHeight = 220;  // ~7ft3
        
        if (formData.height < minHeight) {
          newErrors.height = `Height seems too low (min ${minHeight}${formData.heightUnit})`;
        } else if (formData.height > maxHeight) {
          newErrors.height = `Height seems too high (max ${maxHeight}${formData.heightUnit})`;
        }
      } else if (formData.heightUnit === 'in') {
        const minHeight = 48;  // 4ft
        const maxHeight = 87;  // ~7ft3
        
        if (formData.height < minHeight) {
          newErrors.height = `Height seems too low (min 4ft)`;
        } else if (formData.height > maxHeight) {
          newErrors.height = `Height seems too high (max 7ft3in)`;
        }
      } else if (formData.heightUnit === 'ft') {
        const totalInches = formData.height;
        const minHeight = 48;  // 4ft
        const maxHeight = 87;  // ~7ft3
        
        if (totalInches < minHeight) {
          newErrors.height = `Height seems too low (min 4ft)`;
        } else if (totalInches > maxHeight) {
          newErrors.height = `Height seems too high (max 7ft3in)`;
        }
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

  // Initialize feet and inches from total inches when component mounts
  useEffect(() => {
    if (formData.heightUnit === 'ft' && formData.height) {
      setFeet(Math.floor(formData.height / 12));
      setInches(formData.height % 12);
    }
  }, []);

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="space-y-4 sm:space-y-5">
        {/* Height Field - With feet & inches option */}
        <div>
          <div className="flex justify-between items-center mb-1.5 sm:mb-2">
            <label className="block text-sm sm:text-base font-medium text-gray-700">Height</label>
          </div>
          
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <select 
              name="heightUnit" 
              value={formData.heightUnit || 'cm'} 
              onChange={handleUnitChange}
              className="p-2 sm:p-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#4D55CC]/30 focus:border-[#4D55CC] outline-none text-sm sm:text-base flex-shrink-0"
            >
              <option value="cm">Centimeters</option>
              <option value="ft">Feet & Inches</option>
              <option value="in">Inches</option>
            </select>
            
            <div className="w-full flex items-center relative">
              <Ruler className="absolute left-3 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          
          {/* Height input based on selected unit */}
          {formData.heightUnit === 'cm' && (
            <div className="relative">
              <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input 
                type="number" 
                name="height" 
                value={formData.height || ''} 
                onChange={handleInputChange}
                className={`w-full p-2 sm:p-2.5 pl-9 sm:pl-10 pr-12 border rounded-lg transition-all outline-none text-sm sm:text-base ${
                  errors.height 
                    ? "border-red-400 focus:ring-2 focus:ring-red-400/30 focus:border-red-400" 
                    : "border-gray-300 focus:ring-2 focus:ring-[#4D55CC]/30 focus:border-[#4D55CC]"
                }`}
                placeholder="Height in cm"
                min={120}
                max={220}
                aria-invalid={errors.height ? "true" : "false"}
              />
            </div>
          )}
          
          {formData.heightUnit === 'ft' && (
            <div className="flex gap-2">
              {/* Feet Input */}
              <div className="relative flex-1">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <input 
                  type="number" 
                  name="feet" 
                  value={feet || ''} 
                  onChange={handleFeetInchesChange}
                  className={`w-full p-2 sm:p-2.5 pl-9 sm:pl-10 pr-12 border rounded-lg transition-all outline-none text-sm sm:text-base ${
                    errors.height 
                      ? "border-red-400 focus:ring-2 focus:ring-red-400/30 focus:border-red-400" 
                      : "border-gray-300 focus:ring-2 focus:ring-[#4D55CC]/30 focus:border-[#4D55CC]"
                  }`}
                  placeholder="Feet"
                  min={4}
                  max={7}
                  aria-invalid={errors.height ? "true" : "false"}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 text-sm">ft</span>
                </div>
              </div>
              
              {/* Inches Input */}
              <div className="relative flex-1">
                <input 
                  type="number" 
                  name="inches" 
                  value={inches || ''} 
                  onChange={handleFeetInchesChange}
                  className={`w-full p-2 sm:p-2.5 pr-12 border rounded-lg transition-all outline-none text-sm sm:text-base ${
                    errors.height 
                      ? "border-red-400 focus:ring-2 focus:ring-red-400/30 focus:border-red-400" 
                      : "border-gray-300 focus:ring-2 focus:ring-[#4D55CC]/30 focus:border-[#4D55CC]"
                  }`}
                  placeholder="Inches"
                  min={0}
                  max={11}
                  aria-invalid={errors.height ? "true" : "false"}
                />
              </div>
            </div>
          )}
          
          {formData.heightUnit === 'in' && (
            <div className="relative">
              <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input 
                type="number" 
                name="height" 
                value={formData.height || ''} 
                onChange={handleInputChange}
                className={`w-full p-2 sm:p-2.5 pl-9 sm:pl-10 pr-12 border rounded-lg transition-all outline-none text-sm sm:text-base ${
                  errors.height 
                    ? "border-red-400 focus:ring-2 focus:ring-red-400/30 focus:border-red-400" 
                    : "border-gray-300 focus:ring-2 focus:ring-[#4D55CC]/30 focus:border-[#4D55CC]"
                }`}
                placeholder="Height in inches"
                min={48}
                max={87}
                aria-invalid={errors.height ? "true" : "false"}
              />
            </div>
          )}
          
          {/* Error message */}
          {errors.height && (
            <div className="text-xs sm:text-sm text-red-500 mt-1.5 flex items-center animate-fadeIn">
              <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span>{errors.height}</span>
            </div>
          )}
          
          {/* Height conversions - Display for all units */}
          {formData.height && !errors.height && (
            <div className="text-xs text-gray-500 mt-1.5 flex flex-wrap items-center gap-3">
              {formData.heightUnit === 'cm' && (
                <>
                  <span className="flex items-center">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#4D55CC] mr-1.5"></span>
                    {/* Fix: Ensure cmToInches returns a number before calling toFixed */}
                    {parseFloat(cmToInches(formData.height)).toFixed(1)} inches
                  </span>
                  <span className="flex items-center">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#4D55CC] mr-1.5"></span>
                    {Math.floor(cmToInches(formData.height) / 12)}ft {Math.round(cmToInches(formData.height) % 12)}in
                  </span>
                </>
              )}
              
              {formData.heightUnit === 'ft' && (
                <>
                  <span className="flex items-center">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#4D55CC] mr-1.5"></span>
                    {Math.round(formData.height * 2.54)} cm
                  </span>
                  <span className="flex items-center">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#4D55CC] mr-1.5"></span>
                    {formData.height} inches total
                  </span>
                </>
              )}
              
              {formData.heightUnit === 'in' && (
                <>
                  <span className="flex items-center">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#4D55CC] mr-1.5"></span>
                    {Math.round(formData.height * 2.54)} cm
                  </span>
                  <span className="flex items-center">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#4D55CC] mr-1.5"></span>
                    {Math.floor(formData.height / 12)}ft {formData.height % 12}in
                  </span>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Weight Field - With icon */}
        <div>
          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1.5 sm:mb-2">Current Weight</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input 
                type="number" 
                name="weight" 
                value={formData.weight || ''} 
                onChange={handleInputChange}
                className={`w-full p-2 sm:p-2.5 pl-9 sm:pl-10 pr-12 border rounded-lg transition-all outline-none text-sm sm:text-base ${
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
              value={formData.weightUnit || 'kg'} 
              onChange={handleInputChange}
              className="p-2 sm:p-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#3E7B27]/30 focus:border-[#3E7B27] outline-none text-sm sm:text-base flex-shrink-0"
            >
              <option value="kg">kg</option>
              <option value="lbs">lbs</option>
            </select>
          </div>
          
          {/* Error message */}
          {errors.weight && (
            <div className="text-xs sm:text-sm text-red-500 mt-1.5 flex items-center animate-fadeIn">
              <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span>{errors.weight}</span>
            </div>
          )}
          
          {/* Conversion display */}
          {formData.weight && !errors.weight && formData.weightUnit === 'kg' && (
            <div className="text-xs text-gray-500 mt-1.5 flex items-center">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3E7B27] mr-1.5"></span>
              {kgToLbs(formData.weight)} lbs in imperial units
            </div>
          )}
          {formData.weight && !errors.weight && formData.weightUnit === 'lbs' && (
            <div className="text-xs text-gray-500 mt-1.5 flex items-center">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3E7B27] mr-1.5"></span>
              {Math.round(formData.weight / 2.205)} kg in metric units
            </div>
          )}
        </div>

        {/* Target Weight Field with icon */}
        <div>
          <div className="flex justify-between items-center mb-1.5 sm:mb-2">
            <label className="block text-sm sm:text-base font-medium text-gray-700">
              Target Weight <span className="text-gray-400 text-xs sm:text-sm">(Optional)</span>
            </label>
            
            {formData.targetWeight && formData.weight && !errors.targetWeight && (
              <span className="text-xs sm:text-sm text-[#e72208] flex items-center">
                {Math.abs(formData.targetWeight - formData.weight).toFixed(1)} {formData.weightUnit} 
                {formData.targetWeight > formData.weight ? ' to gain' : ' to lose'}
              </span>
            )}
          </div>
          
          <div className="flex items-center">
            <div className="relative flex-1">
              <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
              <input 
                type="number" 
                name="targetWeight" 
                value={formData.targetWeight || ''} 
                onChange={handleInputChange}
                className={`w-full p-2 sm:p-2.5 pl-9 sm:pl-10 pr-12 border rounded-lg transition-all outline-none text-sm sm:text-base ${
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
            <div className="text-xs sm:text-sm text-red-500 mt-1.5 flex items-center animate-fadeIn">
              <AlertCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span>{errors.targetWeight}</span>
            </div>
          )}
          
          {/* Health note for dramatic changes */}
          {formData.targetWeight && formData.weight && 
           !errors.targetWeight && 
           Math.abs(formData.targetWeight - formData.weight) > formData.weight * 0.15 && (
            <div className="text-xs sm:text-sm text-amber-600 mt-1.5 flex items-start bg-amber-50 p-1.5 sm:p-2 rounded-md border border-amber-100">
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
                <span className="text-sm sm:text-base font-medium text-gray-700">Calculated BMI:</span>
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

// BMI Calculation and Display Component - now with improved responsive styling
const BmiIndicator = ({ height, weight, heightUnit, weightUnit }) => {
  // Convert to metric for calculation
  let heightInM;
  if (heightUnit === 'cm') {
    heightInM = height / 100;
  } else if (heightUnit === 'ft' || heightUnit === 'in') {
    // Both 'ft' and 'in' store height in total inches
    heightInM = height * 0.0254;
  }
  
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
      <span className="text-sm sm:text-base font-medium mr-2">{bmi.toFixed(1)}</span>
      <span className={`text-xs sm:text-sm font-medium ${color} px-2 py-0.5 rounded-full bg-gray-100`}>
        {category}
      </span>
    </div>
  );
};

export default BodyMeasurementsStep;