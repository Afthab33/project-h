import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  Bot, 
  User, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  ClipboardCopy,
  Sparkles,
  X,
  ThumbsUp,
  ThumbsDown,
  Loader2
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { sendChatMessage, getChatHistory } from './services/coachService';
import * as calculations from '@/utils/healthMetricsCalculator';

const AICoach = forwardRef(({ userData, healthMetrics, contextHint, hideHeader = true, fixedHeight = false }, ref) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  // Add state for context data
  const [contextData, setContextData] = useState({});
  // Add state for enhanced context that will be sent to the AI
  const [enhancedContext, setEnhancedContext] = useState({});
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { getToken } = useAuth();
  
  // Updated common suggested prompts that are more direct and engaging
  const commonPrompts = [
    "How healthy am I?",
    "How can I lose weight?", 
    "What workout today?", 
    "How did I sleep?"
  ];
  
  // Enhanced context-specific prompts that better align with user tabs
  const contextPrompts = {
    home: [
      "How healthy am I?",
      "What should I focus on today?",
      "Am I making progress?"
    ],
    nutrition: [
      "What should I eat today?",
      "How can I reduce sugar cravings?",
      "Best foods for my goals?"
    ],
    fitness: [
      "What workout today?",
      "Best exercises for my body type?",
      "How to recover faster?"
    ],
    sleep: [
      "How did I sleep?",
      "How to fall asleep faster?",
      "Is my sleep pattern healthy?"
    ]
  };
  
  // Dynamically select prompts based on context
  const getSuggestedPrompts = () => {
    // If we're in a specific context, mix 2 context-specific with 2 common prompts
    if (contextHint && contextPrompts[contextHint]) {
      // Get 2 random prompts from the context-specific list
      const contextSpecificPrompts = [...contextPrompts[contextHint]].sort(() => 0.5 - Math.random()).slice(0, 2);
      
      // Get 2 common prompts that aren't in the context-specific selection
      const filteredCommonPrompts = commonPrompts.filter(prompt => !contextSpecificPrompts.includes(prompt));
      const selectedCommonPrompts = filteredCommonPrompts.sort(() => 0.5 - Math.random()).slice(0, 2);
      
      return [...contextSpecificPrompts, ...selectedCommonPrompts];
    }
    
    // Default to common prompts
    return commonPrompts;
  };
  
  // Get suggested prompts based on context
  const suggestedPrompts = getSuggestedPrompts();
  
  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Focus input when component loads
  useEffect(() => {
    if (inputRef.current && !hideHeader) {
      setTimeout(() => inputRef.current.focus(), 300);
    }
  }, [hideHeader]);

  // Add method to update context data (for use by parent components)
  const updateContext = (newContextData) => {
    setContextData(prevContext => ({
      ...prevContext,
      ...newContextData
    }));
  };

  // Process sleep data when it changes
  useEffect(() => {
    if (contextData.sleepData && contextData.sleepData.length > 0) {
      try {
        const recentSleepMetrics = processRecentSleepData(contextData.sleepData);
        if (recentSleepMetrics) {
          const sleepSummary = `Recent sleep data: Average ${recentSleepMetrics.avgSleepDuration.toFixed(1)} hours per night, ${recentSleepMetrics.avgDeepSleep.toFixed(1)} hours of deep sleep (${recentSleepMetrics.deepSleepPercentage.toFixed(0)}% of total sleep), sleep consistency score: ${recentSleepMetrics.consistency}/10.`;
          
          setEnhancedContext(prev => ({
            ...prev,
            sleepInsights: sleepSummary
          }));
        }
      } catch (err) {
        console.error("Error processing sleep data:", err);
      }
    }
  }, [contextData.sleepData]);

  const loadChatHistory = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const history = await getChatHistory(token);
      
      if (history?.messages?.length > 0) {
        setMessages(history.messages);
      } else {
        // Add welcome message if no history
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: `👋 Hi there! I'm your AI health coach. Based on your profile, I can help with personalized advice for your ${userData.primaryGoal || 'fitness'} goals. How can I assist you today?`,
          timestamp: new Date()
        }]);
      }
    } catch (err) {
      setError('Failed to load chat history');
      console.error('Error loading chat history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text = inputMessage) => {
    if ((!text.trim() && !inputMessage.trim()) || isLoading) return;
    
    const messageToSend = text.trim() || inputMessage.trim();
    setError(null);
    
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      const token = await getToken();
      
      // Create a clean copy of user data with all available metrics
      const enhancedUserData = {
        ...userData,
        bmi: userData?.bmi || userData?.healthMetrics?.bmi || 
          calculations.calculateBMI(userData?.height, userData?.weight, 'cm', 'kg'),
        bmiCategory: userData?.bmiCategory || 
          (userData?.bmi ? calculations.getBMICategory(userData?.bmi).category : 
          calculations.getBMICategory(calculations.calculateBMI(userData?.height, userData?.weight, 'cm', 'kg')).category),
        healthMetrics: {
          ...healthMetrics,
          bmi: healthMetrics?.bmi || userData?.bmi || 
            calculations.calculateBMI(userData?.height, userData?.weight, 'cm', 'kg'),
          bmiCategory: healthMetrics?.bmiCategory ||
            (userData?.bmi ? calculations.getBMICategory(userData?.bmi).category : 
            calculations.getBMICategory(calculations.calculateBMI(userData?.height, userData?.weight, 'cm', 'kg')).category)
        },
        // Include enhanced context with sleep data
        ...enhancedContext
      };
      
      const response = await sendChatMessage({
        message: messageToSend,
        userData: enhancedUserData,
        healthMetrics: enhancedUserData.healthMetrics || {}
      }, token);
      
      if (response?.message) {
        setMessages(prev => [...prev, {
          id: response.id || Date.now().toString() + '-response',
          role: 'assistant',
          content: response.message,
          timestamp: new Date()
        }]);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error('Error sending message:', err);
      
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        role: 'system',
        content: `Sorry, I encountered an error. Please try again. ${
          process.env.NODE_ENV !== 'production' ? `(${err.message})` : ''
        }`,
        timestamp: new Date(),
        error: true
      }]);
      
      setError('Failed to get response from coach. Please try again.');
    } finally {
      setIsLoading(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const processRecentSleepData = (sleepData) => {
    if (!sleepData || !sleepData.length) return null;
    
    // Only use the last 7 days of data if available
    const recentData = sleepData.slice(-7);
    
    const avgSleepDuration = recentData.reduce((sum, night) => sum + (night.totalSleep || 0), 0) / recentData.length;
    const avgDeepSleep = recentData.reduce((sum, night) => sum + (night.deepSleep || 0), 0) / recentData.length;
    const deepSleepPercentage = avgSleepDuration > 0 ? (avgDeepSleep / avgSleepDuration) * 100 : 0;
    
    // Calculate sleep consistency (standard deviation of sleep duration)
    const sleepDurations = recentData.map(night => night.totalSleep || 0);
    const avg = sleepDurations.reduce((sum, val) => sum + val, 0) / sleepDurations.length;
    const squareDiffs = sleepDurations.map(val => Math.pow(val - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
    const stdDev = Math.sqrt(avgSquareDiff);
    
    // Convert to a 0-10 consistency score (lower std deviation = higher consistency)
    const consistency = Math.max(0, Math.min(10, 10 - (stdDev * 5)));
    
    return {
      avgSleepDuration,
      avgDeepSleep,
      deepSleepPercentage,
      consistency: Math.round(consistency)
    };
  };

  // Add this new method to handle forced context refresh
  const refreshContext = () => {
    if (contextData.sleepData && contextData.sleepData.length > 0) {
      try {
        
        const recentSleepMetrics = processRecentSleepData(contextData.sleepData);
        if (recentSleepMetrics) {
          const sleepSummary = `Recent sleep data analysis: Average ${recentSleepMetrics.avgSleepDuration.toFixed(1)} hours per night over the last ${Math.min(contextData.sleepData.length, 7)} days. Sleep quality metrics: Deep sleep ${recentSleepMetrics.avgDeepSleep.toFixed(1)} hours (${recentSleepMetrics.deepSleepPercentage.toFixed(0)}% of total sleep), sleep consistency score: ${recentSleepMetrics.consistency}/10. Your recent sleep patterns suggest ${recentSleepMetrics.consistency > 7 ? 'good consistency' : 'room for improvement in sleep schedule consistency'}.`;
          
          // Update enhanced context with more detailed sleep insights
          setEnhancedContext(prev => ({
            ...prev,
            sleepInsights: sleepSummary
          }));
          
          // Add a message from the coach acknowledging the new sleep data
          setMessages(prev => [...prev, {
            id: 'sleep-data-' + Date.now(),
            role: 'assistant',
            content: `I notice you've uploaded your sleep data. I'll take this into account when providing recommendations. Feel free to ask me any questions about your sleep patterns or how they relate to your ${userData.primaryGoal || 'health'} goals.`,
            timestamp: new Date()
          }]);
        }
      } catch (err) {
        console.error("Error refreshing sleep context:", err);
      }
    }
  };
  
  // Expose updateContext method for parent components
  useImperativeHandle(ref, () => ({
    updateContext: (newContextData) => {
      setContextData(prevContext => ({
        ...prevContext,
        ...newContextData
      }));
    },
    refreshContext
  }));
  
  return (
    <Card className="flex flex-col shadow-lg border-gray-200">
      {/* Rest of your component remains the same */}
      {!hideHeader && (
        <div className="bg-gradient-to-r from-[#4D55CC]/90 to-[#4D55CC] text-white p-4 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center">
            <div className="bg-white/20 p-1.5 rounded-lg mr-3">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">AI Health Coach</h3>
              <p className="text-xs text-white/80">Powered by advanced AI</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
            <Sparkles className="h-3 w-3 mr-1" /> 
            Premium
          </Badge>
        </div>
      )}
      
      <CardContent className={`flex-1 flex flex-col ${hideHeader ? 'pt-4' : 'pt-3'} px-0 pb-0`}>
        {/* Enhanced chat window with subtle pattern background */}
        <div 
          className={`flex-1 overflow-y-auto px-5 py-3 space-y-5 bg-gradient-to-b from-gray-50/50 to-white ${
            fixedHeight ? 'h-[400px] max-h-[400px]' : 'min-h-[550px] max-h-[65vh]'
          }`}
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(0, 0, 0, 0.02) 2%, transparent 0%), 
                               radial-gradient(circle at 75px 75px, rgba(0, 0, 0, 0.02) 2%, transparent 0%)`,
            backgroundSize: '100px 100px'
          }}
        >
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`group flex relative ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-[#4D55CC] to-[#4a52c0] text-white rounded-tr-none' 
                    : msg.error 
                      ? 'bg-red-50 text-red-600 border border-red-200 rounded-tl-none'
                      : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center">
                    {msg.role === 'user' ? (
                      <div className="bg-white/20 rounded-full p-1 mr-1.5">
                        <User className="h-3 w-3 text-white" />
                      </div>
                    ) : (
                      <div className="bg-[#4D55CC]/10 rounded-full p-1 mr-1.5">
                        <Bot className="h-3 w-3 text-[#4D55CC]" />
                      </div>
                    )}
                    <span className={`text-xs font-medium ${msg.role === 'user' ? 'text-white/90' : 'text-gray-500'}`}>
                      {msg.role === 'user' ? 'You' : 'Oats'} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  
                  {/* Enhanced copy button appears on hover for coach messages */}
                  {msg.role === 'assistant' && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 rounded-full hover:bg-gray-100"
                              onClick={() => copyToClipboard(msg.content, msg.id)}
                            >
                              {copiedId === msg.id ? (
                                <span className="text-emerald-500 text-xs">Copied!</span>
                              ) : (
                                <ClipboardCopy className="h-3.5 w-3.5 text-gray-500" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy to clipboard</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
                
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                
                {/* Enhanced feedback buttons for coach messages */}
                {msg.role === 'assistant' && !msg.error && (
                  <div className="mt-3 pt-2 border-t border-gray-200 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full hover:bg-gray-100">
                        <ThumbsUp className="h-3.5 w-3.5 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full hover:bg-gray-100">
                        <ThumbsDown className="h-3.5 w-3.5 text-gray-500" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Enhanced loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-100 shadow-sm text-gray-800 rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                <div className="flex items-center mb-1.5">
                  <div className="bg-[#4D55CC]/10 rounded-full p-1 mr-1.5">
                    <Bot className="h-3 w-3 text-[#4D55CC]" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Oats</span>
                </div>
                <div className="flex items-center space-x-2 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-[#4D55CC] animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-[#4D55CC] animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-[#4D55CC] animate-bounce" style={{ animationDelay: "600ms" }}></div>
                  </div>
                  <p className="text-sm text-gray-500 ml-1">Thinking...</p>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </CardContent>

      {/* Enhanced footer with floating input */}
      <CardFooter className="border-t p-4 flex flex-col gap-3 bg-white">
        {error && (
          <div className="absolute -top-8 left-0 right-0 bg-red-50 border-y border-red-200 p-1.5 text-center">
            <p className="text-red-600 text-xs flex items-center justify-center">
              {error} 
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={loadChatHistory} 
                className="ml-2 p-0 h-6 text-xs text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Retry
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-2 p-0 h-6 text-xs"
              >
                <X className="h-3 w-3" />
              </Button>
            </p>
          </div>
        )}
        
        {/* Enhanced suggestion pills */}
        <div className="flex flex-wrap gap-2 mb-2">
          {suggestedPrompts.map((prompt, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="text-xs py-1.5 px-3 h-auto border border-gray-200 bg-white text-gray-700 hover:bg-[#4D55CC]/5 hover:text-[#4D55CC] hover:border-[#4D55CC]/30 rounded-full transition-colors"
              onClick={() => handleSendMessage(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
        
        {/* Enhanced input form with floating appearance */}
        <form 
          className="w-full flex items-center gap-2 relative" 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask Oats anything about your health..."
            className="flex-1 bg-gray-50 border-gray-200 focus-visible:ring-[#4D55CC]/30 py-6 pl-4 pr-12 rounded-xl shadow-sm"
            disabled={isLoading}
          />
          <Button 
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="absolute right-2 bg-[#4D55CC] hover:bg-[#394099] text-white rounded-full w-10 h-10 p-0 shadow-md"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
        {/* Add a subtle branding footer */}
        <div className="w-full flex justify-center mt-1">
          <p className="text-[10px] text-gray-400">Powered by Project Health AI</p>
        </div>
      </CardFooter>
    </Card>
  );
});

export default AICoach;