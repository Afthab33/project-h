/**
 * Generates an optimized prompt for the AI health coach
 * @param {Object} userData - User profile and onboarding data
 * @param {Array} messages - Previous conversation messages
 * @param {String} message - Current user message
 * @returns {String} - Formatted prompt for the AI
 */
export const generateCoachPrompt = (userData, messages, message) => {
  // Extract key user data with fallbacks
  const name = userData?.displayName || userData?.name || 'User';
  const primaryGoal = userData?.primaryGoal || userData?.goal || 'general health';
  const age = userData?.age || 'unknown';
  const gender = userData?.gender || 'unknown';
  const height = userData?.height || 'unknown';
  const weight = userData?.weight || 'unknown';
  const bmi = userData?.bmi || userData?.healthMetrics?.bmi || 'unknown';
  const bmiCategory = userData?.bmiCategory || userData?.healthMetrics?.bmiCategory || 'unknown';
  
  // Health data
  const activityLevel = userData?.activityLevel || 'unknown';
  const workoutAccess = userData?.workoutAccess?.join(', ') || userData?.gymAccess || 'unknown';
  const dietPreference = userData?.dietPreference || userData?.dietType || userData?.diet_type || 'unknown';
  const sleepHours = userData?.sleepHours || userData?.sleep || 'unknown';
  const waterIntake = userData?.waterIntake || 'unknown';
  
  // Medical considerations
  const healthConditions = Array.isArray(userData?.healthConditions) 
    ? userData.healthConditions.join(', ') 
    : Array.isArray(userData?.health_conditions)
    ? userData.health_conditions.join(', ')
    : 'none reported';
    
  const allergies = Array.isArray(userData?.allergies)
    ? userData.allergies.join(', ')
    : 'none reported';
    
  const injuries = Array.isArray(userData?.injuries)
    ? userData.injuries.join(', ')
    : Array.isArray(userData?.movement_restrictions)
    ? userData.movement_restrictions.join(', ')
    : 'none reported';
  
  // Nutritional targets
  const calorieTarget = userData?.healthMetrics?.calorieTarget || userData?.calories || 'unknown';
  const proteinTarget = userData?.healthMetrics?.proteinTarget || userData?.protein || 'unknown';
  const carbsTarget = userData?.healthMetrics?.carbsTarget || userData?.carbs || 'unknown';
  const fatsTarget = userData?.healthMetrics?.fatsTarget || userData?.fats || 'unknown';
  
  // Get existing workout plan if available
  const hasWorkoutPlan = userData?.workout_plan ? true : false;
  const workoutPlanSummary = hasWorkoutPlan 
    ? `User has a ${userData?.workout_plan?.frequencyPerWeek || 3}-day workout plan focusing on ${userData?.workout_plan?.focus || 'general fitness'}.`
    : 'No workout plan generated yet.';
    
  // Get existing meal plan if available
  const hasMealPlan = userData?.meal_plan ? true : false; 
  const mealPlanSummary = hasMealPlan
    ? `User has a ${userData?.meal_plan?.meals_per_day || 3}-meal plan with ${userData?.meal_plan?.calories || 'unknown'} calories.`
    : 'No meal plan generated yet.';

  // Format previous messages
  const conversationHistory = messages.length > 0 
    ? messages.map(m => `${m.role === 'user' ? 'User' : 'Coach'}: ${m.content}`).join('\n')
    : 'No previous conversation.';
  
  // Extract sleep data if available and emphasize it
  const sleepInsights = userData.sleepInsights || "No sleep data available.";
  const hasSleepData = sleepInsights !== "No sleep data available.";
  
  return `
You are Oats, the AI fitness and wellness coach for Project Health. You have access to the user's health profile and should provide personalized guidance.

CRITICAL RESPONSE INSTRUCTIONS:
1. Write in PLAIN TEXT only - do NOT use Markdown formatting like **, ##, or bullet points
2. Be concise but personalized - keep to 5-7 sentences maximum 
3. Reference specific user metrics (BMI, weight, activity level, goals)
4. Provide 2-3 clear recommendations specific to their situation
5. Do not use numbered lists or bullet points - use natural paragraphs instead
6. Write in a conversational, friendly tone with occasional emojis for warmth
7. Start with a greeting using their name
${hasSleepData ? '8. ALWAYS acknowledge and reference the user\'s sleep data when relevant to their question' : ''}

👤 User Profile:
Name: ${name}
Age: ${age}
Gender: ${gender}
Height: ${height}
Weight: ${weight}
BMI: ${bmi} (${bmiCategory})
Goal: ${primaryGoal}
Activity Level: ${activityLevel}
Diet Preference: ${dietPreference}
Sleep: ${sleepHours}

Nutrition Targets:
- Daily Calories: ${calorieTarget}
- Protein: ${proteinTarget}
- Carbs: ${carbsTarget}
- Fats: ${fatsTarget}

${hasSleepData ? 'IMPORTANT - SLEEP ANALYTICS DATA:' : 'Sleep Insights:'}
${sleepInsights}

Medical: ${healthConditions || 'None reported'}
Allergies: ${allergies || 'None reported'}
Injuries: ${injuries || 'None reported'}

${hasSleepData ? 'REMEMBER: The user has uploaded their actual sleep data, so use this information to provide personalized advice instead of general sleep recommendations.' : ''}

💬 Current User Message: "${message}"

Respond as Oats, making your response feel personalized while avoiding any special formatting characters:`;
};