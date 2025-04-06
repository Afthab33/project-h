import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // You'll need to install this package

const API_URL = 'http://localhost:3000';

/**
 * Sends a chat message to the AI coach
 * @param {Object} data - Message data including userData and healthMetrics
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Response from the AI coach
 */
export const sendChatMessage = async (data, token) => {
  try {
    
    
    const response = await axios.post(`${API_URL}/coach/chat`, data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    
    return response.data;
  } catch (error) {
    console.error('Error communicating with AI coach:', error);
    handleApiError(error, 'Failed to get response from coach');
  }
};

/**
 * Retrieves chat history for the user
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Chat history data
 */
export const getChatHistory = async (token) => {
  try {
    
    
    const response = await axios.get(`${API_URL}/coach/history`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    
    return response.data;
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    handleApiError(error, 'Failed to load chat history');
  }
};

/**
 * Gets a context-aware AI summary
 * @param {Object} data - User data, health metrics, and context
 * @param {string} token - Authentication token for authorized requests
 * @returns {Promise<Object>} - AI summary data
 */
export const getAISummary = async (data, token) => {
  try {
    // Skip for sleep context since we have a dedicated component
    if (data.context === 'sleep') {
      return { summary: null };
    }
    
    // Flag to determine if we should use the server API
    const useServerApi = true;
    
    if (useServerApi && token) {
      
      
      // Before sending to API, ensure numeric values are properly formatted
      const normalizedData = {
        ...data,
        userData: data.userData,
        healthMetrics: {
          ...data.healthMetrics,
          bmi: data.healthMetrics.bmi ? parseFloat(data.healthMetrics.bmi) : null,
          calorieTarget: data.healthMetrics.calorieTarget ? parseInt(data.healthMetrics.calorieTarget, 10) : null,
        },
        context: data.context
      };
      
      const response = await axios.post(`${API_URL}/coach/summary`, normalizedData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      
      return response.data;
    } else {
      // Fallback to client-side summary generation
      return generateClientSideSummary(data);
    }
  } catch (error) {
    console.error('Error getting AI summary:', error);
    return handleApiError(error, 'Failed to get AI summary');
  }
};

/**
 * Generate summaries on the client side
 * @param {Object} data - User data, health metrics, and context
 * @returns {Promise<Object>} - Generated summary
 */
const generateClientSideSummary = async (data) => {
  // Add a small delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const { userData, healthMetrics, context } = data;
  
  // Skip for sleep context since we have a dedicated component
  if (context === 'sleep') {
    return { summary: null };
  }
  
  // Extract relevant user information with fallbacks
  const firstName = userData?.displayName?.split(' ')[0] || 'there';
  
  // Proper handling of BMI value that might come as a string
  const bmiValue = healthMetrics?.bmi 
    ? parseFloat(healthMetrics.bmi) 
    : (userData?.bmi ? parseFloat(userData.bmi) : null);
  
  // Format BMI only if it's a valid number
  const bmiFormatted = !isNaN(bmiValue) && bmiValue !== null 
    ? bmiValue.toFixed(1) 
    : 'unknown';
  
  // Properly handle other metrics that might be strings
  const bmiCategory = healthMetrics?.bmiCategory || userData?.bmiCategory || 'unknown';
  const weight = userData?.weight ? parseFloat(userData.weight) : 0;
  const weightUnit = userData?.weightUnit || 'kg';
  
  // Parse calorie target which might come as a string
  const calorieTarget = healthMetrics?.calorieTarget 
    ? parseInt(healthMetrics.calorieTarget, 10) 
    : 2000;
  
  const primaryGoal = userData?.primaryGoal || 'overall health';
  
  // Convert goal to user-friendly format
  const goalMap = {
    'weight_loss': 'weight loss',
    'weight_gain': 'weight gain',
    'muscle_gain': 'muscle building',
    'muscle_tone': 'toning up',
    'overall_health': 'improving overall health'
  };
  
  const friendlyGoal = goalMap[primaryGoal] || primaryGoal;
  
  // Generate different summaries based on context/tab
  let summary = '';
  
  switch (context) {
    case 'nutrition':
      if (bmiCategory === 'Overweight' || bmiCategory === 'Obese') {
        summary = `Hi ${firstName}! Your daily target is ${calorieTarget} calories. Focus on protein-rich foods with plenty of vegetables to help with your ${friendlyGoal} goals. Based on your ${bmiCategory} BMI of ${bmiFormatted}, I recommend a moderate calorie deficit with nutrient-dense foods.`;
      } else if (bmiCategory === 'Underweight') {
        summary = `Hi ${firstName}! Your daily target is ${calorieTarget} calories. Focus on nutritious calorie-dense foods to help with your ${friendlyGoal} goals. With your current BMI of ${bmiFormatted}, adding healthy fats and protein will help you reach a healthier weight.`;
      } else {
        summary = `Hi ${firstName}! Your daily target is ${calorieTarget} calories. Your BMI of ${bmiFormatted} is in the ${bmiCategory.toLowerCase()} range. Keep up your balanced diet while focusing on your ${friendlyGoal} goals with nutrient-rich foods.`;
      }
      break;
      
    case 'fitness':
      if (bmiCategory === 'Overweight' || bmiCategory === 'Obese') {
        summary = `Hi ${firstName}! For your ${friendlyGoal} goals, I recommend a mix of cardio and strength training 3-4 times per week. At your current weight of ${weight}${weightUnit} and BMI of ${bmiFormatted}, low-impact exercises like walking, swimming, and resistance training would be most effective.`;
      } else if (bmiCategory === 'Underweight') {
        summary = `Hi ${firstName}! Based on your BMI of ${bmiFormatted}, focus on strength training with progressive overload to support your ${friendlyGoal} goals. Aim for 3-4 sessions per week with adequate nutrition to build lean muscle mass.`;
      } else {
        summary = `Hi ${firstName}! With your healthy BMI of ${bmiFormatted}, you can focus on ${friendlyGoal} with a balanced workout routine. Mix cardio, strength training, and flexibility work to maintain your health and improve fitness levels.`;
      }
      break;
    
    default: // home tab
      summary = `Welcome back, ${firstName}! Your BMI is ${bmiFormatted} (${bmiCategory.toLowerCase()}). Today, focus on hitting your ${calorieTarget} calorie target and staying active to support your ${friendlyGoal} goals. Need any specific advice today?`;
  }
  
  return { summary };
};

/**
 * Generate mock responses for testing purposes
 */
const generateMockResponse = (message, context, userData) => {
  const firstName = userData?.displayName?.split(' ')[0] || 'there';
  const lowerMessage = message.toLowerCase();
  
  // Context-specific responses
  if (context === 'nutrition') {
    if (lowerMessage.includes('meal') || lowerMessage.includes('eat') || lowerMessage.includes('food')) {
      return `Based on your ${userData.primaryGoal || 'health'} goals and current metrics, I'd recommend focusing on a balanced diet with plenty of protein and vegetables. Aim for about ${userData.healthMetrics?.calorieTarget || '2000'} calories per day split across 3-5 meals.

Here's a simple meal structure:
- Breakfast: Protein + complex carbs
- Lunch: Protein + vegetables + small portion of healthy fats
- Dinner: Protein + vegetables
- Snacks: Focus on protein or fiber-rich options

Would you like me to suggest specific meal ideas?`;
    }
  } 
  else if (context === 'fitness') {
    if (lowerMessage.includes('workout') || lowerMessage.includes('exercise') || lowerMessage.includes('training')) {
      return `Hi ${firstName}! For your ${userData.primaryGoal || 'fitness'} goals, I recommend a balanced approach of strength training and cardio. With your BMI of ${userData.bmi?.toFixed(1) || '24'}, focusing on ${userData.primaryGoal === 'weight loss' ? 'calorie-burning activities' : 'strength building exercises'} would be most effective.

A good weekly split could be:
- 3-4 days of strength training
- 2-3 days of moderate cardio
- At least 1 full rest day

Would you like a more detailed workout plan?`;
    }
  }
  
  // Generic responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi ')) {
    return `Hi ${firstName}! How can I help with your health and fitness journey today?`;
  }
  
  if (lowerMessage.includes('thank')) {
    return `You're welcome, ${firstName}! Let me know if you need anything else.`;
  }
  
  if (lowerMessage.includes('bmi') || lowerMessage.includes('weight')) {
    return `Based on your height and weight, your BMI is ${userData.bmi?.toFixed(1) || '24'} which falls in the ${userData.bmiCategory || 'normal'} range. ${userData.primaryGoal === 'weight loss' ? 'For weight loss, a sustainable approach is to aim for 0.5-1kg per week through a moderate calorie deficit and regular exercise.' : 'To maintain a healthy weight, focus on balanced nutrition and regular physical activity.'}`;
  }
  
  // Default response
  return `I understand you're asking about "${message}". As your health coach, I'm here to help with nutrition advice, workout recommendations, and general health guidance based on your personal profile. Could you clarify what specific information you're looking for about this topic?`;
};

/**
 * Common error handling function
 */
const handleApiError = (error, defaultMessage) => {
  let errorMessage = defaultMessage;
  
  if (error.response) {
    errorMessage = `Server error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
    console.error('Error details:', error.response.data);
  } else if (error.request) {
    errorMessage = 'No response from server. Please check your connection.';
  }
  
  throw new Error(errorMessage);
};

/**
 * Get AI analysis of sleep data
 * @param {Object} data - Sleep data and insights
 * @param {string} token - User auth token
 * @returns {Promise<Object>} - Analysis results
 */
export const analyzeSleepData = async (data, token) => {
  try {
    const response = await fetch(`${API_URL}/coach/analyze-sleep`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to analyze sleep data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing sleep data:', error);
    throw error;
  }
};