/* Handles API calls for workout-related functionality */

import axios from 'axios';

const API_URL = 'http://localhost:3000';

/**
 * Fetches user's existing workout questionnaire data
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Response data
 */
export const getWorkoutQuestionnaire = async (token) => {
  try {
    
    
    const response = await axios.get(`${API_URL}/workout/questionnaire`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching workout questionnaire:', error);
    handleApiError(error, 'Failed to fetch workout questionnaire');
  }
};

/**
 * Submits workout questionnaire data
 * @param {Object} data - The workout questionnaire data
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Response data
 */
export const submitWorkoutQuestionnaire = async (data, token) => {
  try {
    
    
    const response = await axios.post(`${API_URL}/workout/questionnaire`, data, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    
    return response.data;
  } catch (error) {
    console.error('❌ Error submitting workout questionnaire:', error);
    handleApiError(error, 'Failed to submit workout questionnaire');
  }
};

/**
 * Generates a workout plan based on user data and preferences
 * @param {Object} userData - User data and preferences (can be empty as backend uses stored data)
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - The generated workout plan
 */
export const generateWorkoutPlan = async (userData, token) => {
  try {
    
    
    const response = await axios.post(`${API_URL}/workout/gen`, userData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    
    return response.data;
  } catch (error) {
    console.error('❌ Error generating workout plan:', error);
    handleApiError(error, 'Failed to generate workout plan');
  }
};

/**
 * Retrieves the user's workout plan
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - The user's workout plan
 */
export const getWorkoutPlan = async (token) => {
  try {
    
    
    const response = await axios.get(`${API_URL}/workout/plan`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching workout plan:', error);
    handleApiError(error, 'Failed to fetch workout plan');
  }
};

/**
 * Maps the user's primary goal to the API's expected format
 * @param {string} goal - User's primary goal
 * @returns {string} - Mapped fitness goal for API
 */
export const mapFitnessGoal = (goal) => {
  switch (goal?.toLowerCase()) {
    case 'lose weight':
    case 'fat loss':
      return 'Fat loss and improved conditioning';
    case 'build muscle':
      return 'Increase strength and improve muscle definition';
    case 'improve fitness':
      return 'Improve overall fitness and endurance';
    case 'maintain weight':
    case 'maintain':
      return 'General fitness and maintenance';
    default:
      return 'General fitness';
  }
};

/**
 * Common error handling function
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default error message
 * @throws {Error} - Throws an error with an appropriate message
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
  getWorkoutQuestionnaire,
  submitWorkoutQuestionnaire,
  generateWorkoutPlan,
  getWorkoutPlan,
  mapFitnessGoal
};