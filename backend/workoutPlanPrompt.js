// Enhanced workout plan prompt generator
export const generateWorkoutPlanPrompt = (userData) => {
  const daysPerWeek = parseInt(userData.days_per_week || 3);
  const preferredDays = userData.preferred_days || [];
  const sessionDuration = userData.session_duration || "30-45 minutes";
  const workoutEnvironments = userData.workout_locations || [];
  const equipmentAccess = userData.equipment_access || [];
  
  if (!userData.healthConditions) {
    if (userData.health_conditions) {
      userData.healthConditions = Array.isArray(userData.health_conditions) 
        ? userData.health_conditions 
        : [userData.health_conditions];
    } else {
      userData.healthConditions = [];
    }
  }
  
  
  if (!userData.movementRestrictions) {
    if (userData.movement_restrictions) {
      userData.movementRestrictions = Array.isArray(userData.movement_restrictions) 
        ? userData.movement_restrictions 
        : [userData.movement_restrictions];
    } else {
      userData.movementRestrictions = [];
    }
  }
  
  const healthConditionsText = userData.healthConditions.length > 0 
    ? userData.healthConditions.join(', ') 
    : "";
    
  const movementRestrictionsText = userData.movementRestrictions.length > 0 
    ? userData.movementRestrictions.join(', ') 
    : "";

  const goalTimeline = userData.goal_timeline || "Within 3-6 months (Moderate)";
  const fitnessLevel = userData.fitness_level || "Intermediate";
  const fitnessGoal = userData.fitness_goal || "General fitness";
  
  // Map session duration to approximate workout time in minutes
  const sessionDurationMap = {
    "15-30 minutes": 25,
    "30-45 minutes": 40,
    "45-60 minutes": 55,
    "60-90 minutes": 75
  };
  
  const workoutMinutes = sessionDurationMap[sessionDuration] || 40;
  
  // Calculate workout intensity based on goal timeline
  const getIntensityLevel = (timeline) => {
    switch(timeline) {
      case "Within 1-2 months (Aggressive)": return "High";
      case "Within 3-6 months (Moderate)": return "Moderate";
      case "Within 6-12 months (Gradual)": return "Moderate-Low";
      case "No specific timeline (Sustainable long-term approach)": return "Variable";
      default: return "Moderate";
    }
  };
  
  const intensityLevel = getIntensityLevel(goalTimeline);
  
  // Determine workout style based on equipment access and environment
  const determineWorkoutStyle = () => {
    if (equipmentAccess.includes("None/minimal equipment") || 
        workoutEnvironments.every(env => env !== "Gym")) {
      return "Bodyweight-focused";
    } else if (equipmentAccess.includes("Free weights") && 
              equipmentAccess.includes("Weight machines")) {
      return "Traditional strength training";
    } else if (equipmentAccess.includes("Cardio equipment")) {
      return "Cardio-strength blend";
    } else if (equipmentAccess.includes("Resistance bands/suspension trainers")) {
      return "Resistance training";
    } else {
      return "Mixed modality";
    }
  };
  
  const workoutStyle = determineWorkoutStyle();
  
  // Create workout split based on days per week
  const generateWorkoutSplit = (days) => {
    switch(days) {
      case 1: return ["Full Body"];
      case 2: return ["Upper Body", "Lower Body"];
      case 3: return ["Push", "Pull", "Legs"];
      case 4: return ["Upper Body", "Lower Body", "Upper Body", "Lower Body"];
      case 5: return ["Push", "Pull", "Legs", "Upper Body", "Lower Body"];
      case 6: return ["Push", "Pull", "Legs", "Push", "Pull", "Legs"];
      case 7: return ["Push", "Pull", "Legs", "Upper Body", "Lower Body", "Cardio", "Active Recovery"];
      default: return ["Full Body", "Full Body", "Full Body"];
    }
  };
  
  const workoutSplit = generateWorkoutSplit(daysPerWeek);
  
  // Format equipment in a more readable way for the prompt
  const formatEquipment = (equipment) => {
    if (equipment.length === 0) return "No equipment";
    if (equipment.includes("None/minimal equipment")) return "Bodyweight exercises only";
    return equipment.join(", ");
  };
  
  const equipmentDescription = formatEquipment(equipmentAccess);
  
  // Generate the detailed prompt with simplified output format
  const healthSection = healthConditionsText 
    ? `Health considerations: ${healthConditionsText}.` 
    : "No specific health considerations.";
    
  const restrictionsSection = movementRestrictionsText
    ? `Movement restrictions: ${movementRestrictionsText}.`
    : "No specific movement restrictions.";
  
  return `
You are a certified personal trainer creating a 1-week workout plan that can be repeated. Return a VALID JSON OBJECT ONLY with NO text outside the JSON structure. DO NOT use code blocks, markdown, or backticks.

### USER PROFILE:
- Fitness goal: ${fitnessGoal}
- Fitness level: ${fitnessLevel}
- Timeline: ${goalTimeline}
- Intensity level: ${intensityLevel}
- ${healthSection}
- ${restrictionsSection}

### WORKOUT STRUCTURE:
- Days per week: ${daysPerWeek}
- Preferred days: ${preferredDays.join(', ') || "Flexible"}
- Session duration: ${sessionDuration}
- Workout style: ${workoutStyle}
- Workout split: ${workoutSplit.join(', ')}
- Training environments: ${workoutEnvironments.join(', ')}
- Available equipment: ${equipmentDescription}

### WORKOUT PLANNING REQUIREMENTS:
1) Create a comprehensive 1-week plan with exercises appropriate for the user's fitness level
2) Structure each workout with warm-up, main exercises, and cool-down components
3) Include appropriate sets, reps, and rest periods for each exercise
4) Account for proper recovery between similar muscle groups
5) Ensure workouts are realistic for the specified time duration
6) Include clear instructions and form cues for each exercise
7) Avoid any movements specified in the restrictions
8) Design exercises with progression options (easier and harder variations)

### SPECIAL CONSIDERATIONS:
${intensityLevel === 'High' ? '- Include higher intensity work with appropriate recovery\n- Focus on efficient, compound movements\n- Include optional intensity techniques for advanced users' : ''}
${intensityLevel === 'Moderate' ? '- Balance challenging work with adequate recovery\n- Mix compound and isolation exercises\n- Include progressive overload each week' : ''}
${intensityLevel === 'Moderate-Low' ? '- Emphasize proper form and technique\n- Start with lower volume and gradually increase\n- Include more rest between challenging sets' : ''}
${intensityLevel === 'Variable' ? '- Design a sustainable approach with varied intensity\n- Include both challenging and recovery-focused sessions\n- Focus on enjoyable, sustainable exercise selection' : ''}
${fitnessLevel === 'Beginner' ? '- Focus on foundational movement patterns\n- Include detailed form instructions\n- Start with lower volume and emphasize technique' : ''}
${fitnessLevel === 'Advanced' ? '- Include more advanced exercise variations\n- Consider periodization within the 2-week plan\n- Include options for intensity techniques' : ''}
${workoutEnvironments.includes('Home') ? '- Ensure exercises are apartment/home-friendly (low noise, minimal space requirements)\n- Provide alternatives for equipment limitations' : ''}

### OUTPUT FORMAT - IMPORTANT:
Return a JSON object WITHOUT code blocks, backticks, or markdown formatting.

1) The JSON should contain:
   - "workout_plan": object containing the weekly plan
   
2) The workout plan should include:
   - "days": array of daily workout objects
   - "progression_notes": string with guidance on how to progress the plan in subsequent weeks
   
3) Each daily workout must contain:
   - "day": integer (1-7)
   - "focus": string (e.g., "Push", "Pull", "Legs", "Full Body")
   - "duration": string (approximate workout time)
   - "warmup": array of STRINGS describing warmup activities (3-5 minutes total)
   - "exercises": array of exercise objects
   - "cooldown": array of STRINGS describing cooldown/stretching (3-5 minutes total)
   
4) Each exercise object must include:
   - "name": string (exercise name)
   - "sets": integer
   - "reps": string (can be a range or time duration for some exercises)
   - "rest": string (rest period)
   - "notes": string (form cues, alternatives, or special instructions)
   - "progression": object with "easier" and "harder" string options for progression

EXAMPLE FORMAT:
{
  "workout_plan": {
    "days": [
      {
        "day": 1,
        "focus": "Push",
        "duration": "40 minutes",
        "warmup": [
          "5 minutes light cardio (jumping jacks, high knees, jogging in place)",
          "10 arm circles each direction",
          "10 body weight squats"
        ],
        "exercises": [
          {
            "name": "Push-ups",
            "sets": 3,
            "reps": "8-12",
            "rest": "60 seconds",
            "notes": "Keep core tight, lower chest to floor with elbows at 45° angle",
            "progression": {
              "easier": "Wall push-ups or knee push-ups",
              "harder": "Decline push-ups or add resistance band"
            }
          },
          {
            "name": "Dumbbell Shoulder Press",
            "sets": 3,
            "reps": "10-12",
            "rest": "60-90 seconds",
            "notes": "Start with weights at shoulder level, press overhead without locking elbows",
            "progression": {
              "easier": "Seated shoulder press with lighter weights",
              "harder": "Standing single-arm press or increase weight"
            }
          }
        ],
        "cooldown": [
          "Chest stretch (30 seconds per side)",
          "Tricep stretch (30 seconds per side)",
          "Child's pose (30 seconds)"
        ]
      }
    ],
    "progression_notes": "To progress this plan, first increase reps to the upper end of ranges, then add sets, then increase resistance. Aim to increase either reps, sets, or resistance every 1-2 weeks."
  }
}

Remember: Return ONLY valid JSON with no explanations, backticks, or markdown.
`;
};

export const formatWorkoutPlan = (workoutPlanData) => {
  try {
    
    let plan;
    if (typeof workoutPlanData === 'string') {
      if (workoutPlanData.includes('```json')) {
        const jsonMatch = workoutPlanData.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          plan = JSON.parse(jsonMatch[1].trim());
        } else {
          throw new Error("Could not extract JSON from code block");
        }
      } else {
        // Try to parse the whole string as JSON
        plan = JSON.parse(workoutPlanData);
      }
    } else {
      // It's already an object
      plan = workoutPlanData;
    }
    
    // Check if the plan has the expected structure
    if (!plan || !plan.workout_plan || !Array.isArray(plan.workout_plan.days)) {
      console.error("Unexpected plan structure:", plan);
      
      // Attempt to handle a direct array format if that's what was returned
      if (Array.isArray(plan.days)) {
        plan = { workout_plan: plan };
      } else if (plan.workout_plan && !Array.isArray(plan.workout_plan.days) && plan.workout_plan.days) {
        const daysArray = Object.values(plan.workout_plan.days);
        plan.workout_plan.days = daysArray;
      } else {
        throw new Error("Plan data missing required structure");
      }
    }
    
    let formattedOutput = "";
    
    const plan_data = plan.workout_plan;
    formattedOutput += `\n## WEEKLY WORKOUT PLAN\n\n`;
      
    plan_data.days.forEach(day => {
      formattedOutput += `### DAY ${day.day}: ${day.focus.toUpperCase()} (${day.duration})\n\n`;
      
      // Warmup section
      formattedOutput += "**WARM-UP:**\n";
      day.warmup.forEach(item => {
        formattedOutput += `- ${item}\n`;
      });
      formattedOutput += "\n";
      
      // Main exercises
      formattedOutput += "**MAIN WORKOUT:**\n";
      day.exercises.forEach(exercise => {
        formattedOutput += `- **${exercise.name}**: ${exercise.sets} sets × ${exercise.reps}`;
        formattedOutput += `\n  Rest: ${exercise.rest}`;
        formattedOutput += `\n  _${exercise.notes}_`;
        formattedOutput += `\n  Easier: ${exercise.progression.easier}`;
        formattedOutput += `\n  Harder: ${exercise.progression.harder}\n\n`;
      });
      
      // Cooldown section
      formattedOutput += "**COOL-DOWN:**\n";
      day.cooldown.forEach(item => {
        formattedOutput += `- ${item}\n`;
      });
      formattedOutput += "\n";
    });
    
    // Add progression notes
    formattedOutput += "\n## PROGRESSION NOTES\n\n";
    formattedOutput += plan_data.progression_notes || "Progress by increasing reps, then sets, then weights as you get stronger.";
    
    return formattedOutput;
  } catch (error) {
    console.error("Error formatting workout plan:", error);
    console.error("Raw data that caused error:", workoutPlanData);
    
    // Return the raw plan data instead of an error message
    if (typeof workoutPlanData === 'string') {
      return workoutPlanData;
    } else {
      return JSON.stringify(workoutPlanData, null, 2);
    }
  }
};

