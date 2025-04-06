import express from "express";
import { db} from "../config/firebase.js";
import authenticateUser from "../middleware/authenticateUser.js";
import { generateWorkoutPlanPrompt, formatWorkoutPlan } from "../workoutPlanPrompt.js";
import { generatePlanDirect } from "../services/openaiService.js";
import { FieldValue } from 'firebase-admin/firestore';

const router = express.Router();

// Store Workout Questionnaire
router.post("/questionnaire", authenticateUser, async (req, res) => {
    try {
        const { uid } = req.user;
        const data = req.body;

        await db.collection("workout_questionnaire").doc(uid).set(data);

        res.status(200).json({ message: "Workout questionnaire saved" });
    } catch (error) {
        res.status(500).json({ message: "Error storing workout questionnaire", error: error.message });
    }
});

// Generate Workout Plan from Questionnaire - KEEP ONLY THIS VERSION WITH BETTER LOGGING
router.post("/gen", authenticateUser, async (req, res) => {
    try {
      const { uid } = req.user;
      
      // Get the questionnaire data
      const questionnaireRef = db.collection("workout_questionnaire").doc(uid);
      const questionnaireDoc = await questionnaireRef.get();
      
      if (!questionnaireDoc.exists) {
        return res.status(404).json({ message: "Workout questionnaire not found" });
      }
      
      const userData = questionnaireDoc.data();

      // Normalize data to ensure arrays are arrays and strings are strings
      userData.health_conditions = Array.isArray(userData.health_conditions)
        ? userData.health_conditions
        : (userData.health_conditions ? [userData.health_conditions] : []);
        
      userData.movement_restrictions = Array.isArray(userData.movement_restrictions)
        ? userData.movement_restrictions
        : (userData.movement_restrictions ? [userData.movement_restrictions] : []);

      // ADDITIONAL FIX: Also create camelCase versions since both naming conventions appear in code
      userData.healthConditions = userData.health_conditions;
      userData.movementRestrictions = userData.movement_restrictions;

      
      
      // Generate the workout plan
      try {
        const prompt = generateWorkoutPlanPrompt(userData);
        
        
        const rawPlan = await generatePlanDirect(prompt); // Use generatePlanDirect
        
        
        const formattedPlan = formatWorkoutPlan(rawPlan);
        
        
        // Store the generated plan
        await db.collection("workout_plans").doc(uid).set({
          workout_plan: formattedPlan,
          created_at: FieldValue.serverTimestamp(), // Use FieldValue directly
          user_preferences: userData
        });
        
        
        res.status(200).json({
          success: true,
          status: 200,
          message: "Workout plan generated and stored successfully",
          workout_plan: formattedPlan
        });
      } catch (innerError) {
        console.error("Inner error in plan generation:", innerError);
        throw new Error(`Plan generation failed: ${innerError.message}`);
      }
    } catch (error) {
      console.error("Error generating workout plan:", error);
      res.status(500).json({ 
        message: "Error generating workout plan", 
        error: error.message,
        stack: error.stack
      });
    }
});

router.get("/questionnaire", authenticateUser, async (req, res) => {
  try {
    const { uid } = req.user;
    
    // Fetch the user's questionnaire data
    const questionnaireRef = db.collection("workout_questionnaire").doc(uid);
    const doc = await questionnaireRef.get();
    
    if (doc.exists) {
      return res.status(200).json({
        message: "Workout questionnaire found",
        data: doc.data()
      });
    } else {
      // No questionnaire found for this user
      return res.status(404).json({
        message: "Workout questionnaire not found for this user"
      });
    }
  } catch (error) {
    console.error("Error fetching workout questionnaire:", error);
    res.status(500).json({ 
      message: "Server error fetching workout questionnaire", 
      error: error.message 
    });
  }
});

// Get Workout Plan
router.get("/plan", authenticateUser, async (req, res) => {
    try {
        const { uid } = req.user;
        const workoutRef = db.collection("workout_plans").doc(uid);
        const workoutDoc = await workoutRef.get();

        if (workoutDoc.exists) {
            return res.status(200).json(workoutDoc.data());
        }

        return res.status(404).json({
            message: "No workout plan found for this user",
            error: "Please generate a workout plan first using the /gen endpoint"
        });
    } catch (error) {
        console.error("Error fetching workout plan:", error);
        res.status(500).json({ 
            message: "Error fetching workout plan", 
            error: error.message 
        });
    }
});

export default router;
