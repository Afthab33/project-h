import express from "express";
import { db } from "../config/firebase.js";
import authenticateUser from "../middleware/authenticateUser.js";

const router = express.Router();

// Store User Questionnaire **AFTER** Login
router.post("/", authenticateUser, async (req, res) => {
    try {
        const { uid } = req.user; // Get user ID from Firebase Auth
        const data = req.body;
        
        

        // Important change: Don't reject if document exists, update it instead
        const docRef = db.collection("user_questionnaire").doc(uid);
        const doc = await docRef.get();

        // Format data for consistency
        const formattedData = {
            dob: data.dob || data.dateOfBirth || '',
            gender: (data.gender || '').toLowerCase(),
            height_in_cm: parseInt(data.height_in_cm || data.height || '0'),
            weight_in_kg: parseInt(data.weight_in_kg || data.weight || '0'),
            primary_fitness_goal: data.primary_fitness_goal || data.primaryGoal || '',
            target_weight: parseInt(data.target_weight || data.targetWeight || '0'),
            daily_activity_level: data.daily_activity_level || data.activityLevel || '',
            exercise_availability: data.exercise_availability || data.weeklyExercise || '',
            health_conditions: Array.isArray(data.health_conditions) 
                ? data.health_conditions 
                : Array.isArray(data.healthConditions) 
                ? data.healthConditions 
                : [],
            other_medical_conditions: data.other_medical_conditions || data.otherCondition || '',
            updated_at: new Date().toISOString()
        };

        
        
        if (doc.exists) {
            
            await docRef.update(formattedData);
            
        } else {
            
            await docRef.set(formattedData);
            
        }

        res.status(200).json({ 
            success: true,
            message: "Questionnaire saved successfully",
            data: formattedData
        });
    } catch (error) {
        console.error("❌ Error storing questionnaire:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error storing questionnaire", 
            error: error.message 
        });
    }
});

// Get User Questionnaire
router.get("/", authenticateUser, async (req, res) => {
    try {
        const { uid } = req.user; // Get user ID from Firebase Auth

        // Get questionnaire document from Firestore
        const docRef = db.collection("user_questionnaire").doc(uid);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: "Questionnaire not found for this user" });
        }

        // Return questionnaire data
        res.status(200).json({
            message: "Questionnaire retrieved successfully",
            data: doc.data()
        });
    } catch (error) {
        console.error("Error retrieving questionnaire:", error);
        res.status(500).json({
            message: "Error retrieving questionnaire",
            error: error.message
        });
    }
});

// Get User Questionnaire by ID (optional - for admin or sharing purposes)
router.get("/:id", authenticateUser, async (req, res) => {
    try {
        const { uid } = req.user; // Get user ID from Firebase Auth
        const { id } = req.params; // Get requested questionnaire ID

        // Optional: Check permissions (e.g., admin users or if the requested ID matches the authenticated user)
        if (id !== uid) {
            // You could check admin privileges here if needed
            // For now, we'll just restrict access to the user's own data
            return res.status(403).json({ message: "Not authorized to access this questionnaire" });
        }

        // Get questionnaire document from Firestore
        const docRef = db.collection("user_questionnaire").doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: "Questionnaire not found" });
        }

        // Return questionnaire data
        res.status(200).json({
            message: "Questionnaire retrieved successfully",
            data: doc.data()
        });
    } catch (error) {
        console.error("Error retrieving questionnaire by ID:", error);
        res.status(500).json({
            message: "Error retrieving questionnaire",
            error: error.message
        });
    }
});

// Update User Questionnaire
router.put("/", authenticateUser, async (req, res) => {
    try {
        const { uid } = req.user; // Get user ID from Firebase Auth
        const data = req.body;

        // Get questionnaire document from Firestore
        const docRef = db.collection("user_questionnaire").doc(uid);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: "Questionnaire not found for this user" });
        }

        // Update questionnaire in Firestore
        await docRef.update(data);

        res.status(200).json({ message: "Questionnaire updated successfully" });
    } catch (error) {
        console.error("Error updating questionnaire:", error);
        res.status(500).json({
            message: "Error updating questionnaire",
            error: error.message
        });
    }
});

export default router;
