import React, { useEffect } from 'react';
import { ChevronLeft, AlertCircle } from 'lucide-react';

const PersonalInfoStep = ({ formData, handleInputChange, onBackToLanding, errors, setErrors }) => {
  // Validate fields when component mounts or values change
  useEffect(() => {
    const newErrors = {};
    
    // Date of birth validation
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      
      // Check if date is in the future
      if (birthDate > today) {
        newErrors.dateOfBirth = "Date of birth cannot be in the future";
      }
      
      // Check if person is too old (e.g., over 120 years)
      const age = calculateAge(formData.dateOfBirth);
      if (age > 120) {
        newErrors.dateOfBirth = "Please enter a valid date of birth";
      }
      
      // Check if person is too young (e.g., under 13)
      if (age < 13) {
        newErrors.dateOfBirth = "You must be at least 13 years old";
      }
    }
    
    setErrors(prev => ({...prev, ...newErrors}));
  }, [formData.dateOfBirth, setErrors]);

  return (
    <div className="space-y-4">
      {/* Back button is now smaller to save space */}
      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="flex items-center text-gray-600 hover:text-gray-900 text-sm transition-colors"
          aria-label="Back to landing page"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Back to home</span>
        </button>
      )}
      
      <div className="space-y-4">
        {/* Date of Birth Field - Made more compact */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            {formData.dateOfBirth && !errors.dateOfBirth && (
              <span className="text-xs text-gray-500 flex items-center">
                {calculateAge(formData.dateOfBirth)} years old
              </span>
            )}
          </div>
          
          <div className="relative">
            <input 
              type="date" 
              name="dateOfBirth" 
              value={formData.dateOfBirth} 
              onChange={handleInputChange}
              className={`w-full p-2.5 border rounded-lg transition-all outline-none ${
                errors.dateOfBirth 
                  ? "border-red-400 focus:ring-2 focus:ring-red-400/30 focus:border-red-400" 
                  : "border-gray-300 focus:ring-2 focus:ring-[#4D55CC]/30 focus:border-[#4D55CC]"
              }`}
              aria-invalid={errors.dateOfBirth ? "true" : "false"}
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
            />
          </div>
          
          {/* Error message with animation */}
          {errors.dateOfBirth && (
            <div className="text-sm text-red-500 mt-1.5 flex items-center animate-fadeIn">
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              {errors.dateOfBirth}
            </div>
          )}
        </div>
        
        {/* Gender Selection - More responsive layout */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Male option */}
            <label 
              className={`flex items-center justify-center p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                formData.gender === "Male" 
                  ? "border-[#e72208] bg-[#e72208]/5 text-[#e72208] font-medium" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-center space-x-3">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                  formData.gender === "Male" ? "border-[#e72208]" : "border-gray-400"
                }`}>
                  {formData.gender === "Male" && (
                    <div className="w-2 h-2 rounded-full bg-[#e72208]"></div>
                  )}
                </div>
                <span>Male</span>
              </div>
              <input 
                type="radio" 
                name="gender" 
                value="Male" 
                checked={formData.gender === "Male"} 
                onChange={handleInputChange}
                className="sr-only"
              />
            </label>
            
            {/* Female option */}
            <label 
              className={`flex items-center justify-center p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                formData.gender === "Female" 
                  ? "border-[#3E7B27] bg-[#3E7B27]/5 text-[#3E7B27] font-medium" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-center space-x-3">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                  formData.gender === "Female" ? "border-[#3E7B27]" : "border-gray-400"
                }`}>
                  {formData.gender === "Female" && (
                    <div className="w-2 h-2 rounded-full bg-[#3E7B27]"></div>
                  )}
                </div>
                <span>Female</span>
              </div>
              <input 
                type="radio" 
                name="gender" 
                value="Female" 
                checked={formData.gender === "Female"} 
                onChange={handleInputChange}
                className="sr-only"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to calculate age from DOB
const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export default PersonalInfoStep;