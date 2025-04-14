import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Loader, Check, AlertCircle, Clock, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatHoursAndMinutes } from '../utils/sleepAnalytics';
import { analyzeSleepData } from '@/features/coach/services/coachService';
import { useAuth } from '@/contexts/AuthContext';

const SleepAIAnalysis = ({ sleepData, sleepInsights, isAnalyzing = false }) => {
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState('idle'); // idle, loading, success, error
  const { currentUser } = useAuth();

  // Use the dedicated sleep analysis endpoint
  useEffect(() => {
    // Don't run analysis if data is missing or we're in the analyzing state
    if (!sleepData || sleepData.length === 0 || !sleepInsights || isAnalyzing) {
      return;
    }
    
    setAnalysisStatus('loading');
    
    const fetchSleepAnalysis = async () => {
      try {
        // Call our dedicated sleep analysis endpoint
        const token = await currentUser.getIdToken();
        const response = await analyzeSleepData({
          sleepData: sleepData,
          sleepInsights: sleepInsights
        }, token);
        
        if (response && response.success && response.analysis) {
          setAiAnalysis(response.analysis);
          setAnalysisStatus('success');
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching sleep analysis:", error);
        setAnalysisStatus('error');
        
        // Fallback to local analysis when API fails
        const fallbackAnalysis = generateLocalAnalysis(sleepData, sleepInsights);
        setAiAnalysis(fallbackAnalysis);
        setAnalysisStatus('success');
      }
    };
    
    fetchSleepAnalysis();
  }, [sleepData, sleepInsights, isAnalyzing, currentUser]);

  // Fallback analysis generator if API fails
  const generateLocalAnalysis = (sleepData, insights) => {
    // Extract key statistics
    const { 
      averageSleepDuration, 
      deepSleepPercentage,
      remSleepPercentage,
      sleepConsistency, 
      sleepQualityScore 
    } = insights;
    
    // Determine sleep quality category
    let qualityCategory;
    if (sleepQualityScore >= 85) qualityCategory = "excellent";
    else if (sleepQualityScore >= 70) qualityCategory = "good";
    else if (sleepQualityScore >= 50) qualityCategory = "fair";
    else qualityCategory = "poor";
    
    // First paragraph: overview
    let summary = `Your overall sleep quality score is ${sleepQualityScore}/100, indicating ${qualityCategory} sleep health. With an average of ${formatHoursAndMinutes(averageSleepDuration)} of sleep per night, you are ${averageSleepDuration >= 7 ? 'meeting' : 'falling short of'} the recommended 7-9 hours needed for optimal health and cognitive function.`;
    
    // Second paragraph: sleep composition analysis
    summary += `\n\nYour sleep composition shows ${Math.round(deepSleepPercentage)}% deep sleep (ideal: 15-25%) and ${Math.round(remSleepPercentage)}% REM sleep (ideal: 20-25%), which are crucial for physical recovery and cognitive processing respectively. Your sleep consistency score of ${sleepConsistency}/10 indicates ${sleepConsistency >= 7 ? 'good regularity' : 'irregular sleep patterns'} that can affect your overall sleep quality and daytime alertness.`;
    
    // Third paragraph: recommendations
    summary += `\n\nTo improve your sleep quality, focus on ${deepSleepPercentage < 15 ? 'increasing deep sleep through regular exercise earlier in the day and limiting evening screen time' : 'maintaining your healthy deep sleep patterns'}. ${sleepConsistency < 5 ? 'Establish consistent sleep and wake times, even on weekends, to improve your sleep rhythm.' : 'Continue maintaining your consistent sleep schedule.'} ${averageSleepDuration < 7 ? 'Aim to extend your sleep duration by 30-60 minutes to reach at least 7 hours nightly for optimal health benefits.' : 'Your current sleep duration supports good health - maintain this pattern.'}`;
    
    return {
      summary: summary,
      qualityCategory: qualityCategory,
      sleepScore: sleepQualityScore,
      dayCount: sleepData.length
    };
  };

  // Rest of the component remains the same - loading, error and success states
  
  // Loading state
  if (isAnalyzing || analysisStatus === 'loading') {
    return (
      <Card className="bg-gradient-to-r from-[#4D55CC]/10 to-[#3E7B27]/10 border-0 shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-[#4D55CC]/20 flex items-center justify-center mr-3">
              <Loader className="h-5 w-5 text-[#4D55CC] animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-800">Oats is analyzing your sleep data</h3>
              <p className="text-sm text-gray-600">
                Processing your sleep patterns and health metrics to provide personalized insights...
              </p>
            </div>
          </div>
          
          <div className="mt-3 flex justify-between">
            <div className="flex space-x-1">
              <div className="h-1 w-12 rounded-full bg-[#4D55CC] animate-pulse"></div>
              <div className="h-1 w-12 rounded-full bg-[#4D55CC]/50 animate-pulse delay-100"></div>
              <div className="h-1 w-12 rounded-full bg-[#4D55CC]/30 animate-pulse delay-200"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state - using fallback analysis instead of showing error
  if (analysisStatus === 'error' && !aiAnalysis) {
    return (
      <Card className="bg-red-50 border-0 shadow-sm mb-6">
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-800">Analysis unavailable</h3>
              <p className="text-sm text-gray-600">
                There was a problem analyzing your sleep data. Please try again later.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No analysis yet or no data
  if (!aiAnalysis) {
    return null;
  }

  // Success state with formatted analysis
  return (
    <Card className={`
      ${aiAnalysis.qualityCategory === 'excellent' ? 'bg-gradient-to-r from-green-50 to-blue-50' : 
        aiAnalysis.qualityCategory === 'good' ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 
        aiAnalysis.qualityCategory === 'fair' ? 'bg-gradient-to-r from-amber-50 to-orange-50' : 
        'bg-gradient-to-r from-orange-50 to-red-50'
      }
      border-0 shadow-sm mb-6
    `}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-start">
          <div className={`
            h-12 w-12 rounded-full flex items-center justify-center mr-4 mb-3 sm:mb-0 mt-1
            ${aiAnalysis.qualityCategory === 'excellent' ? 'bg-green-100 text-green-600' : 
              aiAnalysis.qualityCategory === 'good' ? 'bg-blue-100 text-blue-600' : 
              aiAnalysis.qualityCategory === 'fair' ? 'bg-amber-100 text-amber-600' : 
              'bg-orange-100 text-orange-600'
            }
          `}>
            <Brain className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Sleep Analysis Report</h3>
              <div className="flex items-center ml-2">
                <Sparkles className="h-3.5 w-3.5 text-[#4D55CC]" />
                <span className="text-xs text-[#4D55CC] ml-1">AI Powered</span>
              </div>
            </div>
            
            {/* Format the analysis into paragraphs */}
            <div className="text-sm space-y-3 text-gray-700">
              {aiAnalysis.summary.split("\n\n").map((paragraph, index) => (
                <p key={index} className={index === 2 ? "font-medium" : ""}>{paragraph}</p>
              ))}
            </div>
            
            {/* Add key metrics dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Sleep Quality</div>
                <div className={`text-base font-bold
                  ${aiAnalysis.sleepScore >= 85 ? 'text-green-600' : 
                    aiAnalysis.sleepScore >= 70 ? 'text-blue-600' : 
                    aiAnalysis.sleepScore >= 50 ? 'text-amber-600' : 
                    'text-red-600'
                  }`}>
                  {aiAnalysis.sleepScore}/100
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Deep Sleep</div>
                {sleepInsights ? (
                  <div className={`text-base font-bold
                    ${sleepInsights.deepSleepPercentage >= 15 ? 
                      sleepInsights.deepSleepPercentage <= 25 ? 'text-green-600' : 'text-amber-600' 
                      : 'text-red-600'
                    }`}>
                    {Math.round(sleepInsights.deepSleepPercentage)}%
                    <span className="text-xs font-normal text-gray-500 ml-1">(15-25% ideal)</span>
                  </div>
                ) : (
                  <div className="text-base font-medium text-gray-500">--</div>
                )}
              </div>
              
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">REM Sleep</div>
                {sleepInsights ? (
                  <div className={`text-base font-bold
                    ${sleepInsights.remSleepPercentage >= 20 ? 
                      sleepInsights.remSleepPercentage <= 25 ? 'text-green-600' : 'text-amber-600' 
                      : 'text-red-600'
                    }`}>
                    {Math.round(sleepInsights.remSleepPercentage)}%
                    <span className="text-xs font-normal text-gray-500 ml-1">(20-25% ideal)</span>
                  </div>
                ) : (
                  <div className="text-base font-medium text-gray-500">--</div>
                )}
              </div>
              
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Consistency</div>
                {sleepInsights ? (
                  <div className={`text-base font-bold
                    ${sleepInsights.sleepConsistency >= 7 ? 'text-green-600' : 
                      sleepInsights.sleepConsistency >= 5 ? 'text-amber-600' : 
                      'text-red-600'
                    }`}>
                    {sleepInsights.sleepConsistency}/10
                  </div>
                ) : (
                  <div className="text-base font-medium text-gray-500">--</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 border-t border-gray-100 pt-3 flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
          <div className="flex items-center">
            <Clock className="h-3.5 w-3.5 text-gray-500 mr-1" />
            <span className="text-gray-500">Avg. Sleep:</span>
            <span className="font-medium ml-1 text-gray-700">
              {sleepInsights ? formatHoursAndMinutes(sleepInsights.averageSleepDuration) : "--"}
            </span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-3.5 w-3.5 text-gray-500 mr-1" />
            <span className="text-gray-500">Data Range:</span>
            <span className="font-medium ml-1 text-gray-700">{aiAnalysis?.dayCount || "--"} days</span>
          </div>
          <div className="flex items-center ml-auto">
            <span className="text-gray-500">Status:</span>
            <div className="flex items-center ml-1">
              <Check className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-600">Analysis complete</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SleepAIAnalysis;