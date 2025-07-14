import express from "express";
import { db, getUserAuthProviderInfo } from "../config/firebase.js";
import authenticateUser from "../middleware/authenticateUser.js";

const router = express.Router();

// Universal User Signup/Login (handles all providers)
router.post("/signup", async (req, res) => {
    try {
        const { uid, email, name, photoURL } = req.body;
        const provider = req.body.provider || "google.com";

        if (!uid) {
            return res.status(400).json({ message: "Missing user ID" });
        }

        const userRef = db.collection("users").doc(uid);
        const userDoc = await userRef.get();

        const authInfo = await getUserAuthProviderInfo(uid);

        const userData = {
            uid,
            email,
            name: name || email.split('@')[0],
            photoURL: photoURL || null,
            authProvider: authInfo.providerId,
            providers: authInfo.providers,
            emailVerified: authInfo.emailVerified,
            lastLogin: new Date()
        };

        if (!userDoc.exists) {
            userData.createdAt = new Date();
            await userRef.set(userData);
            
            res.status(201).json({ 
                message: "User created successfully",
                isNewUser: true,
                providerId: authInfo.providerId
            });
        } else {
            // Existing user - update relevant fields
            await userRef.update({
                ...userData,
                updatedAt: new Date()
            });
            
            res.status(200).json({ 
                message: "User authenticated successfully",
                isNewUser: false,
                providerId: authInfo.providerId
            });
        }
    } catch (error) {
        console.error("Error in signup:", error);
        res.status(500).json({ message: "Error processing authentication", error: error.message });
    }
});

// Fetch User Info (same for all providers)
router.get("/user", authenticateUser, async (req, res) => {
    try {
        // Get uid from the decoded token
        const uid = req.user.uid;
        
        if (!uid) {
            return res.status(400).json({ message: "Missing user ID" });
        }
        
        
        
        
        // Find user in database
        const userRef = db.collection("users").doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            
            return res.status(404).json({ message: "User not found" });
        }

        // Get provider information from Firebase Auth
        const authInfo = await getUserAuthProviderInfo(uid);

        // Return user data with auth provider information
        return res.status(200).json({
            ...userDoc.data(),
            authProvider: authInfo.providerId,
            providers: authInfo.providers,
            emailVerified: authInfo.emailVerified
        });
    } catch (error) {
        console.error("Error in /auth/user route:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Add a route to verify credentials (useful when adding a new auth provider to existing account)
router.post("/link-provider", authenticateUser, async (req, res) => {
    try {
        const { uid } = req.user;
        const { provider } = req.body;
        
        if (!uid || !provider) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        
        // Get current user info
        const userRecord = await getUserAuthProviderInfo(uid);
        
        // Check if provider is already linked
        if (userRecord.providers.includes(provider)) {
            return res.status(200).json({ 
                message: "Provider already linked",
                providers: userRecord.providers
            });
        }
        
        // Note: The actual linking happens on the frontend with Firebase Auth SDK
        // Here we just update our database to reflect this
        
        const userRef = db.collection("users").doc(uid);
        await userRef.update({
            providers: [...userRecord.providers, provider],
            updatedAt: new Date()
        });
        
        return res.status(200).json({ 
            message: "Provider link recorded successfully",
            providers: [...userRecord.providers, provider]
        });
    } catch (error) {
        console.error("Error in link-provider:", error);
        return res.status(500).json({ message: "Error linking provider", error: error.message });
    }
});

// Handle email verification
router.post("/verify-email", authenticateUser, async (req, res) => {
    try {
        const { uid } = req.user;
        
        // Get user info
        const userRecord = await getUserAuthProviderInfo(uid);
        
        if (userRecord.emailVerified) {
            return res.status(200).json({ 
                message: "Email already verified",
                emailVerified: true
            });
        }
        
        // For security, we should check if this request is coming from a verified session
        // This is just recording the verification status in our database
        // The actual verification happens through Firebase Auth
        
        const userRef = db.collection("users").doc(uid);
        await userRef.update({
            emailVerified: true,
            updatedAt: new Date()
        });
        
        return res.status(200).json({
            message: "Email verification status updated",
            emailVerified: true
        });
    } catch (error) {
        console.error("Error in verify-email:", error);
        return res.status(500).json({ message: "Error verifying email", error: error.message });
    }
});

// Request password reset
router.post("/request-password-reset", async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        
        // Check if user exists
        const usersRef = db.collection("users");
        const snapshot = await usersRef.where("email", "==", email).limit(1).get();
        
        if (snapshot.empty) {
            // For security reasons, don't reveal if the email exists or not
            return res.status(200).json({ message: "If your email is registered, you will receive a password reset link" });
        }
        
        // Note: The actual password reset email is sent by Firebase Auth from the frontend
        // This endpoint is just for tracking/logging purposes
        
        // Log the password reset request
        await db.collection("password_resets").add({
            email,
            requestedAt: new Date(),
            status: "requested"
        });
        
        return res.status(200).json({ message: "If your email is registered, you will receive a password reset link" });
    } catch (error) {
        console.error("Error in request-password-reset:", error);
        // Still return 200 for security
        return res.status(200).json({ message: "If your email is registered, you will receive a password reset link" });
    }
});

// Handle data deletion requests
router.post("/delete-account", authenticateUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    
    if (!uid) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    // Create a deletion request record
    await db.collection("deletion_requests").add({
      uid: uid,
      requestedAt: new Date(),
      status: "pending"
    });
    
    // Start deletion process (you can implement this as a background job)
    // 1. Delete user data from Firestore
    const batch = db.batch();
    
    // User profile
    const userRef = db.collection("users").doc(uid);
    batch.delete(userRef);
    
    // User questionnaire
    const questionnaireRef = db.collection("user_questionnaire").doc(uid);
    batch.delete(questionnaireRef);
    
    // Diet questionnaire
    const dietRef = db.collection("diet_questionnaire").doc(uid);
    batch.delete(dietRef);
    
    // Diet plans
    const dietPlanRef = db.collection("diet_plans").doc(uid);
    batch.delete(dietPlanRef);
    
    // Workout questionnaire
    const workoutRef = db.collection("workout_questionnaire").doc(uid);
    batch.delete(workoutRef);
    
    // Workout plans
    const workoutPlanRef = db.collection("workout_plans").doc(uid);
    batch.delete(workoutPlanRef);
    
    // Execute the batch delete
    await batch.commit();
    
    // 2. Delete user from Firebase Auth (optional - can be dangerous)
    // Uncomment if you want to actually delete the authentication record
    // await admin.auth().deleteUser(uid);
    
    return res.status(200).json({ 
      message: "Account deletion initiated successfully. All data will be removed within 30 days.",
      deletionRequestId: uid
    });
  } catch (error) {
    console.error("Error in account deletion:", error);
    return res.status(500).json({ message: "Error processing deletion request", error: error.message });
  }
});

export default router;
