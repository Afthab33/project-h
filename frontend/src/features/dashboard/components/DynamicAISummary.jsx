import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  AlertCircle,
  UtensilsCrossed, 
  Apple, 
  Egg, 
  Beef,
  Dumbbell, 
  Timer, 
  Bike, 
  Activity, 
} from 'lucide-react';
import { getAISummary } from '../../coach/services/coachService';
import { useAuth } from '@/contexts/AuthContext';

// Fixed CustomAnimations component - removed jsx and global attributes
const CustomAnimations = () => (
  <>
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes float-vertical {
        0% { transform: translateY(0px) rotate(var(--icon-rotation, 0deg)); }
        50% { transform: translateY(-12px) rotate(var(--icon-rotation, 0deg)); }
        100% { transform: translateY(0px) rotate(var(--icon-rotation, 0deg)); }
      }
      
      @keyframes float-horizontal {
        0% { transform: translateX(0px) rotate(var(--icon-rotation, 0deg)); }
        50% { transform: translateX(8px) rotate(var(--icon-rotation, 0deg)); }
        100% { transform: translateX(0px) rotate(var(--icon-rotation, 0deg)); }
      }
      
      @keyframes pulse-slow {
        0%, 100% { opacity: var(--base-opacity, 0.1); }
        50% { opacity: calc(var(--base-opacity, 0.1) * 2); }
      }
      
      .animate-float-v {
        animation: float-vertical 6s ease-in-out infinite;
        --base-opacity: 0.12;
      }
      
      .animate-float-v-slow {
        animation: float-vertical 8s ease-in-out infinite;
        animation-delay: 0.5s;
        --base-opacity: 0.14;
      }
      
      .animate-float-h {
        animation: float-horizontal 7s ease-in-out infinite;
        --base-opacity: 0.12;
      }
      
      .animate-float-h-slow {
        animation: float-horizontal 9s ease-in-out infinite;
        animation-delay: 1.5s;
        --base-opacity: 0.14;
      }
      
      .animate-pulse-slow {
        animation: pulse-slow 7s ease-in-out infinite;
        --base-opacity: 0.12;
      }
    `}} />
  </>
);

const DynamicAISummary = ({ userData, healthMetrics, activeTab, onChatOpen }) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  // Get context-specific colors and icons
  const getContextVisuals = () => {
    switch(activeTab) {
      case 'nutrition':
        return {
          gradient: "from-[#3E7B27] to-[#70C04F]",
          bgGradient: "from-[#3E7B27]/5 to-[#70C04F]/5",
          icons: [
            { Icon: UtensilsCrossed, position: "top-6 right-10", size: "h-7 w-7", opacity: "0.12", rotate: "rotate-12", animation: "animate-float-v" },
            { Icon: Apple, position: "bottom-6 right-36", size: "h-9 w-9", opacity: "0.12", rotate: "-rotate-6", animation: "animate-float-h" },
            { Icon: Egg, position: "top-1/2 right-24", size: "h-8 w-8", opacity: "0.12", rotate: "rotate-3", animation: "animate-pulse-slow" },
            { Icon: Beef, position: "bottom-10 left-20", size: "h-10 w-10", opacity: "0.12", rotate: "-rotate-12", animation: "animate-float-v-slow" }
          ],
          iconColor: "#3E7B27"
        };
      case 'fitness':
        return {
          gradient: "from-[#e72208] to-[#FF6B4A]",
          bgGradient: "from-[#e72208]/5 to-[#FF6B4A]/5",
          icons: [
            { Icon: Dumbbell, position: "top-8 right-10", size: "h-10 w-10", opacity: "0.12", rotate: "rotate-12", animation: "animate-pulse-slow" },
            { Icon: Timer, position: "bottom-8 right-32", size: "h-8 w-8", opacity: "0.12", rotate: "-rotate-6", animation: "animate-float-v-slow" },
            { Icon: Bike, position: "top-16 left-24", size: "h-11 w-11", opacity: "0.12", rotate: "rotate-0", animation: "animate-float-h" },
            { Icon: Activity, position: "bottom-14 left-40", size: "h-9 w-9", opacity: "0.12", rotate: "-rotate-3", animation: "animate-float-h-slow" }
          ],
          iconColor: "#e72208"
        };
      default:
        return {
          gradient: "from-[#4D55CC] to-[#3E7B27]",
          bgGradient: "from-[#4D55CC]/5 to-[#3E7B27]/5",
          icons: [],
          iconColor: "#4D55CC"
        };
    }
  };

  // Enhanced effect to fetch AI summary from backend
  useEffect(() => {
    // Don't render for sleep tab
    if (activeTab === 'sleep') {
      setIsLoading(false);
      return;
    }
    
    const loadSummary = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fix for "User profile not loaded" error - add more robust checks
        if (!userData || Object.keys(userData).length === 0) {
          setSummary("Getting your personalized insights ready...");
          setIsLoading(false);
          return;
        }
        
        // Get authentication token for API call
        const token = await getToken();
        if (!token) {
          throw new Error('Authentication required');
        }
        
        // Normalize health metrics to handle different data formats
        const normalizedMetrics = normalizeHealthMetrics(healthMetrics || {});
        
        // Get personalized AI summary based on current context
        const response = await getAISummary({
          userData: userData,
          healthMetrics: normalizedMetrics,
          context: activeTab,
        }, token);
        
        if (!response || !response.summary) {
          throw new Error('Invalid response from AI service');
        }
        
        setSummary(response.summary);
      } catch (error) {
        console.error('Error fetching AI summary:', error);
        setError(error.message || 'Failed to load AI summary');
        // Fall back to a generic message when there's an error
        setSummary(getFallbackSummary());
      } finally {
        setIsLoading(false);
      }
    };
    
    // Debounce to prevent too many API calls when switching tabs
    const timer = setTimeout(() => {
      loadSummary();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [userData, healthMetrics, activeTab, getToken]);
  
  // Normalize health metrics to handle different data formats
  const normalizeHealthMetrics = (metrics) => {
    if (!metrics) return {};
    
    return {
      ...metrics,
      bmi: metrics.bmi ? parseFloat(metrics.bmi) : null,
      calorieTarget: metrics.calorieTarget ? parseInt(metrics.calorieTarget, 10) : null,
      proteinTarget: metrics.proteinTarget ? parseInt(metrics.proteinTarget, 10) : null,
      carbsTarget: metrics.carbsTarget ? parseInt(metrics.carbsTarget, 10) : null,
      fatsTarget: metrics.fatsTarget ? parseInt(metrics.fatsTarget, 10) : null
    };
  };

  // Get fallback content if we have no data
  const getFallbackSummary = () => {
    const firstName = userData?.displayName?.split(' ')[0] || 'there';
    return `Hi ${firstName}! I'm your Oats coach. I'm here to help you reach your fitness and nutrition goals.`;
  };

  // Don't render anything for sleep tab
  if (activeTab === 'sleep') {
    return null;
  }
  
  // Get visual elements for current context
  const { gradient, bgGradient, icons, iconColor } = getContextVisuals();

  return (
    <>
      <CustomAnimations />
      <Card className={`overflow-hidden border-none rounded-2xl shadow-md mb-6 bg-gradient-to-r ${bgGradient} relative`}>
        {/* Background thematic icons */}
        {icons.map((icon, index) => (
          <div 
            key={index}
            className={`absolute ${icon.position} pointer-events-none ${icon.animation}`}
            style={{ 
              color: iconColor, 
              opacity: icon.opacity,
              '--icon-rotation': icon.rotate.replace('rotate-', '') || '0deg'
            }}
          >
            <icon.Icon className={`${icon.size}`} />
          </div>
        ))}
        
        <CardContent className="p-5 md:p-6 relative z-10">
          <div className="flex items-center gap-4">
            {/* Consistent AI-themed icon with dynamic gradient */}
            <div className={`flex-shrink-0 bg-gradient-to-br ${gradient} p-3 rounded-xl text-white shadow-lg transform rotate-3`}>
              <Sparkles className="h-5 w-5" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center mb-1 gap-2">
                <h3 className="font-semibold text-lg text-gray-800">Oats</h3>
                <div className="bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center shadow-sm">
                  <Sparkles className="inline h-3 w-3 mr-1 text-amber-500" />
                  <span className="text-xs font-medium bg-gradient-to-r from-indigo-600 to-purple-600 inline-block text-transparent bg-clip-text">
                    Your Personalized AI Health &amp; Fitness Coach
                  </span>
                </div>
              </div>
              
              <div className="mt-1.5">
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse w-4/5"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse w-2/3"></div>
                  </div>
                ) : error ? (
                  <div className="bg-white/50 backdrop-blur-sm p-3 rounded-lg text-sm">
                    <div className="flex items-center text-red-800 mb-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>Couldn't load your insights</span>
                    </div>
                    <p className="text-gray-700">{getFallbackSummary()}</p>
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed">{summary || getFallbackSummary()}</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default DynamicAISummary;