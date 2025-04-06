// Enhanced meal plan prompt generator
export const generateMealPlanPrompt = (userData) => {
  // Extracting data from request
  const totalCalories = parseInt(userData.calories || 0);
  const totalProtein = parseInt(userData.protein || 0);
  const totalCarbs = parseInt(userData.carbs || 0);
  const totalFats = parseInt(userData.fats || 0);
  const mealsPerDay = parseInt(userData.meals_per_day || 3);
  const dietType = userData.diet_type || "non-veg";
  const foodRestrictions = userData.food_restrictions || [];
  const allergies = userData.allergies || [];
  const goal = userData.goal || "maintenance";

  // Handling meal timings based on meal count
  const mealTimingMap = {
    2: ["8:00 AM", "6:00 PM"],
    3: ["8:00 AM", "1:00 PM", "7:00 PM"],
    4: ["8:00 AM", "12:00 PM", "4:00 PM", "8:00 PM"],
    5: ["7:00 AM", "10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM"],
    6: ["7:00 AM", "9:30 AM", "12:00 PM", "2:30 PM", "5:00 PM", "8:00 PM"]
  };

  const mealTimings = mealTimingMap[mealsPerDay] || [];

  // Calculate meal types based on meal count
  const getMealTypes = (count) => {
    switch (count) {
      case 2: return ["breakfast", "dinner"];
      case 3: return ["breakfast", "lunch", "dinner"];
      case 4: return ["breakfast", "lunch", "snack", "dinner"];
      case 5: return ["breakfast", "morning snack", "lunch", "afternoon snack", "dinner"];
      case 6: return ["breakfast", "morning snack", "lunch", "afternoon snack", "dinner", "evening snack"];
      default: return ["breakfast", "lunch", "dinner"];
    }
  };

  const mealTypes = getMealTypes(mealsPerDay);

  // Dynamic meal distribution based on goal and meal count
  let mealRatios;
  if (goal === "weight_loss") {
    // For weight loss, slightly lighter dinner
    mealRatios = mealsPerDay === 3
      ? [0.35, 0.35, 0.30]
      : mealsPerDay === 4
        ? [0.30, 0.25, 0.15, 0.30]
        : Array(mealsPerDay).fill(1.0 / mealsPerDay);
  } else if (goal === "muscle_gain") {
    // For muscle gain, prioritize post-workout and breakfast protein
    mealRatios = mealsPerDay === 3
      ? [0.33, 0.37, 0.30]
      : mealsPerDay === 4
        ? [0.30, 0.25, 0.15, 0.30]
        : Array(mealsPerDay).fill(1.0 / mealsPerDay);
  } else {
    // For maintenance or other goals, distribute evenly
    mealRatios = Array(mealsPerDay).fill(1.0 / mealsPerDay);
  }

  // Format macros for each meal to include in the prompt
  const mealMacros = mealRatios.map((ratio, i) => ({
    mealType: mealTypes[i],
    timing: mealTimings[i] || `Meal ${i + 1}`,
    calories: Math.round(totalCalories * ratio),
    protein: Math.round(totalProtein * ratio),
    carbs: Math.round(totalCarbs * ratio),
    fats: Math.round(totalFats * ratio)
  }));

  // Generate the detailed prompt with simplified output format
  return `
You are a nutritionist creating a 3-day meal plan. Return a VALID JSON OBJECT ONLY with NO text outside the JSON structure. DO NOT use code blocks, markdown, or backticks.

### USER PROFILE:
- Goal: ${goal}
- Daily targets: ${totalCalories} calories, ${totalProtein}g protein, ${totalCarbs}g carbs, ${totalFats}g fats
- Diet type: ${dietType}
- Food restrictions: ${foodRestrictions.join(', ')}
- Allergies: ${allergies.join(', ')}

### MEAL STRUCTURE:
- Meals per day: ${mealsPerDay}
- Daily meal distribution:
${mealMacros.map(meal => `  * ${meal.mealType} (${meal.timing}): ~${meal.calories} calories, ${meal.protein}g protein, ${meal.carbs}g carbs, ${meal.fats}g fats`).join('\n')}

### MEAL PLANNING REQUIREMENTS:
1) Create a 3-day plan with realistic, culturally appropriate foods for each meal type
2) Strictly adhere to the daily calorie and macro targets (±5% tolerance)
3) Each meal should be appropriate for its type and time of day
4) No dietary restrictions violations or allergens
5) Include variety across days while maintaining some staple foods
6) Focus on commonly available, affordable ingredients with specific quantities

### GUIDELINES BY MEAL TYPE:
- Breakfast: Appropriate morning foods (eggs, oatmeal, yogurt, toast, fruit)
- Lunch: Practical options that can be packed or prepared quickly
- Dinner: Can be more elaborate but still realistic for everyday cooking
- Snacks: Convenient, portable, satisfying options

### SPECIAL CONSIDERATIONS:
${goal === 'weight_loss' ? '- Include foods with high satiety to manage hunger\n- Emphasize protein and fiber-rich foods\n- Include low-calorie, high-volume foods' : ''}
${goal === 'muscle_gain' ? '- Prioritize complete protein sources\n- Include nutrient-dense carb sources for energy\n- Ensure adequate healthy fats for hormone production' : ''}
${dietType === 'vegetarian' ? '- Ensure complete proteins through complementary plant sources\n- Include diverse plant proteins (legumes, tofu, tempeh, seitan, dairy)' : ''}
${dietType === 'vegan' ? '- Ensure complete proteins through complementary plant sources\n- Include B12, iron, and omega-3 rich foods\n- Focus on diverse plant proteins (legumes, tofu, tempeh, seitan)' : ''}

### OUTPUT FORMAT - IMPORTANT:
Return a JSON object WITHOUT code blocks, backticks, or markdown formatting.

1) Each day must have:
   - "day": integer (1-3)
   - "meals": array of meal objects 
   - "daily_totals": object with calories, protein, carbs, and fats

2) Each meal must contain:
   - "meal_type": string (${mealTypes.map(t => `"${t}"`).join(', ')})
   - "time": string (meal timing)
   - "foods": array of STRINGS ONLY, formatted exactly as "item, quantity, calories, protein, carbs, fats"
     - Example: "Chicken breast, 100g, 165 cal, 31g protein, 0g carbs, 3.6g fats"

3) Do NOT create complex nested food objects. Use simple strings as shown above.

EXAMPLE FORMAT:
{
  "meal_plan": [
    {
      "day": 1,
      "meals": [
        {
          "meal_type": "breakfast",
          "time": "8:00 AM",
          "foods": [
            "Greek yogurt, 1 cup, 140 cal, 20g protein, 8g carbs, 0g fats",
            "Blueberries, 1/2 cup, 42 cal, 0.5g protein, 10.5g carbs, 0.2g fats"
          ]
        }
      ],
      "daily_totals": {
        "calories": 1802,
        "protein": 135,
        "carbs": 180,
        "fats": 60
      }
    }
  ]
}

Remember: Return ONLY valid JSON with no explanations, backticks, or markdown.
`;
};

/**
 * Format the meal plan data into a more readable structure
 * @param {Object} mealPlanData - The raw meal plan data from OpenAI
 * @returns {Object} Formatted meal plan with human-readable structure
 */
export const formatMealPlan = (mealPlanData) => {
  try {
    // If the data is already in the expected format, just return it
    if (!mealPlanData || !mealPlanData.meal_plan || !Array.isArray(mealPlanData.meal_plan)) {
      return mealPlanData;
    }

    // Create a more user-friendly structure
    const formattedPlan = {
      summary: {
        days: mealPlanData.meal_plan.length,
        meals_per_day: mealPlanData.meal_plan[0]?.meals?.length || 0,
        avg_daily_calories: Math.round(
          mealPlanData.meal_plan.reduce((sum, day) => sum + (day.daily_totals?.calories || 0), 0) /
          mealPlanData.meal_plan.length
        )
      },
      days: mealPlanData.meal_plan.map(day => {
        return {
          day: day.day,
          meals: day.meals.map(meal => {
            // Parse the food strings into structured objects
            const formattedFoods = meal.foods.map(foodStr => {
              // Example format: "Chicken breast, 100g, 165 cal, 31g protein, 0g carbs, 3.6g fats"
              const parts = foodStr.split(',').map(part => part.trim());
              if (parts.length >= 6) {
                return {
                  item: parts[0],
                  quantity: parts[1],
                  nutrients: {
                    calories: parts[2],
                    protein: parts[3],
                    carbs: parts[4],
                    fats: parts[5]
                  }
                };
              } else {
                // If the format doesn't match expectations, return as is
                return { description: foodStr };
              }
            });

            return {
              type: meal.meal_type,
              time: meal.time,
              foods: formattedFoods
            };
          }),
          totals: day.daily_totals
        };
      })
    };

    return formattedPlan;
  } catch (error) {
    console.error("Error formatting meal plan:", error);
    return mealPlanData; // Return original data if formatting fails
  }
};