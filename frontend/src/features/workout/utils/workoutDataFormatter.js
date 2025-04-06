/* Transforms API response data into UI-friendly format
Contains helper functions for workout data formatting */

/**
 * Transforms the API workout plan data into a format suitable for the UI
 * @param {Object} planData - Workout plan data from the API
 * @returns {Object} - Transformed workout plan data
 */
export const transformWorkoutPlanData = (planData) => {
  
  
  // If the entire plan is a string (markdown format from backend)
  if (typeof planData === 'string' || (planData.workout_plan && typeof planData.workout_plan === 'string')) {
    const markdownText = typeof planData === 'string' ? planData : planData.workout_plan;
    return parseMarkdownWorkoutPlan(markdownText);
  }
  
  // Handle different possible formats from the backend
  if (typeof planData.workout_plan === 'string') {
    return parseMarkdownWorkoutPlan(planData.workout_plan);
  }
  
  // Rest of your existing code for handling JSON format...
  try {
    // Existing JSON handling code...
    const transformed = {
      days: (planData.workout_plan?.days || []).map((day, index) => {
        // Calculate metrics for this day
        const totalSets = day.exercises?.reduce((sum, ex) => sum + (ex.sets || 0), 0) || 0;
        const totalReps = day.exercises?.reduce((sum, ex) => {
          // Handle rep ranges like "8-12"
          const repValue = ex.reps;
          if (typeof repValue === 'string' && repValue.includes('-')) {
            const [min, max] = repValue.split('-').map(Number);
            return sum + ((min + max) / 2) * (ex.sets || 0);
          }
          return sum + (parseInt(ex.reps) || 10) * (ex.sets || 0);
        }, 0) || 0;
        
        const avgReps = totalSets > 0 ? Math.round(totalReps / totalSets) : 10;
        
        // Estimate calories based on duration and type
        let estimatedCalories = 0;
        if (day.duration) {
          // Extract minutes from duration (e.g., "45-60 minutes" → 52.5)
          const durationParts = day.duration.match(/(\d+)(?:-(\d+))?/);
          if (durationParts) {
            const minTime = parseInt(durationParts[1]);
            const maxTime = durationParts[2] ? parseInt(durationParts[2]) : minTime;
            const avgTime = (minTime + maxTime) / 2;
            
            // Base calorie burn on workout type
            const intensityFactor = day.focus.toLowerCase().includes('hiit') ? 10 : 
                                   day.focus.toLowerCase().includes('cardio') ? 9 :
                                   day.focus.toLowerCase().includes('full') ? 8 :
                                   day.focus.toLowerCase().includes('lower') ? 7 : 6;
                                   
            estimatedCalories = Math.round(avgTime * intensityFactor * 2.5);
          }
        }
        
        return {
          id: `day${day.day || index + 1}`,
          dayName: `Day ${day.day || index + 1}`,
          focus: day.focus || 'General Workout',
          duration: day.duration || '45-60 minutes',
          warmup: day.warmup || [],
          exercises: (day.exercises || []).map(ex => ({
            ...ex,
            muscleGroups: [], // Add empty muscle groups if not provided
            reps: ex.reps || '10-12',
            sets: ex.sets || 3
          })),
          cooldown: day.cooldown || [],
          metrics: {
            totalSets,
            avgReps,
            estimatedCalories
          }
        };
      }),
      progressionNotes: planData.workout_plan?.progression_notes || 
                       "Progress by increasing weight or reps when exercises become easier."
    };
    
    
    return transformed;
  } catch (error) {
    console.error("Error transforming workout plan data:", error, planData);
    return fallbackWorkoutPlan();
  }
};

/**
 * Parse a markdown-formatted workout plan into the required UI structure
 * @param {string} markdown - Markdown text of the workout plan
 * @returns {Object} - Transformed workout plan data
 */
function parseMarkdownWorkoutPlan(markdown) {
  try {
    
    const days = [];
    let progressionNotes = "";
    
    // Extract days from markdown
    const dayRegex = /### DAY (\d+): ([A-Z\s]+) \(([^)]+)\)([\s\S]*?)(?=### DAY \d+:|## PROGRESSION NOTES|$)/g;
    let match;
    
    while ((match = dayRegex.exec(markdown)) !== null) {
      const dayNumber = parseInt(match[1]);
      const focus = match[2].trim();
      const duration = match[3].trim();
      const dayContent = match[4].trim();
      
      // Extract warm-up
      const warmupRegex = /\*\*WARM-UP:\*\*([\s\S]*?)(?=\*\*MAIN WORKOUT)/;
      const warmupMatch = dayContent.match(warmupRegex);
      const warmup = warmupMatch ? 
        warmupMatch[1].trim().split('\n').map(item => item.trim().replace(/^- /, '').trim())
        .filter(item => item !== '') : [];
      
      // Extract exercises
      const mainWorkoutRegex = /\*\*MAIN WORKOUT:\*\*([\s\S]*?)(?=\*\*COOL-DOWN)/;
      const mainWorkoutMatch = dayContent.match(mainWorkoutRegex);
      const exerciseContent = mainWorkoutMatch ? mainWorkoutMatch[1] : '';
      
      // Parse individual exercises
      const exercises = [];
      const exerciseRegex = /- \*\*(.*?)\*\*: (\d+) sets × (.*?)\n\s*Rest: (.*?)\n\s*_(.*?)_\n\s*Easier: (.*?)\n\s*Harder: (.*?)(?=\n\n|$)/g;
      let exerciseMatch;
      
      while ((exerciseMatch = exerciseRegex.exec(exerciseContent)) !== null) {
        exercises.push({
          name: exerciseMatch[1].trim(),
          sets: parseInt(exerciseMatch[2]),
          reps: exerciseMatch[3].trim(),
          rest: exerciseMatch[4].trim(),
          notes: exerciseMatch[5].trim(),
          progression: {
            easier: exerciseMatch[6].trim(),
            harder: exerciseMatch[7].trim()
          },
          muscleGroups: getMuscleGroups(exerciseMatch[1].trim(), focus)
        });
      }
      
      // Extract cool-down
      const cooldownRegex = /\*\*COOL-DOWN:\*\*([\s\S]*?)(?=\n\n|$)/;
      const cooldownMatch = dayContent.match(cooldownRegex);
      const cooldown = cooldownMatch ? 
        cooldownMatch[1].trim().split('\n').map(item => item.trim().replace(/^- /, '').trim())
        .filter(item => item !== '') : [];
      
      // Calculate metrics
      const totalSets = exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0);
      const totalReps = exercises.reduce((sum, ex) => {
        const repValue = ex.reps;
        if (typeof repValue === 'string' && repValue.includes('-')) {
          const [min, max] = repValue.split('-').map(Number);
          return sum + ((min + max) / 2) * (ex.sets || 0);
        }
        return sum + (parseInt(repValue) || 10) * (ex.sets || 0);
      }, 0);
      
      const avgReps = totalSets > 0 ? Math.round(totalReps / totalSets) : 10;
      
      // Estimate calories
      const durationParts = duration.match(/(\d+)(?:-(\d+))?/);
      let estimatedCalories = 0;
      
      if (durationParts) {
        const minTime = parseInt(durationParts[1]);
        const maxTime = durationParts[2] ? parseInt(durationParts[2]) : minTime;
        const avgTime = (minTime + maxTime) / 2;
        
        const intensityFactor = focus.toLowerCase().includes('hiit') ? 10 : 
                               focus.toLowerCase().includes('cardio') ? 9 :
                               focus.toLowerCase().includes('full') ? 8 :
                               focus.toLowerCase().includes('lower') ? 7 : 6;
                               
        estimatedCalories = Math.round(avgTime * intensityFactor * 2.5);
      }
      
      days.push({
        id: `day${dayNumber}`,
        dayName: `Day ${dayNumber}`,
        focus: focus.charAt(0) + focus.slice(1).toLowerCase(),
        duration: duration,
        warmup: warmup,
        exercises: exercises,
        cooldown: cooldown,
        metrics: {
          totalSets,
          avgReps,
          estimatedCalories
        }
      });
    }
    
    // Extract progression notes
    const progressionRegex = /## PROGRESSION NOTES\s*([\s\S]*?)(?=$)/;
    const progressionMatch = markdown.match(progressionRegex);
    if (progressionMatch) {
      progressionNotes = progressionMatch[1].trim();
    }
    
    // Sort days by day number
    days.sort((a, b) => {
      const dayNumA = parseInt(a.id.replace('day', ''));
      const dayNumB = parseInt(b.id.replace('day', ''));
      return dayNumA - dayNumB;
    });
    
    
    
    return {
      days,
      progressionNotes
    };
  } catch (error) {
    console.error("Error parsing markdown workout plan:", error);
    return fallbackWorkoutPlan();
  }
}

/**
 * Create a fallback workout plan when parsing fails
 */
function fallbackWorkoutPlan() {
  return {
    days: [
      {
        id: 'day1',
        dayName: 'Day 1',
        focus: 'Full Body',
        duration: '45 minutes',
        warmup: ['Light cardio (5 min)', 'Dynamic stretching (3 min)'],
        exercises: [
          {
            name: 'Bodyweight Squats',
            sets: 3,
            reps: '10-12',
            rest: '60 seconds',
            notes: 'Keep your back straight and knees over toes',
            progression: {
              easier: 'Assisted squats holding onto a stable surface',
              harder: 'Add weights or jump squats'
            },
            muscleGroups: ['Quads', 'Glutes', 'Hamstrings']
          }
        ],
        cooldown: ['Static stretching (5 min)'],
        metrics: { totalSets: 3, estimatedCalories: 250, avgReps: 11 }
      }
    ],
    progressionNotes: "Your full workout plan couldn't be displayed properly. Please try refreshing or regenerating the plan."
  };
}

/**
 * Formats duration to ensure consistent format
 * @param {string} duration - Duration string from API
 * @returns {string} - Formatted duration string
 */
const formatDuration = (duration) => {
  if (!duration) return "45 minutes";
  
  // If it's just a number, assume it's minutes
  if (/^\d+$/.test(duration)) {
    return `${duration} minutes`;
  }
  
  // If it already has "minutes", return as is
  if (duration.includes("minute") || duration.includes("min")) {
    return duration;
  }
  
  return duration;
};

/**
 * Format rest time to ensure consistent format
 * @param {string|number} rest - Rest time from API
 * @returns {string} - Formatted rest time string
 */
const formatRestTime = (rest) => {
  if (!rest) return "60 seconds";
  
  // If it's just a number, assume it's seconds
  if (typeof rest === 'number' || /^\d+$/.test(rest)) {
    return `${rest} seconds`;
  }
  
  return rest;
};

/**
 * Calculate exercise difficulty based on sets, reps and other factors
 * @param {Object} exercise - Exercise data
 * @returns {string} - Difficulty level (Beginner, Intermediate, Advanced)
 */
const calculateExerciseDifficulty = (exercise) => {
  // Get average reps if it's a range
  let avgReps = 0;
  if (typeof exercise.reps === 'string') {
    const repsParts = exercise.reps.split('-');
    if (repsParts.length === 2) {
      avgReps = (parseInt(repsParts[0], 10) + parseInt(repsParts[1], 10)) / 2;
    } else {
      avgReps = parseInt(exercise.reps, 10);
    }
  } else if (typeof exercise.reps === 'number') {
    avgReps = exercise.reps;
  }
  
  // Calculate difficulty score
  const difficultyScore = (exercise.sets * avgReps) / 10;
  
  if (difficultyScore < 1.5) return "Beginner";
  if (difficultyScore < 3) return "Intermediate";
  return "Advanced";
};

/**
 * Calculate overall workout intensity
 * @param {Array} exercises - List of exercises
 * @param {string} focus - Workout focus
 * @returns {string} - Intensity level (Low, Moderate, High, Very High)
 */
const calculateWorkoutIntensity = (exercises, focus) => {
  // Calculate average difficulty score
  let totalDifficultyScore = 0;
  
  exercises.forEach(exercise => {
    let avgReps = 0;
    if (typeof exercise.reps === 'string') {
      const repsParts = exercise.reps.split('-');
      if (repsParts.length === 2) {
        avgReps = (parseInt(repsParts[0], 10) + parseInt(repsParts[1], 10)) / 2;
      } else {
        avgReps = parseInt(exercise.reps, 10);
      }
    } else if (typeof exercise.reps === 'number') {
      avgReps = exercise.reps;
    }
    
    totalDifficultyScore += (exercise.sets * avgReps) / 10;
  });
  
  const avgDifficulty = totalDifficultyScore / exercises.length;
  
  // Adjust based on workout focus
  let intensityMultiplier = 1;
  if (focus.toLowerCase().includes('cardio')) intensityMultiplier = 1.3;
  if (focus.toLowerCase().includes('hiit')) intensityMultiplier = 1.5;
  if (focus.toLowerCase().includes('legs')) intensityMultiplier = 1.2;
  
  const finalScore = avgDifficulty * intensityMultiplier;
  
  if (finalScore < 1.5) return "Low";
  if (finalScore < 2.5) return "Moderate";
  if (finalScore < 3.5) return "High";
  return "Very High";
};

/**
 * Extract unique workout types from all days
 * @param {Array} days - Workout days data
 * @returns {Array} - List of unique workout types
 */
const extractWorkoutTypes = (days) => {
  const types = new Set();
  days.forEach(day => {
    if (day.focus) types.add(day.focus);
  });
  return Array.from(types);
};

/**
 * Map numeric day to weekday name
 * @param {number} dayNumber - Day number (1-7)
 * @returns {string} - Weekday name
 */
const mapDayNumberToName = (dayNumber) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  // Adjust for 0-based indexing
  return days[(dayNumber - 1) % 7];
};

/**
 * Calculate average reps from rep ranges
 * @param {Array} exercises - List of exercises
 * @returns {number} - Average reps across all exercises
 */
const calculateAverageReps = (exercises) => {
  if (!exercises.length) return 0;
  
  let totalAvgReps = 0;
  
  exercises.forEach(exercise => {
    // Handle rep ranges like "8-12" or single values like "15"
    if (typeof exercise.reps === 'string') {
      const repsParts = exercise.reps.split('-');
      if (repsParts.length === 2) {
        // It's a range, calculate average
        const min = parseInt(repsParts[0], 10);
        const max = parseInt(repsParts[1], 10);
        if (!isNaN(min) && !isNaN(max)) {
          totalAvgReps += (min + max) / 2;
        }
      } else {
        // It's a single value
        const reps = parseInt(exercise.reps, 10);
        if (!isNaN(reps)) {
          totalAvgReps += reps;
        }
      }
    } else if (typeof exercise.reps === 'number') {
      totalAvgReps += exercise.reps;
    }
  });
  
  return Math.round(totalAvgReps / exercises.length);
};

/**
 * Estimate calories burned based on workout duration and type
 * @param {string} duration - Workout duration
 * @param {string} focus - Workout focus
 * @returns {number} - Estimated calories burned
 */
const estimateCaloriesBurned = (duration, focus) => {
  // Extract minutes from duration string (e.g., "45 minutes" -> 45)
  const durationMatch = String(duration).match(/(\d+)/);
  const minutes = durationMatch ? parseInt(durationMatch[1], 10) : 40; // Default to 40 if parsing fails
  
  // Base calories per minute based on focus type
  let caloriesPerMinute;
  
  const focusLower = focus.toLowerCase();
  
  if (focusLower.includes('leg')) {
    caloriesPerMinute = 9.5; // Higher for leg workouts (larger muscles)
  } else if (focusLower.includes('push')) {
    caloriesPerMinute = 8; // Medium for upper body
  } else if (focusLower.includes('pull')) {
    caloriesPerMinute = 8; // Medium for upper body
  } else if (focusLower.includes('core')) {
    caloriesPerMinute = 7; // Lower for core
  } else if (focusLower.includes('cardio') || focusLower.includes('hiit')) {
    caloriesPerMinute = 11; // Highest for cardio
  } else {
    caloriesPerMinute = 8; // Default
  }
  
  // Calculate total and add a bit of randomization
  const baseCals = minutes * caloriesPerMinute;
  const randomFactor = 0.9 + (Math.random() * 0.2); // Between 0.9 and 1.1
  
  return Math.round(baseCals * randomFactor);
};

/**
 * Get muscle groups targeted by an exercise
 * @param {string} exerciseName - Name of the exercise
 * @param {string} focusDay - Focus of the workout day
 * @returns {Array} - List of muscle groups targeted
 */
const getMuscleGroups = (exerciseName, focusDay) => {
  // This is a simplified mapping - in a real app, you'd have a more comprehensive database
  const exerciseMuscleMap = {
    // Chest exercises
    'Push-ups': ['Chest', 'Shoulders', 'Triceps'],
    'Bench Press': ['Chest', 'Shoulders', 'Triceps'],
    'Dumbbell Flyes': ['Chest'],
    'Incline Press': ['Upper Chest', 'Shoulders'],
    'Decline Press': ['Lower Chest', 'Triceps'],
    'Cable Crossovers': ['Chest'],
    
    // Shoulder exercises
    'Dumbbell Shoulder Press': ['Shoulders', 'Triceps'],
    'Lateral Raises': ['Shoulders'],
    'Front Raises': ['Front Deltoids'],
    'Reverse Flyes': ['Rear Deltoids', 'Upper Back'],
    'Upright Rows': ['Shoulders', 'Upper Traps'],
    'Shrugs': ['Traps'],
    
    // Back exercises
    'Pull-ups': ['Back', 'Biceps'],
    'Lat Pulldowns': ['Lats', 'Biceps'],
    'Bent-over Rows': ['Middle Back', 'Lats', 'Biceps'],
    'Bent-over Dumbbell Rows': ['Back', 'Biceps'],
    'T-Bar Rows': ['Middle Back', 'Lats'],
    'Deadlifts': ['Lower Back', 'Hamstrings', 'Glutes'],
    'Resistance Band Face Pulls': ['Shoulders', 'Upper Back'],
    
    // Arm exercises
    'Bicep Curls': ['Biceps'],
    'Hammer Curls': ['Biceps', 'Forearms'],
    'Tricep Dips': ['Triceps', 'Chest'],
    'Tricep Pushdowns': ['Triceps'],
    'Skull Crushers': ['Triceps'],
    'Wrist Curls': ['Forearms'],
    
    // Leg exercises
    'Bodyweight Squats': ['Quads', 'Glutes', 'Hamstrings'],
    'Barbell Squats': ['Quads', 'Glutes', 'Hamstrings', 'Lower Back'],
    'Lunges': ['Quads', 'Glutes', 'Hamstrings'],
    'Leg Press': ['Quads', 'Glutes', 'Hamstrings'],
    'Leg Extensions': ['Quads'],
    'Leg Curls': ['Hamstrings'],
    'Calf Raises': ['Calves'],
    'Glute Bridges': ['Glutes', 'Hamstrings'],
    
    // Core exercises
    'Crunches': ['Abs'],
    'Planks': ['Abs', 'Lower Back'],
    'Russian Twists': ['Obliques'],
    'Leg Raises': ['Lower Abs'],
    'Mountain Climbers': ['Abs', 'Shoulders'],
    'Bicycle Crunches': ['Abs', 'Obliques']
  };
  
  // If we have a direct mapping, use it
  if (exerciseMuscleMap[exerciseName]) {
    return exerciseMuscleMap[exerciseName];
  }
  
  // Otherwise, make an educated guess based on the focus day
  const focusLower = focusDay.toLowerCase();
  
  if (focusLower.includes('push')) {
    return ['Chest', 'Shoulders', 'Triceps'];
  } else if (focusLower.includes('pull')) {
    return ['Back', 'Biceps'];
  } else if (focusLower.includes('leg')) {
    return ['Quads', 'Hamstrings', 'Glutes'];
  } else if (focusLower.includes('core')) {
    return ['Abs', 'Lower Back'];
  } else if (focusLower.includes('cardio')) {
    return ['Full Body', 'Cardiovascular'];
  } else if (focusLower.includes('upper')) {
    return ['Chest', 'Back', 'Shoulders', 'Arms'];
  } else if (focusLower.includes('lower')) {
    return ['Quads', 'Hamstrings', 'Glutes', 'Calves'];
  } else {
    return ['Multiple muscle groups'];
  }
};