// Unit Conversions
export const cmToInches = (cm) => {
  if (!cm) return '';
  const inches = cm / 2.54;
  const feet = Math.floor(inches / 12);
  const remainingInches = Math.round(inches % 12);
  return `${feet}'${remainingInches}"`;
};

export const inchesToCm = (feet, inches) => {
  if (feet === undefined || inches === undefined) return '';
  return (feet * 12 + inches) * 2.54;
};

export const kgToLbs = (kg) => {
  if (!kg) return '';
  return Math.round(kg * 2.205);
};

export const lbsToKg = (lbs) => {
  if (!lbs) return '';
  return Math.round(lbs / 2.205 * 10) / 10;
};

// Basic Body Composition Calculations
export const calculateBMI = (height, weight, heightUnit, weightUnit) => {
  if (!height || !weight) return 'N/A';
  const heightInMeters = heightUnit === 'cm' ? height / 100 : height * 0.0254;
  const weightInKg = weightUnit === 'kg' ? weight : weight / 2.205;
  const bmi = weightInKg / (heightInMeters * heightInMeters);
  return bmi.toFixed(1);
};

export const getBMICategory = (bmi) => {
  let category, color;
  
  if (bmi < 18.5) {
    category = 'Underweight';
    color = 'bg-blue-500 text-white';
  } else if (bmi < 25) {
    category = 'Healthy Weight';
    color = 'bg-green-500 text-white';
  } else if (bmi < 30) {
    category = 'Overweight';
    color = 'bg-yellow-500 text-white';
  } else {
    category = 'Obese';
    color = 'bg-red-500 text-white';
  }
  
  return { category, color };
};

// Energy & Metabolic Calculations
export const calculateBMR = (height, weight, gender, dateOfBirth, heightUnit, weightUnit) => {
  if (!height || !weight || !gender || !dateOfBirth) return 'N/A';
  
  const heightInCm = heightUnit === 'cm' ? height : height * 2.54;
  const weightInKg = weightUnit === 'kg' ? weight : weight / 2.205;
  
  // Calculate age from date of birth
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  // Mifflin-St Jeor Equation
  let bmr;
  if (gender.toLowerCase() === 'male') {
    bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * age) + 5;
  } else {
    bmr = (10 * weightInKg) + (6.25 * heightInCm) - (5 * age) - 161;
  }
  
  return Math.round(bmr);
};

export const calculateTDEE = (bmr, activityLevel) => {
  if (bmr === 'N/A') return 'N/A';
  
  // Map the activity level values to multipliers
  const activityMultipliers = {
    'sedentary': 1.2,
    'lightly_active': 1.375,
    'moderately_active': 1.55,
    'active': 1.725,
    'very_active': 1.9
  };
  
  // Get the multiplier or use a default
  const activityMultiplier = activityMultipliers[activityLevel] || 1.55;
  
  return Math.round(bmr * activityMultiplier);
};

export const calculateCalorieTarget = (tdee, primaryGoal) => {
  if (!tdee || tdee === 'N/A') return 'N/A';

  // Map goal IDs from FitnessGoalsStep to calorie adjustments
  const goalMultipliers = {
    'lose_weight': 0.8,        // 20% deficit for weight loss
    'gain_muscle': 1.1,        // 10% surplus for muscle gain
    'improve_endurance': 0.95, // 5% deficit for endurance
    'maintain_weight': 1.0,    // Maintenance for toning
    'general_wellness': 1.0    // Maintenance for general health
  };

  const multiplier = goalMultipliers[primaryGoal] || 1.0;
  return Math.round(tdee * multiplier);
};

export const calculateMacros = (calorieTarget, primaryGoal) => {
  if (!calorieTarget || calorieTarget === 'N/A') {
    return { protein: 'N/A', carbs: 'N/A', fat: 'N/A' };
  }

  // Updated macro ratios based on the primary goal IDs
  const macroRatios = {
    'lose_weight': { protein: 0.35, carbs: 0.35, fat: 0.30 },
    'gain_muscle': { protein: 0.30, carbs: 0.45, fat: 0.25 },
    'improve_endurance': { protein: 0.25, carbs: 0.55, fat: 0.20 },
    'maintain_weight': { protein: 0.30, carbs: 0.40, fat: 0.30 },
    'general_wellness': { protein: 0.30, carbs: 0.40, fat: 0.30 }
  };

  const defaultRatio = { protein: 0.30, carbs: 0.40, fat: 0.30 };
  const macros = macroRatios[primaryGoal] || defaultRatio;

  // Calculate calories for each macro
  const proteinCalories = calorieTarget * macros.protein;
  const carbCalories = calorieTarget * macros.carbs;
  const fatCalories = calorieTarget * macros.fat;

  // Convert calories to grams
  const proteinGrams = Math.round(proteinCalories / 4); // Protein: 4 calories/g
  const carbsGrams = Math.round(carbCalories / 4);      // Carbs: 4 calories/g
  const fatGrams = Math.round(fatCalories / 9);         // Fat: 9 calories/g

  return { protein: proteinGrams, carbs: carbsGrams, fat: fatGrams };
};