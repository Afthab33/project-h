/* Handles API calls for nutrition-related functionality */

import api from '../../../services/api';

/**
 * Fetches user's existing diet questionnaire data
 * @returns {Promise<Object>} - Response data
 */
export const getDietQuestionnaire = async () => {
  try {
    const response = await api.get('/diet/questionnaire');
    return response.data;
  } catch (error) {
    console.error('Error fetching diet questionnaire:', error);
    handleApiError(error, 'Failed to fetch diet questionnaire');
  }
};

/**
 * Submits diet questionnaire data
 * @param {Object} data - The diet questionnaire data
 * @returns {Promise<Object>} - Response data
 */
export const submitDietQuestionnaire = async (data) => {
  try {
    const response = await api.post('/diet/questionnaire', data);
    return response.data;
  } catch (error) {
    console.error('Error submitting diet questionnaire:', error);
    handleApiError(error, 'Failed to submit diet questionnaire');
  }
};

/**
 * Generates a diet plan based on user data and preferences
 * @param {Object} userData - User data and preferences
 * @returns {Promise<Object>} - The generated diet plan
 */
export const generateDietPlan = async (userData) => {
  try {
    const response = await api.post('/diet/gen', userData);
    return response.data;
  } catch (error) {
    console.error('Error generating diet plan:', error);
    handleApiError(error, 'Failed to generate diet plan');
  }
};

/**
 * Retrieves the user's diet plan
 * @returns {Promise<Object>} - The user's diet plan
 */
export const getDietPlan = async () => {
  try {
    const response = await api.get('/diet/plan');
    return response.data;
  } catch (error) {
    console.error('Error fetching diet plan:', error);
    handleApiError(error, 'Failed to fetch diet plan');
  }
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

export default {
  getDietQuestionnaire,
  submitDietQuestionnaire,
  generateDietPlan,
  getDietPlan
};