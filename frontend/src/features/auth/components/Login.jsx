import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ChevronLeft } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { BsFacebook } from 'react-icons/bs';
import EmailSignUpForm from './EmailSignUpForm';
import { useAuth } from '../../../contexts/AuthContext';

const Login = ({ onLoginSuccess, formData, onBackToLanding, onSwitchToLogin }) => {
  const { signInWithGoogle, signInWithFacebook, submitOnboardingData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Unified handler for third-party auth methods
  const handleThirdPartySignIn = async (signInMethod, providerName) => {
    try {
      setLoading(true);
      setError('');
      
      
      
      // Call the authentication method (Google or Facebook)
      const result = await signInMethod();
      
      
      
      // Proceed to dashboard - let AppFlow handle pendingSubmission
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center px-4 py-12 relative">
      {/* Background circles */}
      <div className="absolute top-20 -right-12 w-64 h-64 bg-[#e72208]/10 rounded-full opacity-60"></div>
      <div className="absolute bottom-10 -left-20 w-80 h-80 bg-[#3E7B27]/10 rounded-full opacity-60"></div>
      <div className="absolute -bottom-20 left-1/4 w-56 h-56 bg-[#4D55CC]/10 rounded-full opacity-60"></div>
      
      <div className="w-full max-w-md z-10">
        {/* Back button */}
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span>Back to home</span>
          </button>
        )}
        
        <Card className="shadow-xl border-gray-100">
          <CardHeader className="text-center pb-3">
            <h2 className="text-2xl font-bold text-gray-800">Create Your Account</h2>
            <p className="text-gray-500">Complete your registration to access your personalized dashboard</p>
          </CardHeader>
          
          <CardContent className="pb-4">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <EmailSignUpForm 
              onSignUpSuccess={onLoginSuccess}
              loading={loading}
              setLoading={setLoading}
              setError={setError}
              formData={formData}
            />
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            {/* Social Login Buttons - with more modern styling from your old design */}
            <div className="space-y-4">
              {/* Google Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex items-center justify-center w-full py-3 px-4 rounded-lg shadow-sm transition-all duration-300 relative overflow-hidden bg-gradient-to-r from-[#e72208]/5 via-[#3E7B27]/5 to-[#4D55CC]/5 hover:from-[#e72208]/10 hover:via-[#3E7B27]/10 hover:to-[#4D55CC]/10 border border-gray-200 hover:border-gray-300 hover:shadow-md"
              >
                <div className="flex items-center justify-center">
                  {/* Google icon */}
                  <div className="bg-white p-1 rounded-full shadow-sm mr-3">
                    <FcGoogle className="w-5 h-5" />
                  </div>
                  
                  {/* Button text */}
                  <span className="font-medium text-gray-800">
                    Continue with Google
                  </span>
                </div>
              </button>
              
              {/* Facebook Button */}
              <button
                onClick={handleFacebookSignIn}
                disabled={loading}
                className="flex items-center justify-center w-full py-3 px-4 rounded-lg shadow-sm transition-all duration-300 relative overflow-hidden bg-[#1877F2]/5 hover:bg-[#1877F2]/10 border border-gray-200 hover:border-gray-300 hover:shadow-md"
              >
                <div className="flex items-center justify-center">
                  {/* Facebook icon */}
                  <div className="bg-white p-1 rounded-full shadow-sm mr-3">
                    <BsFacebook className="w-5 h-5 text-[#1877F2]" />
                  </div>
                  
                  {/* Button text */}
                  <span className="font-medium text-gray-800">
                    Continue with Facebook
                  </span>
                </div>
              </button>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center pt-2 pb-6">
            <div className="text-xs text-gray-500 text-center mb-3">
              By signing up, you agree to our Terms and Privacy Policy
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <button 
                onClick={onSwitchToLogin}
                className="text-[#3E7B27] font-medium hover:underline"
              >
                Sign in here
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;