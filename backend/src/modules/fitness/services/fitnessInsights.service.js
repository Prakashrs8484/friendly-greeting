const FitnessInsights = require('../models/FitnessInsights');
const FitnessDailyMetric = require('../models/FitnessDailyMetric');
const FitnessEntry = require('../models/FitnessEntry');
const FitnessGoals = require('../models/FitnessGoals');
const FitnessRecoverySignals = require('../models/FitnessRecoverySignals');
const groq = require('../../system/services/groq.service');

const fitnessInsightsService = {
  /**
   * Main endpoint: Generate insights for a user on a specific date
   * Fetches cached insights if available and recent, otherwise regenerates
   * @param {string} userId - User ID
   * @param {string} dateKey - Date in 'YYYY-MM-DD' format
   * @returns {object} Insights with coachInsights, mealSuggestions, workoutSuggestions, budgetFoodSwaps
   */
  async getInsights(userId, dateKey) {
    // Check if cached insights exist and are fresh (within 6 hours)
    const cachedInsights = await FitnessInsights.findOne({ userId, dateKey });
    if (cachedInsights && this.isFresh(cachedInsights.generatedAt)) {
      return {
        success: true,
        insights: cachedInsights,
        cached: true,
      };
    }

    // Fetch all context data
    const context = await this.getInsightsContext(userId, dateKey);

    // Generate insights (AI first, fallback if fails)
    const insights = await this.generateInsights(userId, dateKey, context);

    return {
      success: true,
      insights,
      cached: false,
      aiUsed: insights.aiUsed,
    };
  },

  /**
   * Check if cached insights are still fresh (within 6 hours)
   */
  isFresh(timestamp) {
    const sixHoursMs = 6 * 60 * 60 * 1000;
    return Date.now() - new Date(timestamp).getTime() < sixHoursMs;
  },

  /**
   * Fetch all context data needed for insights generation
   * @returns {object} Context with metrics, goals, recovery, patterns
   */
  async getInsightsContext(userId, dateKey) {
    // Fetch today's metrics
    const todayMetric = await FitnessDailyMetric.findOne({ userId, dateKey });

    // Fetch last 7 days metrics for trend analysis
    const sevenDayTrend = await this.getLast7DaysMetrics(userId, dateKey);

    // Fetch user's goals
    const goals = await FitnessGoals.findOne({ userId });

    // Fetch today's recovery signals
    const recoverySignals = await FitnessRecoverySignals.findOne({ userId, dateKey });

    // Fetch today's timeline entries to detect meal/workout patterns
    const todayEntries = await FitnessEntry.find({ userId, dateKey }).sort({ timestamp: 1 });

    // Analyze patterns from entries
    const timelinePatterns = this.analyzeTimelinePatterns(todayEntries);

    return {
      dateKey,
      todayMetric: todayMetric || this.getDefaultMetric(),
      sevenDayTrend,
      goals: goals || this.getDefaultGoals(),
      recoverySignals: recoverySignals || {},
      timeline: todayEntries,
      patterns: timelinePatterns,
    };
  },

  /**
   * Fetch metrics for the last 7 days (including today)
   */
  async getLast7DaysMetrics(userId, dateKey) {
    const targetDate = new Date(dateKey);
    const metrics = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(targetDate);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];

      const metric = await FitnessDailyMetric.findOne({ userId, dateKey: key });
      metrics.push(metric || { dateKey: key, caloriesConsumed: 0, workoutMinutes: 0, sleepHours: 0 });
    }

    return metrics;
  },

  /**
   * Analyze timeline patterns to detect habits
   */
  analyzeTimelinePatterns(entries) {
    const patterns = {
      mealTimes: [],
      workoutTimes: [],
      mealFrequency: 0,
      workoutFrequency: 0,
      averageMealCalories: 0,
      averageWorkoutDuration: 0,
    };

    let mealCount = 0;
    let mealCaloriesTotal = 0;
    let workoutCount = 0;
    let workoutDurationTotal = 0;

    for (const entry of entries) {
      if (entry.entryType === 'meal') {
        mealCount++;
        mealCaloriesTotal += entry.calories || 0;
        const hour = new Date(entry.timestamp).getHours();
        patterns.mealTimes.push(hour);
      } else if (entry.entryType === 'workout') {
        workoutCount++;
        workoutDurationTotal += entry.duration || 0;
        const hour = new Date(entry.timestamp).getHours();
        patterns.workoutTimes.push(hour);
      }
    }

    patterns.mealFrequency = mealCount;
    patterns.workoutFrequency = workoutCount;
    patterns.averageMealCalories = mealCount > 0 ? Math.round(mealCaloriesTotal / mealCount) : 0;
    patterns.averageWorkoutDuration = workoutCount > 0 ? Math.round(workoutDurationTotal / workoutCount) : 0;

    return patterns;
  },

  /**
   * Generate insights using AI (with fallback if fails)
   */
  async generateInsights(userId, dateKey, context) {
    try {
      // Try AI generation first
      const aiInsights = await this.generateInsightsViaAI(context);

      // Cache the insights
      const insights = await FitnessInsights.findOneAndUpdate(
        { userId, dateKey },
        {
          userId,
          dateKey,
          coachInsights: aiInsights.coachInsights,
          mealSuggestions: aiInsights.mealSuggestions,
          workoutSuggestions: aiInsights.workoutSuggestions,
          budgetFoodSwaps: aiInsights.budgetFoodSwaps,
          generationContext: {
            metricsSnapshot: context.todayMetric,
            sevenDayTrend: context.sevenDayTrend,
            goalsData: context.goals,
            recoveryData: context.recoverySignals,
            timelinePatterns: context.patterns,
          },
          aiUsed: true,
          generatedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      return { ...insights.toObject(), aiUsed: true };
    } catch (error) {
      console.error('AI insights generation failed, using fallback:', error.message);

      // Use data-driven fallback
      const fallbackInsights = this.generateDataDrivenInsights(context);

      // Cache the fallback insights
      const insights = await FitnessInsights.findOneAndUpdate(
        { userId, dateKey },
        {
          userId,
          dateKey,
          coachInsights: fallbackInsights.coachInsights,
          mealSuggestions: fallbackInsights.mealSuggestions,
          workoutSuggestions: fallbackInsights.workoutSuggestions,
          budgetFoodSwaps: fallbackInsights.budgetFoodSwaps,
          generationContext: {
            metricsSnapshot: context.todayMetric,
            sevenDayTrend: context.sevenDayTrend,
            goalsData: context.goals,
            recoveryData: context.recoverySignals,
            timelinePatterns: context.patterns,
          },
          aiUsed: false,
          generatedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      return { ...insights.toObject(), aiUsed: false };
    }
  },

  /**
   * Generate insights using Groq API (AI-powered)
   */
  async generateInsightsViaAI(context) {
    const prompt = this.buildInsightsPrompt(context);

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      temperature: 0.5, // Balanced creativity and precision
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = response.choices[0].message.content;

    // Parse JSON response from AI
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const insights = JSON.parse(jsonMatch[0]);
    return {
      coachInsights: insights.coachInsights || [],
      mealSuggestions: insights.mealSuggestions || [],
      workoutSuggestions: insights.workoutSuggestions || [],
      budgetFoodSwaps: insights.budgetFoodSwaps || [],
    };
  },

  /**
   * Build detailed prompt for AI insights generation
   */
  buildInsightsPrompt(context) {
    const { todayMetric, sevenDayTrend, goals, recoverySignals, patterns } = context;

    const sevenDaySummary = sevenDayTrend
      .map((m) => `${m.dateKey}: ${m.caloriesConsumed} cal, ${m.workoutMinutes}min workout, ${m.sleepHours}h sleep`)
      .join('\n');

    return `You are a fitness coach providing personalized insights. Analyze the user's fitness data:

TODAY'S METRICS:
- Calories: ${todayMetric.caloriesConsumed}/${goals?.targets?.calories || 2000} kcal
- Workout: ${todayMetric.workoutMinutes} minutes (Goal: ${goals?.targets?.workoutMinutes || 30} min)
- Sleep: ${todayMetric.sleepHours} hours (Goal: ${goals?.targets?.sleepHours || 8} h)
- Water: ${todayMetric.waterIntakeMl} ml (Goal: ${goals?.targets?.water || 2000} ml)
- Protein: ${todayMetric.proteinIntake}g (Goal: ${goals?.targets?.protein || 150}g)
- Recovery Score: ${todayMetric.recoveryScore || 0}/100
- Fitness Score: ${todayMetric.fitnessScore || 0}/100

7-DAY TREND:
${sevenDaySummary}

RECOVERY SIGNALS (TODAY):
- Muscle Soreness: ${recoverySignals.muscleSoreness || 'N/A'}/10
- Stress Level: ${recoverySignals.stressLevel || 'N/A'}/10
- Resting HR: ${recoverySignals.restingHeartRate || 'N/A'} bpm
- Energy Level: ${recoverySignals.energyLevel || 'N/A'}/10

TIMELINE PATTERNS:
- Meals today: ${patterns.mealFrequency} (avg ${patterns.averageMealCalories} cal each)
- Workouts today: ${patterns.workoutFrequency} (avg ${patterns.averageWorkoutDuration} min each)

GOAL MODE: ${goals?.goalMode || 'maintenance'}

Generate insights in this exact JSON format (ensure valid JSON):
{
  "coachInsights": [
    {"title": "string", "message": "string (1-2 sentences, specific to user data)", "category": "performance|nutrition|recovery|progress", "priority": "high|medium|low"}
  ],
  "mealSuggestions": [
    {"mealType": "breakfast|lunch|dinner|snack", "suggestion": "string (specific suggestion)", "reasoning": "string (based on goals/metrics)", "calorieTarget": number}
  ],
  "workoutSuggestions": [
    {"suggestion": "string (specific)", "reasoning": "string (why this fits)", "estimatedDuration": number, "estimatedCalories": number, "intensity": "light|moderate|high"}
  ],
  "budgetFoodSwaps": [
    {"original": "string (food with cals)", "suggestion": "string (swap with cals)", "caloriesSaved": number, "reasoning": "string"}
  ]
}

Ensure all suggestions are grounded in the user's actual metrics and trends. Be specific with values.`;
  },

  /**
   * Generate data-driven insights (fallback when AI fails)
   * All suggestions based on actual metrics, no generic text
   */
  generateDataDrivenInsights(context) {
    const { todayMetric, sevenDayTrend, goals, recoverySignals, patterns } = context;

    const coachInsights = this.generateCoachInsightsFallback(todayMetric, sevenDayTrend, goals, recoverySignals);
    const mealSuggestions = this.generateMealSuggestionsFallback(todayMetric, goals, patterns);
    const workoutSuggestions = this.generateWorkoutSuggestionsFallback(todayMetric, sevenDayTrend, goals, recoverySignals);
    const budgetFoodSwaps = this.generateBudgetFoodSwapsFallback(todayMetric, goals);

    return {
      coachInsights,
      mealSuggestions,
      workoutSuggestions,
      budgetFoodSwaps,
    };
  },

  /**
   * Generate coach insights based on metrics analysis
   */
  generateCoachInsightsFallback(todayMetric, sevenDayTrend, goals, recoverySignals) {
    const insights = [];
    const calorieGoal = goals?.targets?.calories || 2000;
    const workoutGoal = goals?.targets?.workoutMinutes || 30;
    const sleepGoal = goals?.targets?.sleepHours || 8;

    // Calculate 7-day averages
    const avgCalories = Math.round(
      sevenDayTrend.reduce((sum, m) => sum + (m.caloriesConsumed || 0), 0) / 7
    );
    const avgWorkout = Math.round(
      sevenDayTrend.reduce((sum, m) => sum + (m.workoutMinutes || 0), 0) / 7
    );
    const avgSleep = (
      sevenDayTrend.reduce((sum, m) => sum + (m.sleepHours || 0), 0) / 7
    ).toFixed(1);

    // Calorie consistency
    if (Math.abs(todayMetric.caloriesConsumed - calorieGoal) <= 100) {
      insights.push({
        title: 'On Target',
        message: `You hit your calorie goal perfectly today (${todayMetric.caloriesConsumed}/${calorieGoal}). Keep up this consistency!`,
        category: 'nutrition',
        priority: 'high',
      });
    } else if (todayMetric.caloriesConsumed < calorieGoal - 200) {
      const deficit = calorieGoal - todayMetric.caloriesConsumed;
      insights.push({
        title: 'Calorie Deficit',
        message: `You're ${deficit} calories under goal (${todayMetric.caloriesConsumed}/${calorieGoal}). Consider a light snack.`,
        category: 'nutrition',
        priority: 'medium',
      });
    } else if (todayMetric.caloriesConsumed > calorieGoal + 200) {
      const excess = todayMetric.caloriesConsumed - calorieGoal;
      insights.push({
        title: 'Calorie Surplus',
        message: `You're ${excess} calories over goal today. Compensate tomorrow or add extra activity.`,
        category: 'nutrition',
        priority: 'medium',
      });
    }

    // Workout consistency
    if (todayMetric.workoutMinutes >= workoutGoal) {
      insights.push({
        title: 'Great Workout',
        message: `You logged ${todayMetric.workoutMinutes} minutes of exercise (Goal: ${workoutGoal}). You're exceeding your targets!`,
        category: 'performance',
        priority: 'high',
      });
    } else if (todayMetric.workoutMinutes > 0) {
      const remaining = workoutGoal - todayMetric.workoutMinutes;
      insights.push({
        title: 'Add More Activity',
        message: `You've logged ${todayMetric.workoutMinutes}min. Add ${remaining} more minutes to hit your workout goal.`,
        category: 'performance',
        priority: 'medium',
      });
    } else if (avgWorkout > 0) {
      insights.push({
        title: 'Rest or Light Activity?',
        message: `No structured workout today. 7-day average is ${avgWorkout}min. Consider a rest day or light activity.`,
        category: 'performance',
        priority: 'medium',
      });
    }

    // Sleep quality
    if (todayMetric.sleepHours >= sleepGoal) {
      insights.push({
        title: 'Excellent Sleep',
        message: `You got ${todayMetric.sleepHours}h of sleep (Goal: ${sleepGoal}h). Perfect for recovery!`,
        category: 'recovery',
        priority: 'high',
      });
    } else if (todayMetric.sleepHours > 0 && todayMetric.sleepHours < sleepGoal - 1) {
      const deficit = sleepGoal - todayMetric.sleepHours;
      insights.push({
        title: 'Prioritize Sleep',
        message: `You got ${todayMetric.sleepHours}h of sleep. Aim for ${deficit.toFixed(1)} more hours tomorrow.`,
        category: 'recovery',
        priority: 'high',
      });
    }

    // Recovery score feedback
    if (recoverySignals && todayMetric.recoveryScore < 50) {
      insights.push({
        title: 'Recovery Needed',
        message: `Recovery score is ${todayMetric.recoveryScore}/100. Focus on sleep and hydration.`,
        category: 'recovery',
        priority: 'high',
      });
    } else if (recoverySignals && todayMetric.recoveryScore >= 80) {
      insights.push({
        title: 'Fully Recovered',
        message: `Recovery score is excellent (${todayMetric.recoveryScore}/100). You're ready for harder training!`,
        category: 'recovery',
        priority: 'low',
      });
    }

    return insights.length > 0 ? insights : this.getDefaultCoachInsights();
  },

  /**
   * Generate meal suggestions based on goals and current intake
   */
  generateMealSuggestionsFallback(todayMetric, goals, patterns) {
    const suggestions = [];
    const calorieGoal = goals?.targets?.calories || 2000;
    const proteinGoal = goals?.targets?.protein || 150;
    const remaining = Math.max(0, calorieGoal - todayMetric.caloriesConsumed);
    const proteinRemaining = Math.max(0, proteinGoal - todayMetric.proteinIntake);

    if (remaining > 200) {
      const mealType =
        patterns.mealFrequency <= 2 ? 'dinner' : patterns.mealFrequency <= 3 ? 'snack' : 'light_snack';
      suggestions.push({
        mealType,
        suggestion:
          mealType === 'snack' || mealType === 'light_snack'
            ? `Add a protein snack (~${Math.min(300, remaining)} cal) like Greek yogurt or nuts`
            : `Add protein-rich dinner (~${remaining} cal) with lean protein and vegetables`,
        reasoning: `You have ${remaining} calories remaining. Prioritize protein (${proteinRemaining}g more needed).`,
        calorieTarget: Math.min(300, remaining),
      });
    }

    if (proteinRemaining > 10) {
      suggestions.push({
        mealType: 'any',
        suggestion: `Increase protein intake by ${proteinRemaining}g. Add chicken, fish, eggs, or legumes to meals.`,
        reasoning: `Current protein: ${todayMetric.proteinIntake}g. Target: ${proteinGoal}g.`,
        calorieTarget: null,
      });
    }

    return suggestions.length > 0 ? suggestions : this.getDefaultMealSuggestions();
  },

  /**
   * Generate workout suggestions based on metrics and recovery
   */
  generateWorkoutSuggestionsFallback(todayMetric, sevenDayTrend, goals, recoverySignals) {
    const suggestions = [];
    const workoutGoal = goals?.targets?.workoutMinutes || 30;
    const remaining = Math.max(0, workoutGoal - todayMetric.workoutMinutes);

    if (remaining > 0) {
      const intensity =
        recoverySignals.recoveryScore >= 80 ? 'moderate' : recoverySignals.recoveryScore >= 60 ? 'light' : 'light';
      const estimatedCalories = intensity === 'light' ? 150 : intensity === 'moderate' ? 250 : 350;

      suggestions.push({
        suggestion:
          intensity === 'light'
            ? `Do a light activity like brisk walking (${remaining} min)`
            : `Do a moderate workout like running or cycling (${remaining} min)`,
        reasoning: `You need ${remaining} more minutes to hit your goal. Recovery score is ${recoverySignals.recoveryScore}/100.`,
        estimatedDuration: remaining,
        estimatedCalories: Math.round((estimatedCalories * remaining) / 30),
        intensity,
      });
    } else if (todayMetric.workoutMinutes === 0) {
      // No workout yet today
      const avgWeekly = Math.round(
        sevenDayTrend.reduce((sum, m) => sum + (m.workoutMinutes || 0), 0) / 7
      );

      if (
        recoverySignals.recoveryScore > 70 &&
        !recoverySignals.muscleSoreness ||
        recoverySignals.muscleSoreness < 5
      ) {
        suggestions.push({
          suggestion: `Try a ${workoutGoal}-minute workout: your 7-day average is ${avgWeekly} minutes.`,
          reasoning: 'Recovery is good and you have capacity for training today.',
          estimatedDuration: workoutGoal,
          estimatedCalories: Math.round((250 * workoutGoal) / 30),
          intensity: 'moderate',
        });
      } else {
        suggestions.push({
          suggestion: 'Consider light activity like yoga or stretching instead of intense workout.',
          reasoning: 'Recovery score or soreness indicates you need a recovery or light activity day.',
          estimatedDuration: 20,
          estimatedCalories: 100,
          intensity: 'light',
        });
      }
    }

    return suggestions.length > 0 ? suggestions : this.getDefaultWorkoutSuggestions();
  },

  /**
   * Generate budget-friendly food swaps
   */
  generateBudgetFoodSwapsFallback(todayMetric, goals) {
    const swaps = [];
    const calorieGoal = goals?.targets?.calories || 2000;

    // Only suggest swaps if over calorie goal
    if (todayMetric.caloriesConsumed > calorieGoal) {
      swaps.push({
        original: 'Whole milk (150 cal per cup)',
        suggestion: 'Low-fat milk (100 cal per cup)',
        caloriesSaved: 50,
        reasoning: 'Saves 50 calories per cup while maintaining nutrition.',
      });

      swaps.push({
        original: 'Ground beef (285 cal per 100g)',
        suggestion: 'Ground turkey or lean ground chicken (165 cal per 100g)',
        caloriesSaved: 120,
        reasoning: 'Saves 120 calories per 100g while maintaining high protein.',
      });

      swaps.push({
        original: 'Regular pasta (350 cal per cooked cup)',
        suggestion: 'Whole wheat pasta or zucchini noodles (100-150 cal)',
        caloriesSaved: 200,
        reasoning: 'Significantly reduces calories while adding fiber and vegetables.',
      });
    } else {
      swaps.push({
        original: 'White rice (206 cal per cooked cup)',
        suggestion: 'Brown rice or cauliflower rice (215 cal or 25 cal)',
        caloriesSaved: 0,
        reasoning: 'Brown rice adds fiber. Cauliflower rice saves 180 calories for same volume.',
      });
    }

    return swaps;
  },

  /**
   * Default responses when no data available
   */
  getDefaultMetric() {
    return {
      caloriesConsumed: 0,
      caloriesBurned: 0,
      proteinIntake: 0,
      waterIntakeMl: 0,
      workoutMinutes: 0,
      sleepHours: 0,
      recoveryScore: 50,
      fitnessScore: 50,
      streakCount: 0,
    };
  },

  getDefaultGoals() {
    return {
      goalMode: 'maintenance',
      targets: {
        calories: 2000,
        protein: 150,
        water: 2000,
        workoutMinutes: 30,
        sleepHours: 8,
      },
    };
  },

  getDefaultCoachInsights() {
    return [
      {
        title: 'Start Tracking',
        message: 'Log your meals, workouts, and sleep to get personalized insights.',
        category: 'progress',
        priority: 'medium',
      },
    ];
  },

  getDefaultMealSuggestions() {
    return [
      {
        mealType: 'snack',
        suggestion: 'Add a protein-rich snack like Greek yogurt or almonds',
        reasoning: 'Protein supports recovery and satiety',
        calorieTarget: 200,
      },
    ];
  },

  getDefaultWorkoutSuggestions() {
    return [
      {
        suggestion: 'Do a 30-minute moderate-intensity workout',
        reasoning: 'Supports your daily fitness goal',
        estimatedDuration: 30,
        estimatedCalories: 250,
        intensity: 'moderate',
      },
    ];
  },
};

module.exports = fitnessInsightsService;
