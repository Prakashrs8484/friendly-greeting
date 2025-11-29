import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Details
    name: "",
    age: "",
    gender: "",
    
    // Lifestyle
    wakeTime: "",
    sleepTime: "",
    workSchedule: "",
    hobbies: "",
    
    // Health & Fitness
    fitnessLevel: "",
    exerciseFrequency: "",
    healthGoals: "",
    
    // Diet & Nutrition
    dietaryPreference: "",
    mealsPerDay: "",
    nutritionGoals: "",
    
    // Career
    currentRole: "",
    careerGoals: "",
    skills: "",
    learningInterests: "",
    
    // Finance
    monthlyIncome: "",
    savingsGoal: "",
    investmentInterest: "",
    financialPriority: "",
  });

  const navigate = useNavigate();
  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Save data and navigate to dashboard
      console.log("Onboarding complete:", formData);
      navigate("/dashboard");
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'var(--gradient-mesh)' }} />
      
      <div className="w-full max-w-2xl relative z-10 animate-scale-in">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Brain className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold">NeuraDesk Onboarding</span>
        </div>

        <Card className="border-border shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-2xl">
                {stepTitles[step - 1]}
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                Step {step} of {totalSteps}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <CardDescription className="mt-2">
              {stepDescriptions[step - 1]}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              {step === 1 && (
                <PersonalDetailsStep formData={formData} updateField={updateField} />
              )}
              {step === 2 && (
                <LifestyleStep formData={formData} updateField={updateField} />
              )}
              {step === 3 && (
                <HealthFitnessStep formData={formData} updateField={updateField} />
              )}
              {step === 4 && (
                <DietNutritionStep formData={formData} updateField={updateField} />
              )}
              {step === 5 && (
                <CareerStep formData={formData} updateField={updateField} />
              )}
              {step === 6 && (
                <FinanceStep formData={formData} updateField={updateField} />
              )}

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-primary to-accent"
                >
                  {step === totalSteps ? (
                    <>
                      Complete
                      <Check className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const PersonalDetailsStep = ({ formData, updateField }: StepProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="name">Full Name</Label>
      <Input
        id="name"
        value={formData.name}
        onChange={(e) => updateField("name", e.target.value)}
        placeholder="John Doe"
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="age">Age</Label>
        <Input
          id="age"
          type="number"
          value={formData.age}
          onChange={(e) => updateField("age", e.target.value)}
          placeholder="25"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
            <SelectItem value="prefer-not">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
);

const LifestyleStep = ({ formData, updateField }: StepProps) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="wakeTime">Wake Time</Label>
        <Input
          id="wakeTime"
          type="time"
          value={formData.wakeTime}
          onChange={(e) => updateField("wakeTime", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sleepTime">Sleep Time</Label>
        <Input
          id="sleepTime"
          type="time"
          value={formData.sleepTime}
          onChange={(e) => updateField("sleepTime", e.target.value)}
        />
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="workSchedule">Work Schedule</Label>
      <Select value={formData.workSchedule} onValueChange={(value) => updateField("workSchedule", value)}>
        <SelectTrigger>
          <SelectValue placeholder="Select schedule" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="9to5">9-5 Office</SelectItem>
          <SelectItem value="flexible">Flexible</SelectItem>
          <SelectItem value="remote">Remote</SelectItem>
          <SelectItem value="shift">Shift Work</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label htmlFor="hobbies">Hobbies & Interests</Label>
      <Textarea
        id="hobbies"
        value={formData.hobbies}
        onChange={(e) => updateField("hobbies", e.target.value)}
        placeholder="Reading, hiking, coding..."
        rows={3}
      />
    </div>
  </div>
);

const HealthFitnessStep = ({ formData, updateField }: StepProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="fitnessLevel">Current Fitness Level</Label>
      <Select value={formData.fitnessLevel} onValueChange={(value) => updateField("fitnessLevel", value)}>
        <SelectTrigger>
          <SelectValue placeholder="Select level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="beginner">Beginner</SelectItem>
          <SelectItem value="intermediate">Intermediate</SelectItem>
          <SelectItem value="advanced">Advanced</SelectItem>
          <SelectItem value="athlete">Athlete</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label htmlFor="exerciseFrequency">Exercise Frequency</Label>
      <Select value={formData.exerciseFrequency} onValueChange={(value) => updateField("exerciseFrequency", value)}>
        <SelectTrigger>
          <SelectValue placeholder="Select frequency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          <SelectItem value="1-2">1-2 times/week</SelectItem>
          <SelectItem value="3-4">3-4 times/week</SelectItem>
          <SelectItem value="5+">5+ times/week</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label htmlFor="healthGoals">Health & Fitness Goals</Label>
      <Textarea
        id="healthGoals"
        value={formData.healthGoals}
        onChange={(e) => updateField("healthGoals", e.target.value)}
        placeholder="Lose weight, build muscle, improve endurance..."
        rows={3}
      />
    </div>
  </div>
);

const DietNutritionStep = ({ formData, updateField }: StepProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="dietaryPreference">Dietary Preference</Label>
      <Select value={formData.dietaryPreference} onValueChange={(value) => updateField("dietaryPreference", value)}>
        <SelectTrigger>
          <SelectValue placeholder="Select preference" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="omnivore">Omnivore</SelectItem>
          <SelectItem value="vegetarian">Vegetarian</SelectItem>
          <SelectItem value="vegan">Vegan</SelectItem>
          <SelectItem value="keto">Keto</SelectItem>
          <SelectItem value="paleo">Paleo</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label htmlFor="mealsPerDay">Meals Per Day</Label>
      <Select value={formData.mealsPerDay} onValueChange={(value) => updateField("mealsPerDay", value)}>
        <SelectTrigger>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="2">2 meals</SelectItem>
          <SelectItem value="3">3 meals</SelectItem>
          <SelectItem value="4">4-5 meals</SelectItem>
          <SelectItem value="6+">6+ meals</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label htmlFor="nutritionGoals">Nutrition Goals</Label>
      <Textarea
        id="nutritionGoals"
        value={formData.nutritionGoals}
        onChange={(e) => updateField("nutritionGoals", e.target.value)}
        placeholder="Eat healthier, track macros, meal prep..."
        rows={3}
      />
    </div>
  </div>
);

const CareerStep = ({ formData, updateField }: StepProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="currentRole">Current Role/Position</Label>
      <Input
        id="currentRole"
        value={formData.currentRole}
        onChange={(e) => updateField("currentRole", e.target.value)}
        placeholder="Software Engineer, Student, etc."
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="skills">Current Skills</Label>
      <Textarea
        id="skills"
        value={formData.skills}
        onChange={(e) => updateField("skills", e.target.value)}
        placeholder="JavaScript, React, Python..."
        rows={3}
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="careerGoals">Career Goals</Label>
      <Textarea
        id="careerGoals"
        value={formData.careerGoals}
        onChange={(e) => updateField("careerGoals", e.target.value)}
        placeholder="Get promoted, learn new skills, change careers..."
        rows={3}
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="learningInterests">Learning Interests</Label>
      <Textarea
        id="learningInterests"
        value={formData.learningInterests}
        onChange={(e) => updateField("learningInterests", e.target.value)}
        placeholder="AI/ML, Cloud Computing, Leadership..."
        rows={2}
      />
    </div>
  </div>
);

const FinanceStep = ({ formData, updateField }: StepProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="monthlyIncome">Monthly Income Range</Label>
      <Select value={formData.monthlyIncome} onValueChange={(value) => updateField("monthlyIncome", value)}>
        <SelectTrigger>
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0-2k">$0 - $2,000</SelectItem>
          <SelectItem value="2k-5k">$2,000 - $5,000</SelectItem>
          <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
          <SelectItem value="10k+">$10,000+</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label htmlFor="savingsGoal">Savings Goal</Label>
      <Input
        id="savingsGoal"
        value={formData.savingsGoal}
        onChange={(e) => updateField("savingsGoal", e.target.value)}
        placeholder="e.g., Emergency fund, House, Retirement"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="investmentInterest">Investment Interest Level</Label>
      <Select value={formData.investmentInterest} onValueChange={(value) => updateField("investmentInterest", value)}>
        <SelectTrigger>
          <SelectValue placeholder="Select interest" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Not interested</SelectItem>
          <SelectItem value="beginner">Beginner - Want to learn</SelectItem>
          <SelectItem value="active">Active investor</SelectItem>
          <SelectItem value="expert">Expert investor</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label htmlFor="financialPriority">Financial Priority</Label>
      <Select value={formData.financialPriority} onValueChange={(value) => updateField("financialPriority", value)}>
        <SelectTrigger>
          <SelectValue placeholder="Select priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="saving">Saving money</SelectItem>
          <SelectItem value="debt">Paying off debt</SelectItem>
          <SelectItem value="investing">Growing investments</SelectItem>
          <SelectItem value="budgeting">Better budgeting</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

interface StepProps {
  formData: any;
  updateField: (field: string, value: string) => void;
}

const stepTitles = [
  "Personal Details",
  "Lifestyle & Daily Routines",
  "Health & Fitness",
  "Diet & Nutrition",
  "Career & Learning",
  "Financial Goals",
];

const stepDescriptions = [
  "Tell us about yourself to personalize your experience",
  "Help us understand your daily routine and preferences",
  "Share your fitness level and health objectives",
  "Let us know about your dietary preferences and goals",
  "Share your career aspirations and learning interests",
  "Tell us about your financial situation and goals",
];

export default Onboarding;
