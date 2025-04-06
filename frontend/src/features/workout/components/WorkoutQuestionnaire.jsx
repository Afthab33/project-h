/* Component that collects workout preferences from the user */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Dumbbell, Activity, CircleCheckBig, ChevronRight, ChevronLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const WorkoutQuestionnaire = ({ userData, healthMetrics, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    days_per_week: 3,
    preferred_days: [],
    session_duration: '30-45',
    workout_locations: ['Home'],
    equipment_access: [],
    health_conditions: '',
    movement_restrictions: '',
    goal_timeline: 'moderate',
    fitness_level: 'intermediate',
    preferred_workouts: [],
    goal: mapGoalFromPrimaryGoal(userData.primaryGoal)
  });

  // Map from primaryGoal to workout goal format
  function mapGoalFromPrimaryGoal(primaryGoal) {
    if (!primaryGoal) return 'general_fitness';
    
    switch (primaryGoal.toLowerCase()) {
      case 'lose_weight':
        return 'weight_loss';
      case 'gain_muscle':
        return 'muscle_gain';
      case 'maintain_weight':
        return 'general_fitness';
      case 'improve_endurance':
        return 'endurance';
      case 'increase_strength':
        return 'strength';
      case 'general_wellness':
        return 'general_fitness';
      default:
        return 'general_fitness';
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
  const nextStep = () => {
    
    setStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    
    setStep(prev => prev - 1);
  };

  // Handle workout preferences submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    try {
      
      
      // Create the properly formatted data structure for the backend
      const workoutInputData = {
        goal: formData.goal,
        days_per_week: formData.days_per_week,
        preferred_days: formData.preferred_days,
        session_duration: formData.session_duration,
        workout_locations: formData.workout_locations,
        equipment_access: formData.equipment_access,
        health_conditions: formData.health_conditions,
        movement_restrictions: formData.movement_restrictions,
        goal_timeline: formData.goal_timeline,
        fitness_level: formData.fitness_level,
        preferred_workouts: formData.preferred_workouts,
        // Add health metrics that might be useful for workout generation
        height: userData.height || 0,
        weight: userData.weight || 0,
        age: userData.age || 30,
        gender: userData.gender || 'not_specified'
      };
      
      
      
      // Call the parent component's onSubmit handler with the processed data
      await onSubmit(workoutInputData);
      
    } catch (error) {
      console.error("❌ Error in workout questionnaire submission:", error);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto overflow-hidden">
      <div className="h-2 bg-[#e72208] w-full"></div>
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center">
          <Dumbbell className="h-5 w-5 mr-2 text-[#e72208]" />
          Workout Preferences
        </CardTitle>
        <CardDescription>
          Tell us about your exercise preferences to create your personalized workout plan
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
                        ? 'bg-[#e72208] text-white' 
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {step > num ? <CircleCheckBig className="h-5 w-5" /> : num}
                  </div>
                  {num < 3 && (
                    <div 
                      className={`w-6 h-1 ${
                        step > num ? 'bg-[#e72208]' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
            <span className="text-sm text-gray-500">Step {step} of 3</span>
          </div>
          
          {/* Step 1: Schedule & Availability + Workout Environment */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">How many days per week can you dedicate to exercise?</Label>
                <Select 
                  value={formData.days_per_week.toString()} 
                  onValueChange={value => handleSelectChange('days_per_week', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select number of days" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map(day => (
                      <SelectItem key={day} value={day.toString()}>
                        {day} {day === 1 ? 'day' : 'days'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-medium">Which days do you typically prefer to exercise?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <div key={day} className="flex items-center space-x-2 rounded-md border p-3">
                      <Checkbox 
                        id={`day-${day}`} 
                        checked={formData.preferred_days.includes(day)}
                        onCheckedChange={checked => {
                          if (checked) {
                            handleMultiSelectChange(day, 'preferred_days');
                          } else {
                            handleMultiSelectChange(day, 'preferred_days');
                          }
                        }}
                      />
                      <Label htmlFor={`day-${day}`} className="flex-1 cursor-pointer">{day}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-medium">How much time can you typically allocate per session?</Label>
                <RadioGroup 
                  value={formData.session_duration} 
                  onValueChange={value => handleSelectChange('session_duration', value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="15-30" id="duration-15-30" />
                    <div className="flex-1">
                      <Label htmlFor="duration-15-30" className="cursor-pointer font-medium">15-30 minutes</Label>
                      <p className="text-sm text-gray-500">Quick, efficient workouts</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="30-45" id="duration-30-45" />
                    <div className="flex-1">
                      <Label htmlFor="duration-30-45" className="cursor-pointer font-medium">30-45 minutes</Label>
                      <p className="text-sm text-gray-500">Balanced and focused</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="45-60" id="duration-45-60" />
                    <div className="flex-1">
                      <Label htmlFor="duration-45-60" className="cursor-pointer font-medium">45-60 minutes</Label>
                      <p className="text-sm text-gray-500">Extended sessions for deeper workouts</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="60-90" id="duration-60-90" />
                    <div className="flex-1">
                      <Label htmlFor="duration-60-90" className="cursor-pointer font-medium">60-90 minutes</Label>
                      <p className="text-sm text-gray-500">Comprehensive, detailed workouts</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Where will you primarily exercise? (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {['Home', 'Gym', 'Outdoors', 'Office/workplace', 'On the go (travel frequently)'].map(location => (
                    <div key={location} className="flex items-center space-x-2 rounded-md border p-3">
                      <Checkbox 
                        id={`location-${location}`} 
                        checked={formData.workout_locations.includes(location)}
                        onCheckedChange={checked => {
                          if (checked) {
                            handleMultiSelectChange(location, 'workout_locations');
                          } else {
                            handleMultiSelectChange(location, 'workout_locations');
                          }
                        }}
                      />
                      <Label htmlFor={`location-${location}`} className="flex-1 cursor-pointer">{location}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Equipment Access + Health Considerations */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">What equipment do you have access to? (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Cardio equipment (treadmill, bike, elliptical, etc.)',
                    'Free weights (dumbbells, kettlebells, barbells)',
                    'Weight machines',
                    'Resistance bands/suspension trainers',
                    'Yoga/Pilates equipment',
                    'Sports equipment',
                    'None/minimal equipment'
                  ].map(equipment => (
                    <div key={equipment} className="flex items-center space-x-2 rounded-md border p-3">
                      <Checkbox 
                        id={`equipment-${equipment}`} 
                        checked={formData.equipment_access.includes(equipment)}
                        onCheckedChange={checked => {
                          if (checked) {
                            handleMultiSelectChange(equipment, 'equipment_access');
                          } else {
                            handleMultiSelectChange(equipment, 'equipment_access');
                          }
                        }}
                      />
                      <Label htmlFor={`equipment-${equipment}`} className="flex-1 cursor-pointer">{equipment}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-medium">Do you have any health conditions that affect your exercise options?</Label>
                <Textarea 
                  placeholder="List any health conditions that may impact exercise (e.g., asthma, diabetes, heart conditions, etc.)"
                  value={formData.health_conditions}
                  onChange={e => handleInputChange({ target: { name: 'health_conditions', value: e.target.value } })}
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-medium">Are there any specific movements or activities you need to avoid?</Label>
                <Textarea 
                  placeholder="E.g., high-impact exercises, jumping, lunges, running, swimming, etc."
                  value={formData.movement_restrictions}
                  onChange={e => handleInputChange({ target: { name: 'movement_restrictions', value: e.target.value } })}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">What is your current fitness level?</Label>
                <RadioGroup 
                  value={formData.fitness_level} 
                  onValueChange={value => handleSelectChange('fitness_level', value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="beginner" id="level-beginner" />
                    <div className="flex-1">
                      <Label htmlFor="level-beginner" className="cursor-pointer font-medium">Beginner</Label>
                      <p className="text-sm text-gray-500">New to regular exercise or returning after a long break</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="intermediate" id="level-intermediate" />
                    <div className="flex-1">
                      <Label htmlFor="level-intermediate" className="cursor-pointer font-medium">Intermediate</Label>
                      <p className="text-sm text-gray-500">Exercise regularly with moderate intensity</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="advanced" id="level-advanced" />
                    <div className="flex-1">
                      <Label htmlFor="level-advanced" className="cursor-pointer font-medium">Advanced</Label>
                      <p className="text-sm text-gray-500">Consistent, high-intensity exercise with good technique</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}
          
          {/* Step 3: Goal Timeline + Workout Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">When would you like to achieve your goal?</Label>
                <RadioGroup 
                  value={formData.goal_timeline} 
                  onValueChange={value => handleSelectChange('goal_timeline', value)}
                  className="grid grid-cols-1 gap-2"
                >
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="aggressive" id="timeline-aggressive" />
                    <div className="flex-1">
                      <Label htmlFor="timeline-aggressive" className="cursor-pointer font-medium">Within 1-2 months (Aggressive)</Label>
                      <p className="text-sm text-gray-500">Intensive approach with rapid progress</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="moderate" id="timeline-moderate" />
                    <div className="flex-1">
                      <Label htmlFor="timeline-moderate" className="cursor-pointer font-medium">Within 3-6 months (Moderate)</Label>
                      <p className="text-sm text-gray-500">Balanced approach with steady progress</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="gradual" id="timeline-gradual" />
                    <div className="flex-1">
                      <Label htmlFor="timeline-gradual" className="cursor-pointer font-medium">Within 6-12 months (Gradual)</Label>
                      <p className="text-sm text-gray-500">Slow and steady approach</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="sustainable" id="timeline-sustainable" />
                    <div className="flex-1">
                      <Label htmlFor="timeline-sustainable" className="cursor-pointer font-medium">No specific timeline (Sustainable long-term approach)</Label>
                      <p className="text-sm text-gray-500">Focus on building lifelong habits</p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-medium">What types of workouts do you enjoy? (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Strength training', 
                    'Cardio', 
                    'HIIT/Interval training', 
                    'Yoga/Pilates', 
                    'Bodyweight exercises',
                    'Dance/Zumba',
                    'Swimming',
                    'Running/Jogging',
                    'Cycling',
                    'Sports',
                    'Group fitness classes'
                  ].map(workout => (
                    <div key={workout} className="flex items-center space-x-2 rounded-md border p-3">
                      <Checkbox 
                        id={`workout-${workout}`} 
                        checked={formData.preferred_workouts.includes(workout)}
                        onCheckedChange={checked => {
                          if (checked) {
                            handleMultiSelectChange(workout, 'preferred_workouts');
                          } else {
                            handleMultiSelectChange(workout, 'preferred_workouts');
                          }
                        }}
                      />
                      <Label htmlFor={`workout-${workout}`} className="flex-1 cursor-pointer">{workout}</Label>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2 rounded-md border p-3 col-span-2">
                    <Checkbox 
                      id="workout-any" 
                      checked={formData.preferred_workouts.includes('Any/No preference')}
                      onCheckedChange={checked => {
                        if (checked) {
                          handleMultiSelectChange('Any/No preference', 'preferred_workouts');
                        } else {
                          handleMultiSelectChange('Any/No preference', 'preferred_workouts');
                        }
                      }}
                    />
                    <Label htmlFor="workout-any" className="flex-1 cursor-pointer">I'm open to any type of workout</Label>
                  </div>
                </div>
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
          <div></div> // Empty div to maintain flex spacing
        )}
        
        {step < 3 ? (
          <Button type="button" className="bg-[#e72208] hover:bg-[#c61d07]" onClick={nextStep}>
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button 
            type="button" 
            className="bg-[#e72208] hover:bg-[#c61d07]" 
            onClick={handleSubmit}
          >
            Generate Workout Plan
            <Activity className="h-4 w-4 ml-2" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default WorkoutQuestionnaire;