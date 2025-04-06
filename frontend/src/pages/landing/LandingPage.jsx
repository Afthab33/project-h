import React, { useEffect, useState } from 'react';

const LandingPage = ({ onGetStarted, onLogin }) => {
  const [animate, setAnimate] = useState(false);
  const [typedText, setTypedText] = useState("");
  const fullText = "Tell me about your fitness goals...";
  
  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 300);
    
    // Typing animation effect
    if (animate) {
      let i = 0;
      const typeInterval = setInterval(() => {
        if (i < fullText.length) {
          setTypedText(fullText.substring(0, i + 1));
          i++;
        } else {
          clearInterval(typeInterval);
        }
      }, 75);
      
      return () => {
        clearInterval(typeInterval);
      };
    }
    
    return () => clearTimeout(timer);
  }, [animate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      {/* Header */}
      <header className="pt-6 px-4 md:px-10 flex justify-between items-center absolute w-full z-20">
        <div className="font-bold text-xl text-gray-800 flex items-center">
          <span className="inline-block h-3 w-3 bg-[#3E7B27] rounded-full mr-2"></span>
          Project H
        </div>
        <button 
          onClick={onLogin}
          className="px-5 py-2 bg-white/90 text-gray-700 hover:text-gray-900 font-medium border border-gray-200 rounded-md hover:shadow-sm transition-all"
        >
          Log In
        </button>
      </header>
      
      {/* Hero Section with improved visual hierarchy */}
      <div className="relative">
        {/* Improved circle positioning with better distribution */}
        <div className="absolute top-20 -right-12 w-64 h-64 bg-[#e72208]/15 rounded-full opacity-80"></div>
        <div className="absolute top-96 -left-20 w-80 h-80 bg-[#3E7B27]/15 rounded-full opacity-80"></div>
        <div className="absolute -bottom-20 left-1/4 w-56 h-56 bg-[#4D55CC]/15 rounded-full opacity-80"></div>
        <div className="absolute top-60 left-1/3 w-24 h-24 bg-[#e72208]/10 rounded-full opacity-60"></div>
        <div className="absolute bottom-10 -right-10 w-32 h-32 bg-[#3E7B27]/10 rounded-full opacity-60"></div>
        <div className="absolute top-10 right-1/4 w-20 h-20 bg-[#4D55CC]/10 rounded-full opacity-50"></div>
        
        {/* Hero Banner */}
        <section className="relative pt-28 pb-16 px-4 md:px-16 overflow-hidden">
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center">
              <div className={`inline-block mb-6 transition-all duration-700 ${
                animate ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
              }`}>
                <span className="px-6 py-2 bg-white shadow-sm rounded-full text-gray-700 font-medium text-sm border border-gray-100">
                  Health and Fitness for Everyone
                </span>
              </div>
              
              <h1 className={`text-4xl md:text-6xl font-bold mb-8 tracking-tight transition-all duration-700 ${
                animate ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
              }`}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3E7B27] to-[#2E5B1D] drop-shadow-sm">
                  Your Personal Health & Fitness Platform
                </span>
              </h1>
              
              <p className={`text-gray-600 text-lg md:text-xl mb-12 mx-auto max-w-2xl leading-relaxed transition-all duration-700 delay-100 ${
                animate ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
              }`}>
                Get personalized workout routines, nutrition plans, and health insights tailored specifically to your body and goals.
              </p>
              
              <div className={`flex flex-col sm:flex-row justify-center gap-4 transition-all duration-700 delay-200 ${
                animate ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
              }`}>
                <button 
                  onClick={onGetStarted}
                  className="bg-[#3E7B27] text-white px-10 py-4 rounded-xl text-lg font-medium hover:bg-[#346A21] hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                >
                  Start Your Journey
                </button>
                {/* Sign In option - only show on small screens since we have header login */}
                <button 
                  onClick={onLogin}
                  className="bg-white text-gray-700 border border-gray-200 px-8 py-3 rounded-xl text-lg font-medium hover:border-gray-300 hover:shadow-md transition-all duration-300 sm:hidden"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* AI Chat Feature Highlight - Updated to show mockup conversation */}
        <section className="py-10 px-4 md:px-16 relative mb-10">
  <div className="max-w-5xl mx-auto">
    <div className={`bg-white border border-gray-100 shadow-xl rounded-2xl p-6 md:p-8 transition-all duration-700 ${
      animate ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
    }`}>
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="md:w-1/2 mb-6 md:mb-0">
          <div className="flex flex-wrap items-center mb-4">
            <div className="bg-gradient-to-r from-[#4D55CC] to-[#3E7B27] p-2.5 rounded-lg mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mr-2">Meet Oats</h2>
            <div className="bg-gradient-to-r from-[#4D55CC] to-[#3E7B27] bg-clip-text text-transparent font-bold text-lg">
              Your AI Coach
            </div>
            <span className="ml-2 py-1 px-2 bg-[#4D55CC]/10 text-[#4D55CC] text-xs font-medium rounded-md">NEW</span>
          </div>
          <p className="text-gray-600 mb-6">Oats is your personal AI health & fitness coach that provides tailored advice, customized workout routines, and nutrition guidance specific to your unique body and goals.</p>
        </div>
        <div className="md:w-1/2 bg-gradient-to-br from-gray-50 to-gray-50 rounded-xl p-4 md:p-6 border border-gray-100 relative overflow-hidden">
          {/* AI Chat conversation mockup */}
          <div className="flex flex-col h-64 overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-gradient-to-r from-[#4D55CC] to-[#3E7B27] rounded-full flex items-center justify-center mr-3 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <div>
                <span className="font-semibold text-gray-800">Oats</span>
                <div className="text-xs text-gray-500">Your AI Health & Fitness Coach</div>
              </div>
            </div>
            
            {/* Chat messages - animated */}
            <div className="flex-1 space-y-3 overflow-hidden">
              {/* AI message */}
              <div className={`bg-gradient-to-r from-[#4D55CC]/10 to-[#3E7B27]/10 text-gray-700 p-3 rounded-lg rounded-tl-none max-w-[85%] transition-all duration-700 ${
                animate ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
              }`}>
                Hi there! I'm Oats, your personal health & fitness coach. How can I help you achieve your goals today?
              </div>
              
              {/* User message */}
              <div className={`bg-gray-200 text-gray-800 p-3 rounded-lg rounded-tr-none max-w-[85%] ml-auto transition-all duration-700 delay-300 ${
                animate ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
              }`}>
                I'm trying to gain muscle while maintaining my current weight. Any advice?
              </div>
              
              {/* AI response */}
              <div className={`bg-gradient-to-r from-[#4D55CC]/10 to-[#3E7B27]/10 text-gray-700 p-3 rounded-lg rounded-tl-none max-w-[85%] transition-all duration-700 delay-600 ${
                animate ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
              }`}>
                Absolutely! For muscle gain while maintaining weight, you'll need:
                <br />
                1. Progressive resistance training 3-4x weekly
                <br />
                2. Protein intake of 1.6-2.2g per kg of bodyweight
                <br />
                3. Maintenance calories with proper nutrient timing
                <br />
                Would you like a personalized plan?
              </div>
              
              {/* User response */}
              <div className={`bg-gray-200 text-gray-800 p-3 rounded-lg rounded-tr-none max-w-[85%] ml-auto transition-all duration-700 delay-900 ${
                animate ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
              }`}>
                That would be great! Can you create a split routine and suggest protein-rich meals?
              </div>
              
              {/* AI typing indicator */}
              <div className={`bg-gradient-to-r from-[#4D55CC]/10 to-[#3E7B27]/10 text-gray-700 p-3 rounded-lg rounded-tl-none max-w-[85%] transition-all duration-700 delay-1200 flex items-center space-x-2 w-20 ${
                animate ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
              }`}>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
            
            {/* Preview overlay with signup prompt */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent flex flex-col items-center justify-end pb-6">
              <button onClick={onGetStarted} className="bg-gradient-to-r from-[#4D55CC] to-[#3E7B27] text-white px-6 py-2.5 rounded-lg font-medium hover:shadow-lg transition-all flex items-center">
                Start Chatting with Oats
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
      </div>
      
      {/* Core Features Section */}
      <section className="pb-24 px-4 md:px-16 relative">
        <div className="max-w-5xl mx-auto">
          <div className={`grid md:grid-cols-3 gap-8 transition-all duration-700 delay-300 ${
            animate ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
          }`}>
            {/* Feature 1 - Fitness - Enhanced styling */}
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="h-16 w-16 bg-gradient-to-br from-[#e72208] to-[#e72208]/70 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#e72208]">Personalized Fitness</h3>
              <p className="text-gray-600">Custom workout routines designed specifically for your body type and fitness goals.</p>
            </div>
            
            {/* Feature 2 - Diet - Enhanced styling */}
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="h-16 w-16 bg-gradient-to-br from-[#3E7B27] to-[#3E7B27]/70 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#3E7B27]">Nutrition Planning</h3>
              <p className="text-gray-600">Balanced meal plans that support your health goals and fit your dietary preferences.</p>
            </div>
            
            {/* Feature 3 - Sleep - Enhanced styling */}
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="h-16 w-16 bg-gradient-to-br from-[#4D55CC] to-[#4D55CC]/70 rounded-xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#4D55CC]">Sleep Insights</h3>
              <p className="text-gray-600">Track and improve your sleep quality with personalized recommendations.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Health Dashboard Preview */}
      <section className="py-20 px-4 md:px-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Your Complete Health Dashboard</h2>
              <p className="text-gray-600 text-lg mb-8">Get a comprehensive overview of your health metrics, track your progress, and receive AI-powered recommendations to improve your wellbeing.</p>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <div className="bg-[#e72208]/20 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#e72208]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium text-lg">Personalized workout plans</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-[#3E7B27]/20 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#3E7B27]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium text-lg">Nutrition guidance and meal plans</span>
                </li>
                <li className="flex items-center">
                  <div className="bg-[#4D55CC]/20 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#4D55CC]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 font-medium text-lg">AI coach for guidance and motivation</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 transform md:rotate-1 hover:rotate-0 transition-transform duration-500">
              {/* Improved dashboard preview */}
              <div className="bg-gray-50 h-72 rounded-xl flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-100/80 z-10"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-gray-50 to-transparent"></div>
                <div className="grid grid-cols-2 gap-3 p-4 w-full h-full">
                  <div className="bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Fitness Chart</span>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Nutrition Stats</span>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Sleep Analysis</span>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Health Score</span>
                  </div>
                </div>
                <div className="absolute top-4 left-0 right-0 flex justify-center z-20">
                  <span className="text-gray-500 font-medium bg-white px-4 py-1 rounded-full shadow-sm text-sm">Dashboard Preview</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section with bolder call to action */}
      <section className="py-16 px-4 md:px-16 border-t border-gray-100 bg-white relative overflow-hidden">
        {/* Subtle background elements */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#e72208]/5 rounded-full"></div>
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#4D55CC]/5 rounded-full"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Ready to transform your health?</h2>
          <p className="text-gray-600 mb-10 text-lg max-w-2xl mx-auto">Take the first step toward your personalized health journey today.</p>
          <button 
            onClick={onGetStarted}
            className="bg-[#3E7B27] text-white px-10 py-4 rounded-xl font-medium text-lg hover:bg-[#346A21] hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
          >
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;