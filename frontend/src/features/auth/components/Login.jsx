import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ChevronLeft, LogIn } from 'lucide-react';
import EmailSignUpForm from './EmailSignUpForm';
import { useAuth } from '../../../contexts/AuthContext';

const Login = ({ onLoginSuccess, formData, onBackToLanding, onSwitchToLogin }) => {
  const { signInWithGoogle, signInWithFacebook } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Unified handler for third-party auth methods
  const handleThirdPartySignIn = async (signInMethod, providerName) => {
    try {
      setLoading(true);
      setError('');
      const result = await signInMethod();
      onLoginSuccess();
    } catch (err) {
      console.error(`❌ ${providerName} authentication error:`, err);
      setError(`Authentication failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Specific handlers for each provider
  const handleGoogleSignIn = () => handleThirdPartySignIn(signInWithGoogle, "Google");
  const handleFacebookSignIn = () => handleThirdPartySignIn(signInWithFacebook, "Facebook");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4 py-6 relative">
      <div className="absolute top-10 sm:top-20 -right-20 sm:-right-12 w-40 sm:w-64 h-40 sm:h-64 bg-[#e72208]/10 rounded-full opacity-60"></div>
      <div className="absolute bottom-5 sm:bottom-10 -left-32 sm:-left-20 w-60 sm:w-80 h-60 sm:h-80 bg-[#3E7B27]/10 rounded-full opacity-60"></div>
      <div className="absolute -bottom-32 sm:-bottom-20 left-1/4 w-40 sm:w-56 h-40 sm:h-56 bg-[#4D55CC]/10 rounded-full opacity-60"></div>
      
      <div className="w-full max-w-md z-10">
        {/* Back button - compact */}
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-3 p-1 rounded-md"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="text-sm">Back</span>
          </button>
        )}
        
        <Card className="shadow-lg border-gray-100">
          <CardHeader className="text-center pb-0 pt-4">
            <h2 className="text-xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Join to access your personalized dashboard</p>
          </CardHeader>
          
          {error && (
            <div className="px-4 pt-3">
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs ml-2">{error}</AlertDescription>
              </Alert>
            </div>
          )}
          
          <CardContent className="p-4 space-y-3.5">
            {/* Social login options with labels beside icons */}
            <div className="flex flex-col gap-2.5">
              {/* Google Button - inspired by LoginPage.jsx */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="py-2 px-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.7662 12.2765C23.7662 11.4608 23.6999 10.6406 23.5577 9.83765H12.2439V14.4591H18.722C18.453 15.9495 17.5888 17.2679 16.3233 18.1056V21.104H20.1902C22.4614 19.014 23.7662 15.9274 23.7662 12.2765Z" fill="#4285F4"/>
                    <path d="M12.2439 24.0008C15.4361 24.0008 18.0859 22.9382 20.1945 21.1039L16.3276 18.1055C15.2517 18.8375 13.8627 19.252 12.2482 19.252C9.1416 19.252 6.49396 17.1399 5.52175 14.3003H1.54175V17.3912C3.63693 21.4434 7.73168 24.0008 12.2439 24.0008Z" fill="#34A853"/>
                    <path d="M5.51764 14.3002C5.06276 12.8099 5.06276 11.196 5.51764 9.70569V6.61475H1.54175C-0.128428 10.0055 -0.128428 14.0004 1.54175 17.3912L5.51764 14.3002Z" fill="#FBBC05"/>
                    <path d="M12.2439 4.74966C13.9499 4.7232 15.5976 5.36697 16.8209 6.54867L20.2584 3.12128C18.1 1.0855 15.2206 -0.034466 12.2439 0.000808666C7.73168 0.000808666 3.63693 2.55822 1.54175 6.61481L5.51764 9.70575C6.48557 6.86173 9.13748 4.74966 12.2439 4.74966Z" fill="#EA4335"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-800">Continue with Google</span>
                </div>
              </button>
              
              {/* Facebook Button - inspired by LoginPage.jsx */}
              <button
                onClick={handleFacebookSignIn}
                disabled={loading}
                className="py-2 px-3 rounded-md border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#1877F2] mr-2.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-800">Continue with Facebook</span>
                </div>
              </button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">or sign up with email</span>
              </div>
            </div>
            
            {/* Email form - more compact */}
            <EmailSignUpForm 
              onSignUpSuccess={onLoginSuccess}
              loading={loading}
              setLoading={setLoading}
              setError={setError}
              formData={formData}
              compact={true} // Add a compact prop to make the form smaller
            />
          </CardContent>
          
          <CardFooter className="flex justify-between items-center py-2.5 px-4 bg-gray-50 text-xs">
            <span className="text-gray-500">
              By signing up, you agree to our <a href="#" className="underline hover:text-gray-700">Terms</a>
            </span>
            <button 
              onClick={onSwitchToLogin}
              className="text-[#3E7B27] font-medium hover:underline flex items-center"
            >
              Sign in <LogIn className="w-3 h-3 ml-1" />
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;