import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Moon, Flame, Activity, BarChart2, Calendar, BedDouble, Clock, Sun, Coffee } from 'lucide-react';
import FileUploader from './components/FileUploader';
import SleepAIAnalysis from './components/SleepAIAnalysis'; // Import the new component
import { calculateSleepQualityScore, generateSleepInsights, formatHoursAndMinutes, prepareDataForAI } from './utils/sleepAnalytics';

// Icon mapping for easy lookup
const iconMap = {
  Moon: <Moon className="h-4 w-4" />,
  Clock: <Clock className="h-4 w-4" />,
  BedDouble: <BedDouble className="h-4 w-4" />,
  Activity: <Activity className="h-4 w-4" />,
  Sun: <Sun className="h-4 w-4" />,
  Coffee: <Coffee className="h-4 w-4" />,
  Flame: <Flame className="h-4 w-4" />
};

const SleepAnalytics = ({ userData, healthMetrics, onDataProcessed }) => {
  const [sleepData, setSleepData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('week'); // week, month, all
  const [sleepInsights, setSleepInsights] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // New state for tracking analysis
  
  // Fixed useEffect with stable dependencies array
  useEffect(() => {
    if (sleepData) {
      // Filter based on time range
      const filteredData = filterDataByTimeRange(sleepData, timeRange);
      
      // Generate insights based on the filtered data
      const insights = generateSleepInsights(filteredData);
      setSleepInsights(insights);
      
      // Only update AI Coach when not analyzing and if callback exists
      if (onDataProcessed && !isAnalyzing && insights) {
        // Prepare AI-friendly data format
        const aiData = prepareDataForAI(filteredData, insights);
        if (aiData) {
          onDataProcessed(aiData);
        }
      }
    }
  }, [sleepData, timeRange, isAnalyzing, onDataProcessed]); // Fixed dependency array
  
  // Handle data processing with analysis status
  const handleDataProcessed = (data) => {
    if (!data || data.length === 0) return;
    
    setIsAnalyzing(true);
    setSleepData(data);
    
    // Simulate AI processing time
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };
  
  const filterDataByTimeRange = (data, range) => {
    const now = new Date();
    let cutoffDate;
    
    switch (range) {
      case 'week':
        cutoffDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        return data;
    }
    
    return data.filter(item => new Date(item.date) >= cutoffDate);
  };
  
  if (!sleepData) {
    return <FileUploader onDataProcessed={handleDataProcessed} />;
  }
  
  return (
    <div className="space-y-6">
      {/* Time range selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center">
          <Moon className="h-5 w-5 mr-2 text-[#4D55CC]" />
          Sleep Analytics
        </h2>
        
        <div className="bg-gray-100 p-1 rounded-lg">
          <button 
            className={`px-3 py-1 text-sm rounded-md ${timeRange === 'week' ? 'bg-white shadow-sm' : ''}`}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-md ${timeRange === 'month' ? 'bg-white shadow-sm' : ''}`}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-md ${timeRange === 'all' ? 'bg-white shadow-sm' : ''}`}
            onClick={() => setTimeRange('all')}
          >
            All
          </button>
        </div>
      </div>
      
      {/* NEW: AI Analysis Summary Card */}
      <SleepAIAnalysis 
        sleepData={filterDataByTimeRange(sleepData, timeRange)}
        sleepInsights={sleepInsights}
        isAnalyzing={isAnalyzing}
      />
      
      {/* Sleep overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white shadow-sm border-0">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Avg. Sleep Duration</span>
              <BedDouble className="h-4 w-4 text-[#4D55CC]" />
            </div>
            <div className="text-2xl font-bold">
              {formatHoursAndMinutes(sleepInsights?.averageSleepDuration)}
            </div>
            {sleepInsights?.averageSleepDurationTrend > 0 ? (
              <div className="text-xs text-green-600 mt-1">
                +{sleepInsights.averageSleepDurationTrend.toFixed(1)}% vs. previous period
              </div>
            ) : (
              <div className="text-xs text-red-600 mt-1">
                {sleepInsights?.averageSleepDurationTrend.toFixed(1)}% vs. previous period
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border-0">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Sleep Quality</span>
              <Moon className="h-4 w-4 text-[#4D55CC]" />
            </div>
            <div className="text-2xl font-bold">
              {sleepInsights?.sleepQualityScore}/100
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Based on sleep cycles & consistency
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border-0">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Avg. Deep Sleep</span>
              <Activity className="h-4 w-4 text-[#4D55CC]" />
            </div>
            <div className="text-2xl font-bold">
              {formatHoursAndMinutes(sleepInsights?.averageDeepSleep)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(sleepInsights?.deepSleepPercentage)}% of total sleep
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border-0">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Sleep Consistency</span>
              <Calendar className="h-4 w-4 text-[#4D55CC]" />
            </div>
            <div className="text-2xl font-bold">
              {sleepInsights?.sleepConsistency}/10
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Measures bedtime regularity
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main tabs for sleep data */}
      <Tabs defaultValue="overview" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
            Overview
          </TabsTrigger>
          <TabsTrigger value="cycles" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
            Sleep Cycles
          </TabsTrigger>
          <TabsTrigger value="factors" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md">
            Factors & Trends
          </TabsTrigger>
        </TabsList>
        
        {/* Overview tab content */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 gap-6">
            {/* Sleep duration chart */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">
                  Sleep Duration Over Time
                </CardTitle>
                <CardDescription>
                  Your total sleep hours tracked daily
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={sleepData}
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString()} 
                        minTickGap={30}
                      />
                      <YAxis name="Sleep (hrs)" domain={[0, 12]} />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "Total Sleep") {
                            return [formatHoursAndMinutes(value), name];
                          }
                          return [`${value.toFixed(1)}`, name];
                        }}
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="totalSleep" 
                        stroke="#4D55CC" 
                        strokeWidth={2}
                        name="Total Sleep" 
                        activeDot={{ r: 6 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Key insights card */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">
                  Key Insights
                </CardTitle>
                <CardDescription>
                  Personalized analysis based on your sleep patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sleepInsights?.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-full ${insight.color} text-white`}>
                        {iconMap[insight.iconName]}
                      </div>
                      <div>
                        <h4 className="font-medium">{insight.title}</h4>
                        <p className="text-sm text-gray-600">{insight.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Sleep Cycles tab content */}
        <TabsContent value="cycles" className="mt-4">
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">
                  Sleep Cycle Distribution
                </CardTitle>
                <CardDescription>
                  Breakdown of your sleep into different phases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sleepData}
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                      stackOffset="expand"
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString()} 
                        minTickGap={30}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => {
                          return [formatHoursAndMinutes(value), name];
                        }}
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <Legend />
                      <Bar 
                        dataKey="deepSleep" 
                        stackId="a" 
                        fill="#4D55CC" 
                        name="Deep Sleep" 
                      />
                      <Bar 
                        dataKey="coreSleep" 
                        stackId="a" 
                        fill="#63B3ED" 
                        name="Core Sleep" 
                      />
                      <Bar 
                        dataKey="remSleep" 
                        stackId="a" 
                        fill="#9F7AEA" 
                        name="REM Sleep" 
                      />
                      <Bar 
                        dataKey="awakeDuring" 
                        stackId="a" 
                        fill="#FC8181" 
                        name="Awake Time" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Sleep cycle metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-blue-50 border-0">
                <CardContent className="p-4">
                  <h3 className="font-medium text-blue-800 mb-1 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-[#4D55CC] mr-2"></span>
                    Deep Sleep
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Critical for physical recovery, immune function, and memory consolidation.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg. per night</span>
                    <span className="font-bold">{formatHoursAndMinutes(sleepInsights?.averageDeepSleep)}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50/50 border-0">
                <CardContent className="p-4">
                  <h3 className="font-medium text-blue-800 mb-1 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-[#63B3ED] mr-2"></span>
                    Core Sleep
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Light sleep stage that makes up the majority of your sleep cycle.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg. per night</span>
                    <span className="font-bold">{formatHoursAndMinutes(sleepInsights?.averageCoreSleep)}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50 border-0">
                <CardContent className="p-4">
                  <h3 className="font-medium text-purple-800 mb-1 flex items-center">
                    <span className="w-3 h-3 rounded-full bg-[#9F7AEA] mr-2"></span>
                    REM Sleep
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Important for cognitive functions, creativity, and emotional processing.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg. per night</span>
                    <span className="font-bold">{formatHoursAndMinutes(sleepInsights?.averageRemSleep)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Factors & Trends tab content */}
        <TabsContent value="factors" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Activity vs Sleep Quality */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">
                  Activity vs Sleep Quality
                </CardTitle>
                <CardDescription>
                  How your daily activity affects sleep
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={sleepData}
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString()} 
                        minTickGap={30}
                      />
                      <YAxis yAxisId="left" orientation="left" stroke="#4D55CC" />
                      <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "Sleep Duration (hrs)") {
                            return [formatHoursAndMinutes(value), name];
                          }
                          return [`${value.toFixed(1)}`, name];
                        }}
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="totalSleep" 
                        stroke="#4D55CC" 
                        name="Sleep Duration (hrs)" 
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="activeEnergy" 
                        stroke="#10B981" 
                        name="Active Energy (kcal)" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Heart Rate & Respiratory Rate */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold">
                  Sleep Vitals
                </CardTitle>
                <CardDescription>
                  Resting heart rate and respiratory rate during sleep
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={sleepData}
                      margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString()} 
                        minTickGap={30}
                      />
                      <YAxis yAxisId="left" orientation="left" stroke="#E53E3E" />
                      <YAxis yAxisId="right" orientation="right" stroke="#3182CE" />
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="restingHeartRate" 
                        stroke="#E53E3E" 
                        name="Resting HR (bpm)" 
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="respiratoryRate" 
                        stroke="#3182CE" 
                        name="Respiratory Rate (bpm)" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Recommendations based on data */}
            <Card className="bg-white shadow-sm border-0 md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold">
                    Personalized Recommendations
                  </CardTitle>
                  <CardDescription>
                    Based on your sleep patterns and health data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sleepInsights?.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="bg-gray-100 p-2 rounded-full">
                          {iconMap[recommendation.iconName]} {/* Use iconName instead of icon */}
                        </div>
                        <div>
                          <h4 className="font-medium">{recommendation.title}</h4>
                          <p className="text-sm text-gray-600">{recommendation.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SleepAnalytics;