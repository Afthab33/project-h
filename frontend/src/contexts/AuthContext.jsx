import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider, firebaseApp } from '../config/firebase';
import api from '@/services/api'; // Import the API service
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [onboardingData, setOnboardingData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to get token (still needed for some direct interactions)
  async function getToken(forceRefresh = false) {
    if (!currentUser) {
      return null;
    }
    try {
      const token = await currentUser.getIdToken(forceRefresh);
      return token;
    } catch (error) {
      console.error("❌ Error getting token:", error);
      return null;
    }
  }

  // Sign in with Google and register with backend
  async function signInWithGoogle() {
    try {
      const provider = googleProvider;
      const result = await signInWithPopup(auth, provider);
      
      // Register with backend - using API service
      // The token will be added by the interceptor
      const backendResponse = await api.post('/auth/signup', {
        email: result.user.email,
        name: result.user.displayName,
        photoURL: result.user.photoURL,
        uid: result.user.uid
      });
      
      return { user: result.user };
    } catch (error) {
      console.error("❌ Authentication error:", error);
      console.error("❌ Error details:", error.code, error.message);
      throw error;
    }
  }

  // Sign up with email and password
  const signUpWithEmail = async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Register with backend using API service
      // The token will be added by the interceptor
      const backendResponse = await api.post('/auth/signup', {
        email: result.user.email,
        name: result.user.email.split('@')[0], // Use email prefix as name
        photoURL: null,
        uid: result.user.uid,
        provider: 'password' // Indicate this is password-based auth
      });
      
      return result;
    } catch (error) {
      console.error("Error signing up with email:", error);
      throw error;
    }
  };

  // Sign in with email and password (unchanged)
  const signInWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setCurrentUser(result.user);
      return result;
    } catch (error) {
      console.error("❌ Error signing in with email:", error);
      
      // Handle specific Firebase error codes with user-friendly messages
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        throw new Error("No account exists with this email. Please create an account first.");
      } else if (error.code === 'auth/wrong-password') {
        throw new Error("Incorrect password. Please try again or reset your password.");
      } else if (error.code === 'auth/invalid-email') {
        throw new Error("Invalid email format. Please check your email address.");
      } else if (error.code === 'auth/user-disabled') {
        throw new Error("This account has been disabled. Please contact support.");
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error("Too many failed login attempts. Please try again later or reset your password.");
      } else {
        // For any other errors, return a generic message
        throw new Error("Failed to sign in. Please check your credentials and try again.");
      }
    }
  };

  // Sign in with Facebook
  const signInWithFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      
      // Register with backend using API service
      // The token will be added by the interceptor
      const backendResponse = await api.post('/auth/signup', {
        email: result.user.email,
        name: result.user.displayName,
        photoURL: result.user.photoURL,
        uid: result.user.uid,
        provider: 'facebook.com' // Specify the provider for the backend
      });
      
      return { user: result.user };
    } catch (error) {
      console.error("❌ Error signing in with Facebook:", error);
      throw error;
    }
  };

  // Fetch user data from backend
  async function fetchUserData() {
    try {
      if (!currentUser) {
        return null;
      }

      // Use API service without manually adding token
      const response = await api.get('/auth/user');
      setUserProfile(response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching user data:", error?.message);
      if (error.response) {
        console.error("❌ Response status:", error.response.status);
        console.error("❌ Response data:", error.response.data);
      }
      return null;
    }
  }

  // Updated fetchOnboardingData - simplified
  async function fetchOnboardingData() {
    try {
      if (!currentUser) {
        return null;
      }
      
      const response = await api.get('/onboarding');
      setOnboardingData(response.data.data);
      return response.data.data;
    } catch (error) {
      // Don't treat 404 as an error for new users
      if (error.response && error.response.status === 404) {
        return null;
      }
      
      console.error("❌ Error fetching onboarding data:", error?.message);
      if (error.response) {
        console.error("❌ Response status:", error.response.status);
        console.error("❌ Response data:", error.response.data);
      }
      throw error;
    }
  }

  // Simplified submitOnboardingData
  async function submitOnboardingData(data) {
    // Validate data has required fields
    if (!data || !data.dob || !data.gender || !data.height_in_cm || !data.weight_in_kg) {
      console.error("❌ AuthContext: Invalid onboarding data format:", data);
      console.error("❌ Required fields missing from onboarding data");
      throw new Error("Invalid data format - missing required fields");
    }
    
    try {
      // API service handles the token
      const response = await api.post('/onboarding', data);
      
      // Update the state with the response data
      if (response?.data?.data) {
        setOnboardingData(response.data.data);
      } else {
        setOnboardingData(data); // Fallback to the submitted data
      }
      
      return response.data.data || data;
    } catch (error) {
      console.error("❌ AuthContext: Error submitting onboarding data:", error);
      if (error.response) {
        console.error("❌ AuthContext: Response status:", error.response.status);
        console.error("❌ AuthContext: Response data:", error.response.data);
      } else if (error.request) {
        console.error("❌ AuthContext: No response received:", error.request);
      } else {
        console.error("❌ AuthContext: Error message:", error.message);
      }
      throw error;
    }
  }

  // Update onboarding data - simplified
  async function updateOnboardingData(data) {
    try {
      const response = await api.put('/onboarding', data);
      setOnboardingData(response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating onboarding data:", error?.message);
      throw error;
    }
  }

  // Check if user has onboarding data (unchanged)
  async function hasCompletedOnboarding() {
    try {
      // This will return null if no onboarding data exists
      const data = await fetchOnboardingData();
      return data !== null;
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      return false;
    }
  }

  // Sign out (unchanged)
  function logout() {
    setUserProfile(null);
    setOnboardingData(null);
    return signOut(auth);
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? `User ${user.uid}` : "No user");
      setCurrentUser(user);
      
      if (user) {
        try {
          const userProfile = await fetchUserData();
          if (userProfile) {
            await fetchOnboardingData();
          }
        } catch (error) {
          console.error("Error fetching initial data:", error);
        }
      } else {
        setUserProfile(null);
        setOnboardingData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Check auth and data status - simplified
  async function checkAuthAndDataStatus() {
    try {
      if (!currentUser) {
        return { 
          authenticated: false,
          hasProfile: false,
          hasOnboarding: false 
        };
      }
      
      let profile = userProfile;
      if (!profile) {
        profile = await fetchUserData();
      }
      
      let onboarding = onboardingData;
      if (!onboarding) {
        onboarding = await fetchOnboardingData();
      }
      
      return {
        authenticated: true,
        hasProfile: !!profile,
        hasOnboarding: !!onboarding
      };
    } catch (error) {
      console.error("❌ Error checking auth and data status:", error);
      return { 
        authenticated: !!currentUser,
        hasProfile: false,
        hasOnboarding: false,
        error: error.message
      };
    }
  }

  // Context value - keeping getToken for backward compatibility
  const value = {
    currentUser,
    userProfile,
    onboardingData,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    signInWithFacebook,
    logout,
    getToken,  // Keep for backward compatibility
    fetchUserData,
    fetchOnboardingData,
    submitOnboardingData,
    updateOnboardingData,
    hasCompletedOnboarding,
    checkAuthAndDataStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}