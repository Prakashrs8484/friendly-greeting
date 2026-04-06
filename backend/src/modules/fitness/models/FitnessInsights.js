const mongoose = require('mongoose');

const FitnessInsightsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dateKey: {
      type: String, // Format: 'YYYY-MM-DD'
      required: true,
    },
    coachInsights: [
      {
        title: String,           // e.g., "Great consistency"
        message: String,         // e.g., "You've maintained..."
        category: String,        // 'performance', 'nutrition', 'recovery', 'progress'
        priority: String,        // 'high', 'medium', 'low'
      },
    ],
    mealSuggestions: [
      {
        mealType: String,        // 'breakfast', 'lunch', 'dinner', 'snack'
        suggestion: String,      // e.g., "Add protein-rich..."
        reasoning: String,       // Why this suggestion (based on goals/metrics)
        calorieTarget: Number,   // If applicable
      },
    ],
    workoutSuggestions: [
      {
        suggestion: String,      // e.g., "Consider cardio today"
        reasoning: String,       // Why this suggestion
        estimatedDuration: Number,     // Minutes
        estimatedCalories: Number,     // Kcal to burn
        intensity: String,       // 'light', 'moderate', 'high'
      },
    ],
    budgetFoodSwaps: [
      {
        original: String,        // e.g., "Chicken breast (500 cal)"
        suggestion: String,      // e.g., "Ground turkey (480 cal)"
        caloriesSaved: Number,   // Difference
        reasoning: String,       // Why this swap
      },
    ],
    generationContext: {
      metricsSnapshot: Object,  // Today's metrics for reference
      sevenDayTrend: Array,     // Last 7 days metrics for trend analysis
      goalsData: Object,        // Current goals and progress
      recoveryData: Object,     // Recovery signals and score
      timelinePatterns: Object, // Meal/workout patterns detected
    },
    aiUsed: {
      type: Boolean,
      default: true,            // True if generated via AI, false if fallback
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
FitnessInsightsSchema.index({ userId: 1, dateKey: 1 }, { unique: true });
FitnessInsightsSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('FitnessInsights', FitnessInsightsSchema);
