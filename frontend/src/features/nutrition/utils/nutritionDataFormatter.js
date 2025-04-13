/**
 * Transforms API response data into UI-friendly format
 * Contains helper functions for data formatting
 */

/**
 * Transforms the API diet plan data into a format suitable for the UI
 * @param {Object} apiData - Diet plan data from the API
 * @returns {Object} - Transformed diet plan data
 */
export const transformDietPlanData = (apiData) => {
  // Check if we have valid data
  if (!apiData || !apiData.meal_plan) {
    console.error("Invalid diet plan data:", apiData);
  }

  try {
    
    
    // Initialize result structure
    const transformedData = {};
    
    // Handle different response structures based on the data format
    let mealPlanData;
    
    // Case 1: meal_plan contains days array (new format from formatting function)
    if (typeof apiData.meal_plan === 'object' && apiData.meal_plan.days) {
      
      mealPlanData = apiData.meal_plan.days;
    } 
    // Case 2: meal_plan is an array directly (old format)
    else if (Array.isArray(apiData.meal_plan)) {
      
      mealPlanData = apiData.meal_plan;
    }
    // Case 3: result stored in formatted_plan
    else if (apiData.formatted_plan && apiData.formatted_plan.days) {
      
      mealPlanData = apiData.formatted_plan.days;
    }
    // Error case - no valid data structure
    else {
      console.error("Unrecognized meal plan data structure:", apiData.meal_plan);
    }
    
    // Process each day's data
    mealPlanData.forEach(day => {
      const dayKey = `day${day.day}`;
      
      // Keep track of original food strings by meal type
      const originalFoods = {};
      
      // Transform meals
      const meals = day.meals.map(meal => {
        // Extract meal type - handle both formats
        const mealType = meal.type || meal.meal_type;
        
        if (!mealType) {
          console.warn("Meal missing type:", meal);
        }
        
        // Generate descriptive meal name
        const mealName = generateMealName(meal);
        
        // Generate meal description
        const description = generateMealDescription(meal);
        
        // Handle food items - might be array of strings or objects
        const foodItems = Array.isArray(meal.foods) 
          ? meal.foods 
          : [];
        
        // Calculate meal totals - use existing or compute
        const mealTotals = 
          (meal.macros || meal.nutrients) 
          ? { 
              calories: parseInt(meal.macros?.calories || meal.nutrients?.calories || 0),
              protein: parseInt(meal.macros?.protein || meal.nutrients?.protein || 0),
              carbs: parseInt(meal.macros?.carbs || meal.nutrients?.carbs || 0),
              fat: parseInt(meal.macros?.fat || meal.macros?.fats || meal.nutrients?.fat || meal.nutrients?.fats || 0)
            }
          : calculateMealTotals(foodItems);
        
        // Extract food items in a readable format
        const items = extractFoodItems(foodItems);
        
        // Store original food strings for reference
        originalFoods[mealType] = foodItems;
        
        return {
          type: capitalizeFirstLetter(mealType || "meal"),
          time: meal.time || getDefaultMealTime(mealType),
          name: mealName,
          description: description,
          calories: Math.round(mealTotals.calories),
          protein: Math.round(mealTotals.protein),
          carbs: Math.round(mealTotals.carbs),
          fat: Math.round(mealTotals.fat),
          items: items
        };
      });
      
      // Get daily totals - from data or calculate from meals
      const dailyTotals = day.totals || day.daily_totals || calculateDailyTotals(meals);
      
      transformedData[dayKey] = {
        title: `Day ${day.day}`,
        meals: meals,
        dailyTotals: dailyTotals,
        originalFoods: originalFoods // Add this to preserve original data
      };
    });
    
    return transformedData;
  } catch (error) {
    console.error("Error transforming diet plan data:", error);
  }
};

/**
 * Generates a dynamic, descriptive name for a meal based on its type and content
 */
const generateMealName = (meal) => {
  const mealType = meal.type || meal.meal_type || '';
  
  // Instead of hard-coded names, generate dynamic names based on meal type and content
  const typeCapitalized = capitalizeFirstLetter(mealType);
  
  // Get main protein or ingredient if available
  let mainIngredient = '';
  if (Array.isArray(meal.foods) && meal.foods.length > 0) {
    // Try to find the main protein or key ingredient
    const foods = meal.foods.map(f => typeof f === 'string' ? f : f.item || f.description || '');
    
    // Look for key proteins first
    const proteins = ['chicken', 'beef', 'fish', 'salmon', 'tofu', 'eggs', 'turkey'];
    const foundProtein = proteins.find(protein => 
      foods.some(food => food.toLowerCase().includes(protein))
    );
    
    // If protein found, use it
    if (foundProtein) {
      mainIngredient = capitalizeFirstLetter(foundProtein);
    } 
    // Otherwise use the first food item
    else if (foods[0]) {
      // Extract just the main food name, not quantities
      const firstFood = foods[0].split(',')[0].trim();
      // Remove quantities like "1 cup" from the beginning
      mainIngredient = firstFood.replace(/^[\d/]+([\s\w]+)?\s+/, '');
      mainIngredient = capitalizeFirstLetter(mainIngredient);
    }
  }
  
  // Create a more generic but still descriptive name
  if (mainIngredient) {
    return `${mainIngredient}-Based ${typeCapitalized}`;
  }
  
  // Default names by meal type
  switch (mealType.toLowerCase()) {
    case 'breakfast': return 'Balanced Breakfast';
    case 'lunch': return 'Nutrient-Rich Lunch';
    case 'dinner': return 'Complete Dinner';
    case 'snack': return 'Healthy Snack';
    default: return `${typeCapitalized} Meal`;
  }
};

/**
 * Generates a description for a meal based on its type
 */
const generateMealDescription = (meal) => {
  const mealType = (meal.type || meal.meal_type || '').toLowerCase();
  
  switch (mealType) {
    case 'breakfast':
      return 'A nutritious morning meal to kickstart your day with energy and focus';
    case 'lunch':
      return 'Balanced midday meal with protein and complex carbs to sustain energy levels';
    case 'dinner':
      return 'Wholesome evening meal with lean protein and vegetables for recovery and repair';
    case 'snack':
      return 'Strategic snack to maintain energy and support your fitness goals';
    default:
      return 'Balanced meal with optimal macronutrient distribution';
  }
};

/**
 * Gets a default time for a meal type
 */
const getDefaultMealTime = (mealType) => {
  if (!mealType) return '12:00 PM';
  
  const type = mealType.toLowerCase();
  if (type.includes('breakfast')) return '8:00 AM';
  if (type.includes('lunch')) return '12:30 PM';
  if (type.includes('dinner')) return '7:00 PM';
  if (type.includes('snack')) {
    if (type.includes('morning')) return '10:00 AM';
    if (type.includes('afternoon')) return '3:30 PM';
    return '3:30 PM';
  }
  return '12:00 PM';
};

/**
 * Calculates the nutritional totals for a meal based on its foods
 */
const calculateMealTotals = (foods) => {
  if (!Array.isArray(foods)) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
  
  return foods.reduce((totals, food) => {
    // Handle if food is an object with nutrients
    if (typeof food === 'object' && food.nutrients) {
      const nutrients = food.nutrients;
      // Extract number values from strings like "165 cal"
      const calories = parseInt(nutrients.calories) || 0;
      const protein = parseInt(nutrients.protein) || 0;
      const carbs = parseInt(nutrients.carbs) || 0;
      const fats = parseInt(nutrients.fats || nutrients.fat) || 0;
      
      totals.calories += calories;
      totals.protein += protein;
      totals.carbs += carbs;
      totals.fat += fats;
      return totals;
    }
    
    // Handle string format
    if (typeof food === 'string') {
      // Extract nutritional values using regex
      const calorieMatch = food.match(/(\d+(?:\.\d+)?)\s*cal/);
      const proteinMatch = food.match(/(\d+(?:\.\d+)?)g\s*protein/);
      const carbsMatch = food.match(/(\d+(?:\.\d+)?)g\s*carbs/);
      const fatsMatch = food.match(/(\d+(?:\.\d+)?)g\s*fats?/);
      
      if (calorieMatch) totals.calories += parseFloat(calorieMatch[1]);
      if (proteinMatch) totals.protein += parseFloat(proteinMatch[1]);
      if (carbsMatch) totals.carbs += parseFloat(carbsMatch[1]);
      if (fatsMatch) totals.fat += parseFloat(fatsMatch[1]);
    }
    
    return totals;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
};

/**
 * Extracts food items in a readable format
 */
const extractFoodItems = (foods) => {
  if (!Array.isArray(foods)) {
    return [];
  }
  
  return foods.map(food => {
    // If food is an object with item property
    if (typeof food === 'object' && food.item) {
      return food.item;
    }
    
    // If food is an object with description property
    if (typeof food === 'object' && food.description) {
      return food.description;
    }
    
    // If food is a string
    if (typeof food === 'string') {
      // Just get the first part (the food name) before the comma and nutritional info
      const foodName = food.split(',')[0].trim();
      
      // Try to extract the amount if present
      const amountMatch = foodName.match(/([\d/]+\s*[a-zA-Z]+|[\d/]+)\s(.+)/);
      
      if (amountMatch) {
        return `${amountMatch[2]}, ${amountMatch[1]}`;
      }
      
      return foodName;
    }
    
    return "Unknown food item";
  });
};

/**
 * Calculates daily totals from meal data
 */
const calculateDailyTotals = (meals) => {
  return meals.reduce((totals, meal) => {
    totals.calories += meal.calories || 0;
    totals.protein += meal.protein || 0;
    totals.carbs += meal.carbs || 0;
    totals.fats += meal.fat || 0;
    return totals;
  }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
};

/**
 * Capitalizes the first letter of a string
 */
const capitalizeFirstLetter = (string) => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};