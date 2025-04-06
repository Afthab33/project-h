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
    return createDefaultDietPlan();
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
      return createDefaultDietPlan();
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
    return createDefaultDietPlan();
  }
};

/**
 * Creates a default diet plan structure when no valid data is available
 */
const createDefaultDietPlan = () => {
  return {
    day1: {
      title: 'Default Plan',
      meals: [
        {
          type: 'Breakfast',
          name: 'Default Breakfast',
          description: 'A nutritious morning meal to kickstart your day',
          time: '8:00 AM',
          calories: 500,
          protein: 25,
          carbs: 60,
          fat: 15,
          items: ['Oatmeal with berries', 'Greek yogurt']
        },
        {
          type: 'Lunch',
          name: 'Default Lunch',
          description: 'Balanced midday meal with protein and complex carbs',
          time: '12:30 PM',
          calories: 600,
          protein: 30,
          carbs: 65,
          fat: 20,
          items: ['Grilled chicken', 'Brown rice', 'Mixed vegetables']
        },
        {
          type: 'Dinner',
          name: 'Default Dinner',
          description: 'Wholesome evening meal with lean protein',
          time: '7:00 PM',
          calories: 550,
          protein: 35,
          carbs: 45,
          fat: 20,
          items: ['Grilled fish', 'Quinoa', 'Steamed vegetables']
        }
      ],
      dailyTotals: {
        calories: 1650,
        protein: 90,
        carbs: 170,
        fat: 55
      },
      originalFoods: {}
    }
  };
};

/**
 * Generates a descriptive name for a meal based on its contents
 */
const generateMealName = (meal) => {
  const mealType = meal.type || meal.meal_type || '';
  let foodItems = [];
  
  // Handle different data structures
  if (Array.isArray(meal.foods)) {
    foodItems = meal.foods.map(food => {
      if (typeof food === 'string') {
        return food.split(',')[0].trim();
      } else if (food.item) {
        return food.item;
      } else if (food.description) {
        return food.description;
      }
      return '';
    });
  }
  
  switch (mealType.toLowerCase()) {
    case 'breakfast':
      if (foodItems.some(name => name.toLowerCase().includes('oatmeal'))) {
        return 'Oatmeal Breakfast Bowl';
      } else if (foodItems.some(name => name.toLowerCase().includes('egg'))) {
        return 'Protein-Rich Egg Breakfast';
      } else if (foodItems.some(name => name.toLowerCase().includes('pancake'))) {
        return 'Pancakes with Greek Yogurt';
      } else if (foodItems.some(name => name.toLowerCase().includes('toast'))) {
        return 'Whole Grain Toast Breakfast';
      }
      return 'Nutritious Breakfast';
      
    case 'lunch':
      if (foodItems.some(name => name.toLowerCase().includes('chicken'))) {
        return 'Grilled Chicken Lunch Bowl';
      } else if (foodItems.some(name => name.toLowerCase().includes('turkey'))) {
        return 'Lean Turkey Protein Bowl';
      } else if (foodItems.some(name => name.toLowerCase().includes('quinoa'))) {
        return 'Quinoa Power Bowl';
      } else if (foodItems.some(name => name.toLowerCase().includes('salad'))) {
        return 'Fresh Protein Salad';
      }
      return 'Balanced Lunch';
      
    case 'dinner':
      if (foodItems.some(name => name.toLowerCase().includes('salmon'))) {
        return 'Omega-Rich Salmon Dinner';
      } else if (foodItems.some(name => name.toLowerCase().includes('beef'))) {
        return 'Steak with Sweet Potato';
      } else if (foodItems.some(name => name.toLowerCase().includes('fish'))) {
        return 'Grilled Fish with Vegetables';
      }
      return 'Balanced Dinner Plate';
      
    case 'snack':
      if (foodItems.some(name => name.toLowerCase().includes('protein'))) {
        return 'Protein Boost Snack';
      } else if (foodItems.some(name => name.toLowerCase().includes('yogurt'))) {
        return 'Greek Yogurt with Berries';
      } else if (foodItems.some(name => name.toLowerCase().includes('cottage'))) {
        return 'Protein-Rich Cottage Cheese';
      }
      return 'Nutritious Snack';
      
    default:
      return 'Balanced Meal';
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