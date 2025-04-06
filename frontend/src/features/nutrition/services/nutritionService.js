/* Handles API calls for nutrition-related functionality */

import axios from 'axios';

const API_URL = 'http://localhost:3000';

/**
 * Fetches user's existing diet questionnaire data
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Response data
 */
export const getDietQuestionnaire = async (token) => {
  try {
    
    
    // Note: You may need to create this endpoint on the backend if it doesn't exist
    const response = await axios.get(`${API_URL}/diet/questionnaire`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    
    return response.data;
  } catch (error) {
    console.error('Error fetching diet questionnaire:', error);
    handleApiError(error, 'Failed to fetch diet questionnaire');
  }
};

/**
 * Submits diet questionnaire data
 * @param {Object} data - The diet questionnaire data
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Response data
 */
export const submitDietQuestionnaire = async (data, token) => {
  try {
    
    
    const response = await axios.post(`${API_URL}/diet/questionnaire`, data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    
    return response.data;
  } catch (error) {
    console.error('Error submitting diet questionnaire:', error);
    handleApiError(error, 'Failed to submit diet questionnaire');
  }
};

/**
 * Generates a diet plan based on user data and preferences
 * @param {Object} userData - User data and preferences
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - The generated diet plan
 */
export const generateDietPlan = async (userData, token) => {
  try {
    
    
    const response = await axios.post(`${API_URL}/diet/gen`, userData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    
    return response.data;
  } catch (error) {
    console.error('Error generating diet plan:', error);
    handleApiError(error, 'Failed to generate diet plan');
  }
};

/**
 * Retrieves the user's diet plan
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - The user's diet plan
 */
export const getDietPlan = async (token) => {
  try {
    
    
    const response = await axios.get(`${API_URL}/diet/plan`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    
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