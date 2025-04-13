import express from 'express';
import { OpenAI } from 'openai';
import authenticateUser from '../middleware/authenticateUser.js';
import { db } from '../config/firebase.js';
import admin from 'firebase-admin';

const router = express.Router();
const FieldValue = admin.firestore.FieldValue;

// Initialize OpenAI client with error checking
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Check OpenAI API key


// Basic coach prompt function
const generateCoachPrompt = (userData, messages, message) => {
  // Extract key user data with safe defaults
  const name = userData?.displayName || 'User';
  const primaryGoal = userData?.primaryGoal || 'general health';
  const age = userData?.age || 'unknown';
  const bmiCategory = userData?.healthMetrics?.bmiCategory || 'unknown';
  const height = userData?.height || 'unknown';
  const weight = userData?.weight || 'unknown';
  const healthConditions = Array.isArray(userData?.healthConditions) 
    ? userData.healthConditions.join(', ') 
    : 'none reported';
  const calorieTarget = userData?.healthMetrics?.calorieTarget || 'unknown';
  
  // Create a simple prompt format
  return `
You are an AI health and fitness coach assisting a user in achieving their health goals.

## USER PROFILE:
- Name: ${name}
- Primary fitness goal: ${primaryGoal}
- Age: ${age}
- Height: ${height}
- Weight: ${weight}
- BMI category: ${bmiCategory}
- Health conditions: ${healthConditions}
- Daily calorie target: ${calorieTarget} calories

## CURRENT USER MESSAGE:
User: ${message}

Respond as a supportive and knowledgeable health coach with practical advice.`;
};

// Get chat history endpoint
router.get('/history', authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    
    // Fetch chat history from Firestore
    const chatDoc = await db.collection('coach_chats').doc(uid).get();
    
    if (!chatDoc.exists) {
      return res.status(200).json({ 
        messages: [] 
      });
    }
    
    return res.status(200).json({
      messages: chatDoc.data().messages || []
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch chat history' 
    });
  }
});

// Send chat message endpoint
router.post('/chat', authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { message, userData, healthMetrics } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }
    
    // Fetch user's onboarding data for context
    const onboardingDoc = await db.collection('onboarding_data').doc(uid).get();
    const userDataFromDb = onboardingDoc.exists ? onboardingDoc.data() : {};
    
    // Fetch workout plan if available
    const workoutPlanDoc = await db.collection('workout_plans').doc(uid).get();
    const workoutPlan = workoutPlanDoc.exists ? workoutPlanDoc.data() : {};
    
    // Fetch diet plan if available
    const dietPlanDoc = await db.collection('diet_plans').doc(uid).get();
    const dietPlan = dietPlanDoc.exists ? dietPlanDoc.data() : {};
    
    // Fetch workout questionnaire
    const workoutQDoc = await db.collection('workout_questionnaire').doc(uid).get();
    const workoutQData = workoutQDoc.exists ? workoutQDoc.data() : {};
    
    // Fetch diet questionnaire
    const dietQDoc = await db.collection('diet_questionnaire').doc(uid).get();
    const dietQData = dietQDoc.exists ? dietQDoc.data() : {};
    
    // Fetch existing chat history
    const chatHistoryDoc = await db.collection('coach_chats').doc(uid).get(); // Changed variable name here
    const chatHistory = chatHistoryDoc.exists ? chatHistoryDoc.data().messages || [] : []; // Changed reference here
    
    // Keep only last 10 messages for context window efficiency
    const recentMessages = chatHistory.slice(-10);
    
    // Generate prompt with comprehensive user context
    const combinedUserData = {
      ...userDataFromDb,
      ...userData,
      ...workoutQData,
      ...dietQData,
      healthMetrics: healthMetrics || {},
      workout_plan: workoutPlan.plan || workoutPlan.workout_plan,
      meal_plan: dietPlan.plan || dietPlan.meal_plan
    };
    
    const prompt = generateCoachPrompt(combinedUserData, recentMessages, message);
    
    // Call OpenAI API with system message explicitly including profile context
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using the full model for better personalization
      messages: [
        {
          role: "system",
          content: "You are Oats, a personalized AI health coach. Write only in plain text without any Markdown formatting symbols (no **, ##, *, -, or numbered lists). Keep responses under 150 words, focus on the user's specific metrics, and provide advice in natural conversational paragraphs."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7, // Slightly higher for more personalization while maintaining focus
      max_tokens: 250, // Allow enough tokens for personalized content
      presence_penalty: 0.3,
      frequency_penalty: 0.3
    });
    
    // Extract response
    const coachResponse = response.choices[0].message.content.trim();
    
    // Generate IDs for messages
    const userMessageId = `user-${Date.now()}`;
    const coachMessageId = `coach-${Date.now()}`;
    
    // New messages to add
    const userMessage = {
      id: userMessageId,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString() // Use ISO string instead of server timestamp for now
    };
    
    const aiMessage = {
      id: coachMessageId,
      role: 'assistant',
      content: coachResponse,
      timestamp: new Date().toISOString() // Use ISO string instead of server timestamp for now
    };
    
    
    
    // First check if the document exists
    const chatDocRef = db.collection('coach_chats').doc(uid);
    const chatDoc = await chatDocRef.get(); // This creates the second declaration of chatDoc
    
    if (!chatDoc.exists) {
      // Create the document with initial messages
      await chatDocRef.set({
        messages: [userMessage, aiMessage],
        updated_at: new Date().toISOString()
      });
    } else {
      // Update existing document
      await chatDocRef.update({
        messages: admin.firestore.FieldValue.arrayUnion(userMessage, aiMessage),
        updated_at: new Date().toISOString()
      });
    }
    
    
    
    // Return success with AI response
    return res.status(200).json({
      success: true,
      id: coachMessageId,
      message: coachResponse
    });
  } catch (error) {
    console.error('Error processing chat message:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to process your message', 
      error: error.message 
    });
  }
});

// Get AI Summary endpoint
router.post('/summary', authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { context } = req.body;
    
    // If this is for sleep context, return early since we have a dedicated endpoint
    if (context === 'sleep') {
      return res.status(200).json({
        success: true,
        summary: null
      });
    }
    
    // Rest of the existing code remains the same

    // Fetch user's onboarding data for context
    const onboardingDoc = await db.collection('onboarding_data').doc(uid).get();
    const userDataFromDb = onboardingDoc.exists ? onboardingDoc.data() : {};
    
    // Fetch workout plan if available
    const workoutPlanDoc = await db.collection('workout_plans').doc(uid).get();
    const workoutPlan = workoutPlanDoc.exists ? workoutPlanDoc.data() : {};
    
    // Fetch diet plan if available
    const dietPlanDoc = await db.collection('diet_plans').doc(uid).get();
    const dietPlan = dietPlanDoc.exists ? dietPlanDoc.data() : {};
    
    // Get user's most recent data from the request
    const { userData, healthMetrics } = req.body;
    
    // Check for sleep data
    const hasSleepData = userData?.sleepInsights && 
                          userData.sleepInsights !== "No sleep data available.";
    
    // Combine all the data
    const combinedUserData = {
      ...userDataFromDb,
      ...userData,
      healthMetrics: healthMetrics || {},
      workout_plan: workoutPlan.plan || workoutPlan.workout_plan,
      meal_plan: dietPlan.plan || dietPlan.meal_plan
    };
    
    // Create a prompt for the summary based on context
    let prompt = `Generate a brief, personalized health summary for a user with the following profile:\n\n`;
    prompt += `Name: ${combinedUserData.displayName || 'User'}\n`;
    prompt += `BMI: ${healthMetrics?.bmi || 'unknown'} (${healthMetrics?.bmiCategory || 'unknown'})\n`;
    prompt += `Primary Goal: ${combinedUserData.primaryGoal || 'general health'}\n`;
    prompt += `Height: ${combinedUserData.height || 'unknown'}\n`;
    prompt += `Weight: ${combinedUserData.weight || 'unknown'}\n`;
    prompt += `Calorie Target: ${healthMetrics?.calorieTarget || 'unknown'}\n\n`;
    
    // Add sleep data if available
    if (hasSleepData) {
      prompt += `IMPORTANT - Sleep Data: ${userData.sleepInsights}\n\n`;
    }
    
    // Add context-specific instructions
    if (context === 'nutrition') {
      prompt += `Focus on their nutrition needs and dietary recommendations for their ${healthMetrics?.bmiCategory || 'current'} BMI and ${combinedUserData.primaryGoal || 'health'} goals.`;
      if (hasSleepData) {
        prompt += ` Also consider how their sleep patterns might impact nutrition needs.`;
      }
    } else if (context === 'fitness') {
      prompt += `Focus on their fitness needs and exercise recommendations for their ${healthMetrics?.bmiCategory || 'current'} BMI and ${combinedUserData.primaryGoal || 'health'} goals.`;
      if (hasSleepData) {
        prompt += ` Consider how their sleep quality might impact recovery and workout performance.`;
      }
    } else {
      prompt += `Provide a general health overview and recommendations based on their current metrics and goals.`;
      if (hasSleepData) {
        prompt += ` Include a brief mention of their sleep quality if relevant.`;
      }
    }
    
    prompt += `\n\nKeep the summary brief (3-4 sentences), personalized, and actionable. Start with "Hi [name]!" and include one emoji for a friendly touch.`;
    
    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Or your preferred model
      messages: [
        {
          role: "system",
          content: "You are a helpful AI health coach that provides personalized summaries based on user health data. Be friendly and motivational but focus on specific data points from the user's profile."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });
    
    const summary = response.choices[0].message.content.trim();
    
    return res.status(200).json({
      success: true,
      summary
    });
    
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate summary',
      error: error.message
    });
  }
});

// Add this new route after your existing routes
// This is specifically designed for sleep data analysis

router.post('/analyze-sleep', authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { sleepData, sleepInsights } = req.body;
    
    if (!sleepData || !sleepInsights) {
      return res.status(400).json({
        success: false,
        message: 'Sleep data and insights are required'
      });
    }
    
    // Fetch user's name for personalization
    const userDoc = await db.collection('onboarding_data').doc(uid).get();
    const userName = userDoc.exists ? userDoc.data().displayName || 'User' : 'User';
    
    // Calculate date range
    const dates = sleepData.map(d => new Date(d.date)).sort((a, b) => a - b);
    const startDate = dates[0];
    const endDate = dates[dates.length - 1];
    const dayCount = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    // Format the insights for the AI
    const formattedInsights = {
      averageSleepDuration: sleepInsights.averageSleepDuration,
      averageSleepDurationFormatted: sleepInsights.averageSleepDuration ? 
        `${Math.floor(sleepInsights.averageSleepDuration)} hours and ${Math.round((sleepInsights.averageSleepDuration % 1) * 60)} minutes` : 
        'unknown',
      deepSleepPercentage: Math.round(sleepInsights.deepSleepPercentage),
      remSleepPercentage: Math.round(sleepInsights.remSleepPercentage),
      sleepQualityScore: sleepInsights.sleepQualityScore,
      sleepConsistency: sleepInsights.sleepConsistency,
      dataPoints: sleepData.length,
      dateRange: `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      dayCount: dayCount
    };
    
    // Create specialized prompt for sleep analysis
    const prompt = `
      You are a sleep expert analyzing sleep data for ${userName}. Based on ${dayCount} days of sleep data from ${formattedInsights.dateRange}, analyze the following sleep metrics:
      
      - Average sleep duration: ${formattedInsights.averageSleepDurationFormatted}
      - Deep sleep percentage: ${formattedInsights.deepSleepPercentage}% (healthy range is 15-25%)
      - REM sleep percentage: ${formattedInsights.remSleepPercentage}% (healthy range is 20-25%)
      - Sleep quality score: ${formattedInsights.sleepQualityScore}/100
      - Sleep consistency score: ${formattedInsights.sleepConsistency}/10
      
      Provide a personalized sleep report formatted as follows:
      
      1. First paragraph: Comprehensive overview of sleep quality, duration, and main issues identified.
      
      2. Second paragraph: Specific analysis of sleep composition (deep sleep, REM sleep) and sleep consistency, with clear explanations of how these metrics impact overall health and wellbeing.
      
      3. Final paragraph: 2-3 specific, actionable recommendations tailored to their exact sleep metrics. Be specific and practical.
      
      DO NOT start with "Hi [name]!" or include any greeting.
      DO NOT mention that you're an AI or analyzing data.
      Write in a professional, clear, and accessible tone.
      Be direct and specific with recommendations based on the actual metrics provided.
      If sleep quality score is below 65, emphasize the health impacts of poor sleep.
    `;
    
    // Call OpenAI with specialized prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using the full model for better analysis
      messages: [
        {
          role: "system",
          content: "You are a sleep science expert who analyzes sleep data and provides concise, personalized insights and recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });
    
    const analysis = response.choices[0].message.content.trim();
    
    // Determine sleep quality category based on score
    let qualityCategory = "fair";
    if (formattedInsights.sleepQualityScore >= 85) {
      qualityCategory = "excellent";
    } else if (formattedInsights.sleepQualityScore >= 70) {
      qualityCategory = "good";
    } else if (formattedInsights.sleepQualityScore < 50) {
      qualityCategory = "poor";
    }
    
    return res.status(200).json({
      success: true,
      analysis: {
        summary: analysis,
        qualityCategory: qualityCategory,
        sleepScore: formattedInsights.sleepQualityScore,
        dayCount: formattedInsights.dayCount
      }
    });
    
  } catch (error) {
    console.error('Error analyzing sleep data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze sleep data',
      error: error.message
    });
  }
});

export default router;