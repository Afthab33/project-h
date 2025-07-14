import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { FcGoogle } from 'react-icons/fc';
import { BsFacebook } from 'react-icons/bs';
import { ChevronLeft } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const LoginPage = ({ onLoginSuccess, onRedirectToSignup, onBackToLanding }) => {
  const { signInWithGoogle, signInWithFacebook, signInWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuthentication = async (authMethod, authParams = []) => {
    try {
      setLoading(true);
      setError('');

      const result = await authMethod(...authParams);
      
      if (result && (result.user || result.success)) {
        onLoginSuccess();
        return;
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError(error.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  // Email login handler
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    handleAuthentication(signInWithEmail, [email, password]);
  };

  // Handlers for social logins
  const handleGoogleLogin = () => {
    handleAuthentication(signInWithGoogle);
  };

  const handleFacebookLogin = () => {
    handleAuthentication(signInWithFacebook);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center px-4 py-8 sm:py-12 relative">
      {/* Background circles - optimized positions for both mobile and desktop */}
      <div className="absolute top-10 sm:top-20 -right-20 sm:-right-12 w-40 sm:w-64 h-40 sm:h-64 bg-[#e72208]/10 rounded-full opacity-60"></div>
      <div className="absolute bottom-5 sm:bottom-10 -left-32 sm:-left-20 w-60 sm:w-80 h-60 sm:h-80 bg-[#3E7B27]/10 rounded-full opacity-60"></div>
      <div className="absolute -bottom-32 sm:-bottom-20 left-1/4 w-40 sm:w-56 h-40 sm:h-56 bg-[#4D55CC]/10 rounded-full opacity-60"></div>
      
      <div className="w-full max-w-md z-10">
        {/* Back button - improved for touch */}
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors py-1"
            aria-label="Back to landing page"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="text-sm sm:text-base">Back to home</span>
          </button>
        )}
        
        <Card className="shadow-xl border-gray-100 overflow-hidden">
          <CardHeader className="text-center pb-3 pt-5 sm:pt-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 text-sm sm:text-base">Sign in to continue to your dashboard</p>
          </CardHeader>
          
          <CardContent className="pb-3 sm:pb-4 px-4 sm:px-6">
            {error && (
              <Alert 
                variant={error.includes("complete your profile") || error.includes("No account exists") ? "default" : "destructive"} 
                className={`mb-4 sm:mb-6 ${error.includes("complete your profile") || error.includes("No account exists") ? "border-[#3E7B27]/20 bg-[#3E7B27]/5" : ""}`}
              >
                <AlertCircle className={`h-4 w-4 ${error.includes("complete your profile") || error.includes("No account exists") ? "text-[#3E7B27]" : ""}`} />
                <AlertTitle className="font-medium text-sm sm:text-base">
                  {error.includes("complete your profile") ? "Profile Setup Needed" : 
                   error.includes("No account exists") ? "Account Not Found" : "Error"}
                </AlertTitle>
                <AlertDescription className="text-xs sm:text-sm">
                  {error}
                  {(error.includes("complete your profile") || error.includes("No account exists")) && (
                    <Button 
                      onClick={onRedirectToSignup} 
                      variant="outline"
                      className="mt-2 sm:mt-3 w-full border-[#3E7B27]/30 text-[#3E7B27] hover:bg-[#3E7B27]/10 font-medium text-xs sm:text-sm py-1.5 sm:py-2"
                    >
                      Get Started
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleEmailSubmit} className="mb-4 sm:mb-6 space-y-4 sm:space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-2 sm:p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3E7B27]/30 focus:border-[#3E7B27] transition-all outline-none text-sm sm:text-base"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <a href="#" className="text-xs text-[#3E7B27] hover:underline">
                    Forgot password?
                  </a>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-2 sm:p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3E7B27]/30 focus:border-[#3E7B27] transition-all outline-none text-sm sm:text-base"
                  placeholder="••••••••"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full py-2 sm:py-2.5 bg-[#3E7B27] hover:bg-[#346A21] text-white font-medium rounded-lg transition-all text-sm sm:text-base"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            
            <div className="relative my-4 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            {/* Social Login Buttons*/}
            <div className="space-y-3 sm:space-y-4">
              {/* Google Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex items-center justify-center w-full py-2.5 sm:py-3 px-4 rounded-lg shadow-sm transition-all duration-300 relative overflow-hidden bg-gradient-to-r from-[#e72208]/5 via-[#3E7B27]/5 to-[#4D55CC]/5 hover:from-[#e72208]/10 hover:via-[#3E7B27]/10 hover:to-[#4D55CC]/10 border border-gray-200 hover:border-gray-300 hover:shadow-md"
              >
                <div className="flex items-center justify-center">
                  {/* Google icon */}
                  <div className="bg-white p-1 rounded-full shadow-sm mr-2 sm:mr-3">
                    <FcGoogle className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  
                  {/* Button text */}
                  <span className="font-medium text-gray-800 text-sm sm:text-base">
                    Sign in with Google
                  </span>
                </div>
              </button>
              
              {/* Facebook Button */}
              <button
                onClick={handleFacebookLogin}
                disabled={loading}
                className="flex items-center justify-center w-full py-2.5 sm:py-3 px-4 rounded-lg shadow-sm transition-all duration-300 relative overflow-hidden bg-[#1877F2]/5 hover:bg-[#1877F2]/10 border border-gray-200 hover:border-gray-300 hover:shadow-md"
              >
                <div className="flex items-center justify-center">
                  {/* Facebook icon */}
                  <div className="bg-white p-1 rounded-full shadow-sm mr-2 sm:mr-3">
                    <BsFacebook className="w-4 h-4 sm:w-5 sm:h-5 text-[#1877F2]" />
                  </div>
                  
                  {/* Button text */}
                  <span className="font-medium text-gray-800 text-sm sm:text-base">
                    Sign in with Facebook
                  </span>
                </div>
              </button>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center pt-1 sm:pt-2 pb-5 sm:pb-6 px-4 sm:px-6">
            <div className="text-xs text-gray-500 text-center mb-2 sm:mb-3">
              By signing in, you agree to our Terms and Privacy Policy
            </div>
            <div className="text-xs sm:text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <button 
                id="create-account-link"
                type="button" 
                onClick={onRedirectToSignup}
                className="text-[#3E7B27] font-medium hover:underline"
              >
                Create an account
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;