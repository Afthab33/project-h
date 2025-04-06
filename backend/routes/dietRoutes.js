import express from "express";
import { db, FieldValue } from "../config/firebase.js";
import authenticateUser from "../middleware/authenticateUser.js";
import { generateMealPlanPrompt, formatMealPlan } from "../dietPlanPrompt.js";
import { generatePlanDirect } from "../services/openaiService.js";

const router = express.Router();

// Store Diet Questionnaire
router.post("/questionnaire", authenticateUser, async (req, res) => {
    try {
        const { uid } = req.user;
        const data = req.body;

        // Store ALL questionnaire data in Firestore
        const docRef = db.collection("diet_questionnaire").doc(uid);
        
        // Check if it already exists
        const doc = await docRef.get();
        if (doc.exists) {
            // Update existing document
            await docRef.update(data);
        } else {
            // Create new document
            await docRef.set(data);
        }

        res.status(200).json({ message: "Diet questionnaire saved", data });
    } catch (error) {
        console.error("Error storing diet questionnaire:", error);
        res.status(500).json({ message: "Error storing questionnaire", error: error.message });
    }
});

// Generate Diet Plan from Questionnaire
router.post("/gen", authenticateUser, async (req, res) => {
    try {
        const { uid } = req.user;
        
        // Get ALL the questionnaire data
        const questionnaireRef = db.collection("diet_questionnaire").doc(uid);
        const questionnaireDoc = await questionnaireRef.get();
        
        if (!questionnaireDoc.exists) {
            return res.status(404).json({ message: "Diet questionnaire not found" });
        }
        
        const fullUserData = questionnaireDoc.data();
        
        // Extract only the fields needed for diet plan generation
        const dietPlanData = {
            calories: parseInt(fullUserData.calories || 0),
            protein: parseInt(fullUserData.protein || 0),
            carbs: parseInt(fullUserData.carbs || 0),
            fats: parseInt(fullUserData.fats || 0),
            meals_per_day: parseInt(fullUserData.meals_per_day || 3),
            diet_type: fullUserData.diet_type || "non-veg",
            food_restrictions: fullUserData.food_restrictions || [],
            allergies: fullUserData.allergies || [],
            goal: fullUserData.goal || "maintenance"
        };
        
        // Generate the meal plan using only the needed fields
        const prompt = generateMealPlanPrompt(dietPlanData);
        const rawPlan = await generatePlanDirect(prompt);
        const formattedPlan = formatMealPlan(rawPlan);
        
        // Store the generated plan
        await db.collection("diet_plans").doc(uid).set({
            meal_plan: formattedPlan,
            created_at: FieldValue.serverTimestamp(),
            user_preferences: fullUserData // Store reference to full preferences
        });
        
        res.status(200).json({
            success: true,
            status: 200,
            message: "diet_plans generated and stored successfully",
            raw_plan: rawPlan,
            formatted_plan: formattedPlan
        });
    } catch (error) {
        console.error("Error generating diet plan:", error);
        res.status(500).json({ message: "Error generating diet plan", error: error.message });
    }
});

// Get Diet Questionnaire
router.get("/questionnaire", authenticateUser, async (req, res) => {
    try {
      const { uid } = req.user;
      
      // Fetch the user's questionnaire data
      const questionnaireRef = db.collection("diet_questionnaire").doc(uid);
      const doc = await questionnaireRef.get();
      
      if (doc.exists) {
        return res.status(200).json({
          message: "Diet questionnaire found",
          data: doc.data()
        });
      } else {
        // No questionnaire found for this user
        return res.status(404).json({
          message: "Diet questionnaire not found for this user"
        });
      }
    } catch (error) {
      console.error("Error fetching diet questionnaire:", error);
      res.status(500).json({ 
        message: "Server error fetching diet questionnaire", 
        error: error.message 
      });
    }
  });


// Get or Generate Diet Plan
// Get Diet Plan
router.get("/plan", authenticateUser, async (req, res) => {
    try {
        const { uid } = req.user;
        const dietRef = db.collection("diet_plans").doc(uid);
        const dietDoc = await dietRef.get();

        if (dietDoc.exists) {
            return res.status(200).json(dietDoc.data());
        }

        return res.status(404).json({
            message: "No diet plan found for this user",
            error: "Please generate a diet plan first using the /gen endpoint"
        });
    } catch (error) {
        console.error("Error fetching diet plan:", error);
        res.status(500).json({ 
            message: "Error fetching diet plan", 
            error: error.message 
        });
    }
});

export default router;
