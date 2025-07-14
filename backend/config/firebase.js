import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Export Firestore database
const db = admin.firestore();

// Export FieldValue for timestamps and array operations
const FieldValue = admin.firestore.FieldValue;

// For token verification and auth provider detection
const verifyToken = async (token) => {
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error("Token verification failed:", error);
        throw error;
    }
};

// Get user auth provider information
const getUserAuthProviderInfo = async (uid) => {
    try {
        const userRecord = await admin.auth().getUser(uid);
        const providers = userRecord.providerData.map(provider => provider.providerId);
        return {
            providerId: providers[0] || 'unknown',
            providers: providers,
            email: userRecord.email,
            emailVerified: userRecord.emailVerified
        };
    } catch (error) {
        console.error("Error getting user auth info:", error);
        throw error;
    }
};

// Export Firebase Admin and Firestore
export { admin as firebaseAdmin, db, FieldValue, verifyToken, getUserAuthProviderInfo };

// Add default export
export default { firebaseAdmin: admin, db, FieldValue, verifyToken, getUserAuthProviderInfo };
