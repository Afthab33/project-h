import { Moon, Clock, BedDouble, Activity, Sun, Coffee, Flame } from 'lucide-react';

/**
 * Formats decimal hours into "X hrs Y min" format
 * @param {number} hours - Decimal hours (e.g., 7.5)
 * @return {string} Formatted string (e.g., "7 hrs 30 min")
 */
export const formatHoursAndMinutes = (hours) => {
  if (hours === undefined || hours === null || isNaN(hours)) return "0 hrs 0 min";
  
  const hrs = Math.floor(hours);
  const mins = Math.round((hours - hrs) * 60);
  
  // Handle edge case where minutes round up to 60
  if (mins === 60) {
    return `${hrs + 1} hrs 0 min`;
  }
  
  return `${hrs} hrs ${mins} min`;
};

export const calculateSleepQualityScore = (sleepData) => {
  if (!sleepData || sleepData.length === 0) return 0;
  
  // Calculate the sleep quality based on various factors:
  // 1. Sleep duration (optimal around 7-9 hours)
  // 2. Deep sleep percentage (ideal is 15-25% of total sleep)
  // 3. REM sleep percentage (ideal is 20-25% of total sleep)
  // 4. Sleep consistency (regular sleep schedule)
  
  let totalScore = 0;
  const durationScores = [];
  const deepSleepScores = [];
  const remSleepScores = [];
  const awakeScores = [];
  
  sleepData.forEach(night => {
    // Score for sleep duration (max 40 points)
    const totalSleep = night.totalSleep || 0;
    let durationScore = 0;
    if (totalSleep >= 7 && totalSleep <= 9) {
      durationScore = 40; // Optimal range
    } else if (totalSleep >= 6 && totalSleep < 7) {
      durationScore = 30; // Slightly below optimal
    } else if (totalSleep > 9 && totalSleep <= 10) {
      durationScore = 30; // Slightly above optimal
    } else if (totalSleep >= 5 && totalSleep < 6) {
      durationScore = 20; // Below recommended
    } else if (totalSleep > 10) {
      durationScore = 15; // Too much sleep
    } else {
      durationScore = 10; // Too little sleep
    }
    durationScores.push(durationScore);
    
    // Score for deep sleep percentage (max 25 points)
    const deepSleep = night.deepSleep || 0;
    const deepSleepPercentage = totalSleep > 0 ? (deepSleep / totalSleep) * 100 : 0;
    let deepSleepScore = 0;
    if (deepSleepPercentage >= 15 && deepSleepPercentage <= 25) {
      deepSleepScore = 25; // Optimal range
    } else if (deepSleepPercentage >= 10 && deepSleepPercentage < 15) {
      deepSleepScore = 20; // Slightly below optimal
    } else if (deepSleepPercentage > 25 && deepSleepPercentage <= 30) {
      deepSleepScore = 20; // Slightly above optimal
    } else {
      deepSleepScore = 15; // Outside recommended range
    }
    deepSleepScores.push(deepSleepScore);
    
    // Score for REM sleep percentage (max 25 points)
    const remSleep = night.remSleep || 0;
    const remSleepPercentage = totalSleep > 0 ? (remSleep / totalSleep) * 100 : 0;
    let remSleepScore = 0;
    if (remSleepPercentage >= 20 && remSleepPercentage <= 25) {
      remSleepScore = 25; // Optimal range
    } else if (remSleepPercentage >= 15 && remSleepPercentage < 20) {
      remSleepScore = 20; // Slightly below optimal
    } else if (remSleepPercentage > 25 && remSleepPercentage <= 30) {
      remSleepScore = 20; // Slightly above optimal
    } else {
      remSleepScore = 15; // Outside recommended range
    }
    remSleepScores.push(remSleepScore);
    
    // Score for awake time during sleep (max 10 points)
    const awakeDuring = night.awakeDuring || 0;
    const awakePercentage = totalSleep > 0 ? (awakeDuring / totalSleep) * 100 : 0;
    let awakeScore = 0;
    if (awakePercentage <= 5) {
      awakeScore = 10; // Minimal awakening
    } else if (awakePercentage <= 10) {
      awakeScore = 7; // Some awakening
    } else if (awakePercentage <= 15) {
      awakeScore = 5; // Moderate awakening
    } else {
      awakeScore = 3; // Significant awakening
    }
    awakeScores.push(awakeScore);
  });
  
  // Calculate average scores
  const avgDurationScore = durationScores.length > 0 
    ? durationScores.reduce((sum, score) => sum + score, 0) / durationScores.length 
    : 0;
  
  const avgDeepSleepScore = deepSleepScores.length > 0 
    ? deepSleepScores.reduce((sum, score) => sum + score, 0) / deepSleepScores.length 
    : 0;
  
  const avgRemSleepScore = remSleepScores.length > 0 
    ? remSleepScores.reduce((sum, score) => sum + score, 0) / remSleepScores.length 
    : 0;
  
  const avgAwakeScore = awakeScores.length > 0 
    ? awakeScores.reduce((sum, score) => sum + score, 0) / awakeScores.length 
    : 0;
  
  // Bonus for consistency (max 10 points)
  let consistencyScore = calculateSleepConsistency(sleepData);
  
  // Total sleep quality score
  totalScore = Math.round(avgDurationScore + avgDeepSleepScore + avgRemSleepScore + avgAwakeScore + consistencyScore);
  
  // Cap the score at 100
  return Math.min(totalScore, 100);
};

export const calculateSleepConsistency = (sleepData) => {
  if (!sleepData || sleepData.length < 3) return 0;
  
  // Calculate standard deviation of sleep duration
  const sleepDurations = sleepData.map(night => night.totalSleep || 0);
  const avg = sleepDurations.reduce((sum, val) => sum + val, 0) / sleepDurations.length;
  const squareDiffs = sleepDurations.map(val => Math.pow(val - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
  const stdDev = Math.sqrt(avgSquareDiff);
  
  // Score based on standard deviation (lower std dev = higher consistency)
  if (stdDev < 0.5) return 10; // Extremely consistent
  if (stdDev < 0.75) return 8;
  if (stdDev < 1) return 6;
  if (stdDev < 1.5) return 4;
  if (stdDev < 2) return 2;
  return 0; // Very inconsistent
};

export const generateSleepInsights = (sleepData) => {
  if (!sleepData || sleepData.length === 0) return null;
  
  // Calculate average metrics
  const totalSleepValues = sleepData.map(night => night.totalSleep).filter(val => val);
  const deepSleepValues = sleepData.map(night => night.deepSleep).filter(val => val);
  const coreSleepValues = sleepData.map(night => night.coreSleep).filter(val => val);
  const remSleepValues = sleepData.map(night => night.remSleep).filter(val => val);
  
  const averageSleepDuration = totalSleepValues.reduce((sum, val) => sum + val, 0) / totalSleepValues.length;
  const averageDeepSleep = deepSleepValues.reduce((sum, val) => sum + val, 0) / deepSleepValues.length;
  const averageCoreSleep = coreSleepValues.reduce((sum, val) => sum + val, 0) / coreSleepValues.length;
  const averageRemSleep = remSleepValues.reduce((sum, val) => sum + val, 0) / remSleepValues.length;
  
  // Calculate percentages
  const deepSleepPercentage = averageSleepDuration > 0 ? (averageDeepSleep / averageSleepDuration) * 100 : 0;
  const coreSleepPercentage = averageSleepDuration > 0 ? (averageCoreSleep / averageSleepDuration) * 100 : 0;
  const remSleepPercentage = averageSleepDuration > 0 ? (averageRemSleep / averageSleepDuration) * 100 : 0;
  
  // Calculate sleep quality score
  const sleepQualityScore = calculateSleepQualityScore(sleepData);
  
  // Calculate sleep consistency score (0-10)
  const sleepConsistency = calculateSleepConsistency(sleepData);
  
  // Calculate trend (compared to previous period)
  // This is simplified - in a real app you might compare to the previous week/month
  let averageSleepDurationTrend = 0;
  if (sleepData.length >= 6) {
    const recentData = sleepData.slice(-3);
    const previousData = sleepData.slice(-6, -3);
    
    const recentAvg = recentData
      .map(night => night.totalSleep || 0)
      .reduce((sum, val) => sum + val, 0) / recentData.length;
    
    const previousAvg = previousData
      .map(night => night.totalSleep || 0)
      .reduce((sum, val) => sum + val, 0) / previousData.length;
    
    averageSleepDurationTrend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;
  }
  
  // Generate insights based on the data
  const insights = [];
  
  // Add insight based on sleep duration
  if (averageSleepDuration < 7) {
    insights.push({
      title: "You're not getting enough sleep",
      description: "Adults need 7-9 hours of sleep. Try going to bed 30 minutes earlier to improve your total sleep time.",
      iconName: "Clock",  // Changed from JSX to string
      color: "bg-red-500"
    });
  } else if (averageSleepDuration > 9) {
    insights.push({
      title: "You may be sleeping too much",
      description: "While sleep is important, consistently sleeping more than 9 hours may indicate other health issues.",
      iconName: "BedDouble",  // Changed from JSX to string
      color: "bg-yellow-500"
    });
  } else {
    insights.push({
      title: "Your sleep duration is optimal",
      description: "You're consistently getting the recommended 7-9 hours of sleep, which is great for your health.",
      iconName: "BedDouble",  // Changed from JSX to string
      color: "bg-green-500"
    });
  }
  
  // Add insight based on deep sleep
  if (deepSleepPercentage < 15) {
    insights.push({
      title: "Your deep sleep could be improved",
      description: "Deep sleep is crucial for physical recovery. Consider limiting caffeine and alcohol before bed.",
      iconName: "Activity",  // Changed from JSX to string
      color: "bg-yellow-500"
    });
  } else {
    insights.push({
      title: "Your deep sleep looks good",
      description: "You're getting sufficient deep sleep, which helps with physical recovery and immune function.",
      iconName: "Activity",  // Changed from JSX to string
      color: "bg-green-500"
    });
  }
  
  // Add insight based on REM sleep
  if (remSleepPercentage < 20) {
    insights.push({
      title: "You could use more REM sleep",
      description: "REM sleep is important for cognitive function and creativity. Regular exercise may help increase it.",
      iconName: "Moon",  // Changed from JSX to string
      color: "bg-yellow-500"
    });
  }
  
  // Add insight based on sleep consistency
  if (sleepConsistency < 5) {
    insights.push({
      title: "Your sleep schedule is irregular",
      description: "Try to go to bed and wake up at consistent times, even on weekends, to improve sleep quality.",
      iconName: "Clock",  // Changed from JSX to string
      color: "bg-red-500"
    });
  } else if (sleepConsistency >= 8) {
    insights.push({
      title: "Your sleep schedule is very consistent",
      description: "Great job maintaining a regular sleep schedule! This helps regulate your body's internal clock.",
      iconName: "Clock",  // Changed from JSX to string
      color: "bg-green-500"
    });
  }
  
  // Generate personalized recommendations
  const recommendations = [
    {
      title: "Optimize your bedtime routine",
      description: "Based on your sleep patterns, try going to bed between 10:00-10:30 PM for optimal sleep cycles.",
      iconName: "Moon"  // Changed from JSX to string
    },
    {
      title: "Limit screen time before bed",
      description: "Reduce exposure to blue light from devices at least 1 hour before bedtime to improve sleep quality.",
      iconName: "Sun"  // Changed from JSX to string
    },
    {
      title: "Consider your caffeine intake",
      description: "Avoiding caffeine after 2 PM could help improve your deep sleep percentage.",
      iconName: "Coffee"  // Changed from JSX to string
    },
    {
      title: "Increase physical activity",
      description: "Regular exercise can help improve both sleep duration and quality.",
      iconName: "Flame"  // Changed from JSX to string
    }
  ];
  
  return {
    averageSleepDuration,
    averageDeepSleep,
    averageCoreSleep,
    averageRemSleep,
    deepSleepPercentage,
    coreSleepPercentage,
    remSleepPercentage,
    sleepQualityScore,
    sleepConsistency,
    averageSleepDurationTrend,
    insights,
    recommendations
  };
};

/**
 * Prepares sleep data for AI processing by creating a condensed summary
 * @param {Array} sleepData - Array of sleep data points
 * @param {Object} sleepInsights - Calculated sleep insights
 * @return {Object} AI-ready data summary
 */
export const prepareDataForAI = (sleepData, sleepInsights) => {
  if (!sleepData || sleepData.length === 0 || !sleepInsights) return null;
  
  // Extract date range
  const dates = sleepData.map(d => new Date(d.date)).sort((a, b) => a - b);
  const startDate = dates[0];
  const endDate = dates[dates.length - 1];
  
  // Format key metrics
  const { 
    averageSleepDuration, 
    averageDeepSleep, 
    averageRemSleep,
    deepSleepPercentage,
    remSleepPercentage,
    sleepQualityScore,
    sleepConsistency
  } = sleepInsights;
  
  return {
    dataPoints: sleepData.length,
    dateRange: {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
      days: Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
    },
    averages: {
      totalSleep: averageSleepDuration,
      totalSleepFormatted: formatHoursAndMinutes(averageSleepDuration),
      deepSleep: averageDeepSleep,
      deepSleepFormatted: formatHoursAndMinutes(averageDeepSleep),
      deepSleepPercentage: Math.round(deepSleepPercentage),
      remSleep: averageRemSleep,
      remSleepFormatted: formatHoursAndMinutes(averageRemSleep),
      remSleepPercentage: Math.round(remSleepPercentage)
    },
    scores: {
      sleepQuality: sleepQualityScore,
      sleepConsistency: sleepConsistency
    },
    summary: `${sleepData.length} days of sleep data analyzed. Average sleep: ${formatHoursAndMinutes(averageSleepDuration)}. Sleep quality score: ${sleepQualityScore}/100. Sleep consistency: ${sleepConsistency}/10.`
  };
};