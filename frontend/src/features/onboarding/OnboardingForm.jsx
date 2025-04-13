import React, { useState, useEffect } from 'react';
import PersonalInfoStep from './steps/PersonalInfoStep';
import BodyMeasurementsStep from './steps/BodyMeasurementsStep';
import FitnessGoalsStep from './steps/FitnessGoalsStep';
import ActivityLevelStep from './steps/ActivityLevelStep';
import ExerciseAvailabilityStep from './steps/ExerciseAvailabilityStep';
import HealthConditionsStep from './steps/HealthConditionsStep';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  AlertCircle, 
  Home,
  User,
  Ruler,
  Target,
  Activity,
  Clock,
  Heart
} from 'lucide-react';

const OnboardingForm = ({ formData, setFormData, onSubmit, onBackToLanding }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [touchedSteps, setTouchedSteps] = useState({});
  
  // Track which steps the user has visited/touched
  useEffect(() => {
    setTouchedSteps(prev => ({
      ...prev,
      [currentStep]: true
    }));
  }, [currentStep]);

  // Input change handler with error handling
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (checked) {
        setFormData({
          ...formData,
          healthConditions: [...formData.healthConditions, value]
        });
      } else {
        setFormData({
          ...formData,
          healthConditions: formData.healthConditions.filter(condition => condition !== value)
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
      
      // Clear error when user fixes an input
      if (errors[name]) {
        setErrors({
          ...errors,
          [name]: null
        });
      }
    }
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
      // Scroll to top when moving to next step
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    // Scroll to top when moving to previous step
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Validate the current step before proceeding
  const validateCurrentStep = () => {
    let stepValid = true;
    let newErrors = {};
    
    switch (currentStep) {
      case 1:
        if (!formData.dateOfBirth) {
          newErrors.dateOfBirth = "Date of birth is required";
          stepValid = false;
        }
        if (!formData.gender) {
          newErrors.gender = "Please select your gender";
          stepValid = false;
        }
        break;
      case 2:
        if (!formData.height) {
          newErrors.height = "Height is required";
          stepValid = false;
        }
        if (!formData.weight) {
          newErrors.weight = "Weight is required";
          stepValid = false;
        }
        break;
      case 3:
        if (!formData.primaryGoal) {
          newErrors.primaryGoal = "Please select a primary goal";
          stepValid = false;
        }
        break;
      case 4:
        if (!formData.activityLevel) {
          newErrors.activityLevel = "Please select your activity level";
          stepValid = false;
        }
        break;
      case 5:
        if (!formData.weeklyExercise) {
          newErrors.weeklyExercise = "Please select your weekly exercise";
          stepValid = false;
        }
        break;
      default:
        break;
    }
    
    setErrors({...errors, ...newErrors});
    return stepValid;
  };
  
  // Check if the current step has all required fields filled and valid
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.dateOfBirth && formData.gender && !errors.dateOfBirth;
      case 2:
        return formData.height && formData.weight && !errors.height && !errors.weight;
      case 3:
        return formData.primaryGoal && !errors.primaryGoal;
      case 4:
        return formData.activityLevel && !errors.activityLevel;
      case 5:
        return formData.weeklyExercise && !errors.weeklyExercise;
      default:
        return true;
    }
  };

  // Render appropriate step component
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep 
                 formData={formData} 
                 handleInputChange={handleInputChange}
                 onBackToLanding={onBackToLanding}
                 errors={errors}
                 setErrors={setErrors}
               />;
      case 2:
        return <BodyMeasurementsStep 
                 formData={formData} 
                 handleInputChange={handleInputChange}
                 errors={errors}
                 setErrors={setErrors}
               />;
      case 3:
        return <FitnessGoalsStep 
                 formData={formData} 
                 handleInputChange={handleInputChange}
                 errors={errors}
                 setErrors={setErrors}
               />;
      case 4:
        return <ActivityLevelStep 
                 formData={formData} 
                 handleInputChange={handleInputChange}
                 errors={errors}
                 setErrors={setErrors}
               />;
      case 5:
        return <ExerciseAvailabilityStep 
                 formData={formData} 
                 handleInputChange={handleInputChange}
                 errors={errors}
                 setErrors={setErrors}
               />;
      case 6:
        return <HealthConditionsStep 
                 formData={formData} 
                 handleInputChange={handleInputChange}
                 errors={errors}
                 setErrors={setErrors}
               />;
      default:
        return null;
    }
  };

  // Define all steps info in a single array for easier management
  const steps = [
    { 
      name: "Basic Info",
      description: "Tell us about yourself",
      icon: <User className="h-5 w-5" />,
      isComplete: touchedSteps[1] && formData.dateOfBirth && formData.gender && !errors.dateOfBirth
    },
    { 
      name: "Measurements",
      description: "Your physical details",
      icon: <Ruler className="h-5 w-5" />,
      isComplete: touchedSteps[2] && formData.height && formData.weight && !errors.height && !errors.weight 
    },
    { 
      name: "Goals",
      description: "What you aim to achieve",
      icon: <Target className="h-5 w-5" />,
      isComplete: touchedSteps[3] && formData.primaryGoal && !errors.primaryGoal
    },
    { 
      name: "Activity",
      description: "Your current lifestyle",
      icon: <Activity className="h-5 w-5" />,
      isComplete: touchedSteps[4] && formData.activityLevel && !errors.activityLevel
    },
    { 
      name: "Schedule",
      description: "Time you can dedicate",
      icon: <Clock className="h-5 w-5" />,
      isComplete: touchedSteps[5] && formData.weeklyExercise && !errors.weeklyExercise
    },
    { 
      name: "Health",
      description: "Medical considerations",
      icon: <Heart className="h-5 w-5" />,
      isComplete: touchedSteps[6] // Always valid as health conditions are optional
    }
  ];

  const getStepName = () => steps[currentStep - 1].name;
  const getStepIcon = () => steps[currentStep - 1].icon;

  // Handle final submission with validation
  const handleSubmit = () => {
    if (validateCurrentStep()) {
      onSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center px-4 py-6 sm:px-6 lg:px-8 relative">
      {/* Background circles for visual consistency with landing page */}
      <div className="absolute top-10 sm:top-20 -right-20 sm:-right-12 w-40 sm:w-64 h-40 sm:h-64 bg-[#e72208]/10 rounded-full opacity-60"></div>
      <div className="absolute bottom-5 sm:bottom-10 -left-32 sm:-left-20 w-60 sm:w-80 h-60 sm:h-80 bg-[#3E7B27]/10 rounded-full opacity-60"></div>
      <div className="absolute -bottom-32 sm:-bottom-20 left-1/4 w-40 sm:w-56 h-40 sm:h-56 bg-[#4D55CC]/10 rounded-full opacity-60"></div>
      
      {/* Back to Home button - improved for touch and mobile */}
      {onBackToLanding && (
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={onBackToLanding}
            className="flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
            aria-label="Back to home page"
          >
            <Home className="h-5 w-5" />
            <span className="sr-only sm:not-sr-only sm:ml-1.5 sm:text-sm">Home</span>
          </button>
        </div>
      )}
      
      <div className="w-full max-w-xl z-10 pt-10 sm:pt-0">
        {/* Progress bar - more compact for mobile */}
        <div className="mb-4 sm:mb-5">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <h3 className="text-sm sm:text-base font-medium text-gray-800">Profile Setup</h3>
            <p className="text-xs sm:text-sm font-medium text-gray-500">{Math.round((currentStep / 6) * 100)}% Complete</p>
          </div>
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#3E7B27] rounded-full transition-all duration-300"
              style={{width: `${(currentStep / 6) * 100}%`}}
            ></div>
          </div>
        </div>
        
        {/* Compact mobile step indicator */}
        <div className="sm:hidden mb-3 flex justify-center">
          <div className="inline-flex items-center px-3 py-1.5 bg-white rounded-full shadow-sm border border-gray-100">
            <span className="text-xs font-medium text-gray-500">Step {currentStep}/6:</span>
            <span className="text-sm font-medium text-gray-800 ml-1.5">{getStepName()}</span>
          </div>
        </div>
        
        {/* Horizontal step indicators - hidden on mobile, visible on larger screens */}
        <div className="hidden sm:block mb-5">
          <div className="relative flex items-center justify-between">
            {/* Line connecting the steps */}
            
            {/* Step indicators */}
            {steps.map((step, i) => {
              const stepNum = i + 1;
              const isCurrent = stepNum === currentStep;
              const isPrevious = stepNum < currentStep;
              const isCompleted = isPrevious && step.isComplete;
              const isClickable = isPrevious;
              
              const Position = i === 0 ? 'justify-start' : 
                              i === steps.length - 1 ? 'justify-end' : 
                              'justify-center';
              
              return (
                <div 
                  key={i} 
                  className={`flex flex-col items-center w-10 relative ${isClickable ? 'cursor-pointer' : ''}`}
                  onClick={() => isClickable && setCurrentStep(stepNum)}
                >
                  <div className={`
                    absolute top-0 left-0 right-0 flex ${Position}
                  `}>
                    {isCompleted ? (
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#3E7B27] text-white shadow-sm">
                        <Check className="h-4 w-4" />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#3E7B27] text-white shadow-sm ring-4 ring-[#3E7B27]/20">
                        <span className="text-xs font-medium">{stepNum}</span>
                      </div>
                    ) : isPrevious ? (
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#3E7B27]/10 text-[#3E7B27] border border-[#3E7B27]/30 shadow-sm">
                        <span className="text-xs font-medium">{stepNum}</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-400 border border-gray-200 shadow-sm">
                        <span className="text-xs font-medium">{stepNum}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="h-8 w-8">
                    {/* Spacer div to maintain height */}
                  </div>
                  
                  <span className={`
                    text-xs font-medium mt-1 text-center whitespace-nowrap
                    ${isCurrent ? 'text-gray-800' : 
                      isCompleted ? 'text-[#3E7B27]' : 
                      isPrevious ? 'text-[#3E7B27]/80' : 'text-gray-400'}
                    `}
                  >
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Main card with improved padding for mobile */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Step header - improved for mobile */}
          <div className="p-3 sm:p-4 border-b border-gray-100 flex items-center">
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-[#3E7B27]/10 flex items-center justify-center text-[#3E7B27] mr-3">
              {getStepIcon()}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-800">{getStepName()}</h2>
              <p className="text-xs text-gray-500">{steps[currentStep - 1].description}</p>
            </div>
          </div>
          
          {/* Form content */}
          <div className="p-3 sm:p-5">
            {renderStep()}
            
            {/* Navigation buttons - improved for mobile */}
            <div className="mt-6 flex justify-between pt-4 border-t border-gray-100">
              {currentStep > 1 ? (
                <button 
                  onClick={prevStep}
                  className="px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-all flex items-center text-xs sm:text-sm font-medium"
                >
                  <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                  Back
                </button>
              ) : (
                <div></div> // Empty div to maintain flex spacing
              )}
              
              {currentStep < 6 ? (
                <button 
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className={`px-4 sm:px-5 py-2 rounded-lg text-white font-medium transition-all flex items-center text-xs sm:text-sm ${
                    isStepValid() 
                      ? 'bg-[#3E7B27] hover:bg-[#346A21]' 
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                  aria-label={isStepValid() ? `Continue to ${steps[currentStep]?.name || 'next step'}` : 'Fill required fields to continue'}
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1" />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  className="px-4 sm:px-5 py-2 bg-[#3E7B27] text-white rounded-lg font-medium hover:bg-[#346A21] transition-all flex items-center text-xs sm:text-sm"
                  aria-label="Complete profile setup"
                >
                  Complete
                  <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1" />
                </button>
              )}
            </div>
            
            {/* Mobile-friendly step indicator dots */}
            <div className="mt-4 flex justify-center">
              <div className="flex space-x-1.5">
                {steps.map((step, index) => {
                  const isActive = index + 1 === currentStep;
                  const isComplete = index + 1 < currentStep && step.isComplete;
                  const isPastButIncomplete = index + 1 < currentStep && !step.isComplete;
                  
                  return (
                    <button 
                      key={index}
                      onClick={() => index + 1 < currentStep && setCurrentStep(index + 1)}
                      disabled={index + 1 >= currentStep}
                      className={`
                        h-1.5 rounded-full transition-all duration-300 focus:outline-none
                        ${index + 1 < currentStep ? 'cursor-pointer' : 'cursor-default'}
                        ${isActive 
                          ? 'w-6 bg-[#3E7B27]' 
                          : isComplete
                            ? 'w-1.5 bg-[#3E7B27]'
                            : isPastButIncomplete
                              ? 'w-1.5 bg-amber-400' // Warning color for visited but incomplete
                              : 'w-1.5 bg-gray-200'
                        }
                      `}
                      aria-label={`Go to step ${index + 1}: ${step.name}`}
                      title={
                        isActive ? 'Current step' : 
                        isComplete ? 'Completed step' : 
                        isPastButIncomplete ? 'Needs attention' : 
                        'Upcoming step'
                      }
                    ></button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Brief encouraging message - more compact for mobile */}
        <div className="mt-2 sm:mt-3 text-center text-xs text-gray-500 px-3">
          <p>All information helps personalize your health & fitness plan. You can update details later.</p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;