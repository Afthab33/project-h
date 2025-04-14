/* Component that collects dietary preferences from the user */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Utensils, Apple, CircleCheckBig, ChevronRight, ChevronLeft } from 'lucide-react';

const DietQuestionnaire = ({ userData, healthMetrics, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    dietType: 'balanced',
    allergies: [],
    foodRestrictions: [],
    mealsPerDay: 3,
    snacks: true,
    mealPrepPreference: 'flexible',
    guidanceType: 'flexible',
    otherAllergies: '',
    otherRestrictions: '',
    otherDiet: '',
    goal: mapGoalFromPrimaryGoal(userData.primaryGoal)
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map from primaryGoal to diet goal format
  function mapGoalFromPrimaryGoal(primaryGoal) {
    if (!primaryGoal) return 'maintenance';
    
    switch (primaryGoal.toLowerCase()) {
      case 'lose_weight':
        return 'weight_loss';
      case 'gain_muscle':
        return 'muscle_gain';
      case 'maintain_weight':
        return 'maintenance';
      case 'improve_endurance':
        return 'performance';
      case 'general_wellness':
        return 'wellness';
      default:
        return 'maintenance';
    }
  }

  // Handle input changes for different field types
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Special handler for multi-select options (checkboxes)
  const handleMultiSelectChange = (item, field) => {
    setFormData(prev => {
      const currentItems = [...(prev[field] || [])];
      
      if (currentItems.includes(item)) {
        return { ...prev, [field]: currentItems.filter(i => i !== item) };
      } else {
        return { ...prev, [field]: [...currentItems, item] };
      }
    });
  };

  // Handle select components from Shadcn UI
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Navigate between steps
  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  // Handle diet preferences submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    setIsSubmitting(true);
    try {
      // Add validation
      if (!formData.dietType) {
        // Show error - could use toast or form validation
        console.error("Please select a diet type");
        return;
      }
      
      // Process any "other" fields
      const processedData = { ...formData };
      
      if (formData.dietType === 'other' && formData.otherDiet) {
        processedData.dietType = formData.otherDiet;
      }
      
      // Add "other" allergies if specified
      if (formData.otherAllergies) {
        const otherAllergiesArray = formData.otherAllergies
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0);
        
        processedData.allergies = [
          ...formData.allergies,
          ...otherAllergiesArray
        ];
      }
      
      // Add "other" restrictions if specified
      if (formData.otherRestrictions) {
        const otherRestrictionsArray = formData.otherRestrictions
          .split(',')
          .map(item => item.trim())
          .filter(item => item.length > 0);
        
        processedData.foodRestrictions = [
          ...formData.foodRestrictions,
          ...otherRestrictionsArray
        ];
      }

      const dietInputData = {
        goal: processedData.goal,
        calories: healthMetrics.calorieTarget || 2000,
        protein: healthMetrics.macros?.protein || 150,
        carbs: healthMetrics.macros?.carbs || 200,
        fats: healthMetrics.macros?.fat || 70,
        diet_type: processedData.dietType,
        meals_per_day: processedData.mealsPerDay,
        food_restrictions: processedData.foodRestrictions,
        allergies: processedData.allergies,
        snacks: processedData.snacks,
        meal_prep_preference: processedData.mealPrepPreference,
        guidance_type: processedData.guidanceType
      };
      
      
      await onSubmit(dietInputData);
      
    } catch (error) {
      console.error("❌ Error in diet questionnaire submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto overflow-hidden">
      <div className="h-2 bg-[#3E7B27] w-full"></div>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center">
          <Utensils className="h-5 w-5 mr-2 text-[#3E7B27]" />
          Nutrition Preferences
        </CardTitle>
        <CardDescription>
          Tell us about your dietary needs to create your personalized nutrition plan
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit}>
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              {[1, 2, 3].map(num => (
                <div 
                  key={num}
                  className={`flex items-center ${num > 1 ? 'ml-2' : ''}`}
                >
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step >= num 
                        ? 'bg-[#3E7B27] text-white' 
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {step > num ? <CircleCheckBig className="h-5 w-5" /> : num}
                  </div>
                  {num < 3 && (
                    <div 
                      className={`w-6 h-1 ${
                        step > num ? 'bg-[#3E7B27]' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
            <span className="text-sm text-gray-500">Step {step} of 3</span>
          </div>
          
          {/* Step 1: Dietary Pattern */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Do you follow any specific dietary pattern?</Label>
                <RadioGroup 
                  value={formData.dietType} 
                  onValueChange={value => handleSelectChange('dietType', value)}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="balanced" id="balanced" />
                    <Label htmlFor="balanced" className="flex-1 cursor-pointer">No specific diet</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="vegetarian" id="vegetarian" />
                    <Label htmlFor="vegetarian" className="flex-1 cursor-pointer">Vegetarian</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="vegan" id="vegan" />
                    <Label htmlFor="vegan" className="flex-1 cursor-pointer">Vegan</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="pescatarian" id="pescatarian" />
                    <Label htmlFor="pescatarian" className="flex-1 cursor-pointer">Pescatarian</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="keto" id="keto" />
                    <Label htmlFor="keto" className="flex-1 cursor-pointer">Keto/Low-carb</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="paleo" id="paleo" />
                    <Label htmlFor="paleo" className="flex-1 cursor-pointer">Paleo</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="mediterranean" id="mediterranean" />
                    <Label htmlFor="mediterranean" className="flex-1 cursor-pointer">Mediterranean</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="intermittent_fasting" id="intermittent_fasting" />
                    <Label htmlFor="intermittent_fasting" className="flex-1 cursor-pointer">Intermittent fasting</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3 col-span-2">
                    <RadioGroupItem value="other" id="other_diet" />
                    <Label htmlFor="other_diet" className="flex-1 cursor-pointer">Other</Label>
                  </div>
                </RadioGroup>
                
                {formData.dietType === 'other' && (
                  <div className="mt-2">
                    <Input 
                      placeholder="Please specify your dietary pattern"
                      value={formData.otherDiet}
                      onChange={e => handleInputChange({ target: { name: 'otherDiet', value: e.target.value } })}
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-medium">Do you have any food allergies or intolerances? (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Dairy', 'Eggs', 'Peanuts', 'Tree nuts', 'Soy', 'Wheat', 'Gluten', 'Fish', 'Shellfish'].map(allergy => (
                    <div key={allergy} className="flex items-center space-x-2 rounded-md border p-3">
                      <Checkbox 
                        id={`allergy-${allergy}`} 
                        checked={formData.allergies.includes(allergy.toLowerCase())}
                        onCheckedChange={checked => {
                          handleMultiSelectChange(allergy.toLowerCase(), 'allergies');
                        }}
                      />
                      <Label htmlFor={`allergy-${allergy}`} className="flex-1 cursor-pointer">{allergy}</Label>
                    </div>
                  ))}
                  <div className="col-span-2 mt-2">
                    <Label htmlFor="otherAllergies" className="text-sm">Other allergies (comma separated)</Label>
                    <Input 
                      id="otherAllergies"
                      placeholder="e.g. sesame, strawberries"
                      value={formData.otherAllergies}
                      onChange={e => handleInputChange({ target: { name: 'otherAllergies', value: e.target.value } })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Food Restrictions and Meal Structure */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Are there any foods you strongly dislike or avoid?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Red meat', 'Pork', 'Poultry', 'Seafood', 'Dairy', 'Eggs', 
                    'Processed food', 'Added sugar', 'Artificial sweeteners', 'Spicy food'
                  ].map(restriction => (
                    <div key={restriction} className="flex items-center space-x-2 rounded-md border p-3">
                      <Checkbox 
                        id={`restriction-${restriction}`} 
                        checked={formData.foodRestrictions.includes(restriction)}
                        onCheckedChange={checked => {
                          handleMultiSelectChange(restriction, 'foodRestrictions');
                        }}
                      />
                      <Label htmlFor={`restriction-${restriction}`} className="flex-1 cursor-pointer">{restriction}</Label>
                    </div>
                  ))}
                  <div className="col-span-2 mt-2">
                    <Label htmlFor="otherRestrictions" className="text-sm">Other foods you avoid (comma separated)</Label>
                    <Input 
                      id="otherRestrictions"
                      placeholder="e.g. mushrooms, olives"
                      value={formData.otherRestrictions}
                      onChange={e => handleInputChange({ target: { name: 'otherRestrictions', value: e.target.value } })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-medium">How many meals do you typically eat per day?</Label>
                <Select 
                  value={formData.mealsPerDay.toString()} 
                  onValueChange={value => handleSelectChange('mealsPerDay', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of meals" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 meals</SelectItem>
                    <SelectItem value="3">3 meals</SelectItem>
                    <SelectItem value="4">4 meals</SelectItem>
                    <SelectItem value="5">5 meals</SelectItem>
                    <SelectItem value="6">6+ meals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-medium">Do you typically eat snacks between meals?</Label>
                <RadioGroup 
                  value={formData.snacks ? 'yes' : 'no'} 
                  onValueChange={value => handleSelectChange('snacks', value === 'yes')}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="yes" id="snacks-yes" />
                    <Label htmlFor="snacks-yes" className="flex-1 cursor-pointer">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="no" id="snacks-no" />
                    <Label htmlFor="snacks-no" className="flex-1 cursor-pointer">No</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-medium">Do you prefer meal prepping or cooking daily?</Label>
                <RadioGroup 
                  value={formData.mealPrepPreference} 
                  onValueChange={value => handleSelectChange('mealPrepPreference', value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="meal_prep" id="prep" />
                    <Label htmlFor="prep" className="flex-1 cursor-pointer">I prefer to meal prep for multiple days</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="daily" id="daily" />
                    <Label htmlFor="daily" className="flex-1 cursor-pointer">I prefer to cook fresh daily</Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="flexible" id="flexible" />
                    <Label htmlFor="flexible" className="flex-1 cursor-pointer">I'm flexible with either approach</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}
          
          {/* Step 3: Guidance and Cuisine Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">What type of meal guidance would you prefer?</Label>
                <RadioGroup 
                  value={formData.guidanceType} 
                  onValueChange={value => handleSelectChange('guidanceType', value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="strict" id="strict" />
                    <div className="flex-1">
                      <Label htmlFor="strict" className="cursor-pointer font-medium">Strict meal plan with specific recipes</Label>
                      <p className="text-sm text-gray-500">Detailed daily meal plans with exact recipes</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="flexible" id="flex-guide" />
                    <div className="flex-1">
                      <Label htmlFor="flex-guide" className="cursor-pointer font-medium">Flexible meal framework with options</Label>
                      <p className="text-sm text-gray-500">Meal suggestions with flexibility to swap items</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="macro" id="macro" />
                    <div className="flex-1">
                      <Label htmlFor="macro" className="cursor-pointer font-medium">Simple macro targets with food suggestions</Label>
                      <p className="text-sm text-gray-500">Focus on hitting daily macro goals with sample foods</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {step > 1 ? (
          <Button type="button" variant="outline" onClick={prevStep}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        ) : (
          <div></div>
        )}
        
        {step < 3 ? (
          <Button type="button" className="bg-[#3E7B27] hover:bg-[#2d5b1d]" onClick={nextStep}>
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button 
            type="button" 
            className="bg-[#3E7B27] hover:bg-[#2d5b1d]" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Generating..." : "Generate Nutrition Plan"}
            <Apple className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default DietQuestionnaire;