import { firebaseAdmin, verifyToken } from '../config/firebase.js';

const authenticateUser = async (req, res, next) => {
    try {
        // Get the auth header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Unauthorized: No valid authorization header" });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: Token not provided" });
        }

        try {
            // Verify token using our enhanced method
            const decodedToken = await verifyToken(token);

            // Add the decoded token to the request object
            req.user = decodedToken;
            
            // Add auth provider information to the request
            if (decodedToken.firebase && decodedToken.firebase.sign_in_provider) {
                req.authProvider = decodedToken.firebase.sign_in_provider;
            } else {
                // Default to anonymous if provider not specified
                req.authProvider = 'anonymous';
            }
            next();
        } catch (verifyError) {
            console.error("Token verification failed:", verifyError);

            // Provide more detailed error information in development
            if (process.env.NODE_ENV !== 'production') {
                return res.status(401).json({
                    message: "Unauthorized: Invalid token",
                    error: verifyError.message,
                    code: verifyError.code
                });
            }

            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
    } catch (error) {
        console.error("Authentication middleware error:", error);
        return res.status(500).json({ message: "Authentication error", error: error.message });
    }
};

export default authenticateUser;
