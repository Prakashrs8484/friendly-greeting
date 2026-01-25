const Expense = require("../models/Expense");
const Income = require("../models/Income");
const Goal = require("../models/Goal");
const FinancialContext = require("../models/FinancialContext");
const { generateFinanceInsights } = require("./aiInsight.service");
const { randomUUID } = require("crypto");



exports.updateFinancialContext = async function (userId) {
  try {
    // 1. Fetch all transactions
    const expenses = await Expense.find({ userId });
    const incomeItems = await Income.find({ userId });
    const goals = await Goal.find({ userId });

    // 2. Calculate totals
    const totalIncome = incomeItems.reduce((sum, x) => sum + x.amount, 0);
    const totalExpenses = expenses.reduce((sum, x) => sum + x.amount, 0);
    const netSavings = totalIncome - totalExpenses;

    // 3. Calculate category totals
    const categories = {};
    expenses.forEach(exp => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });

    // 4. Detect salary bracket
    let bracket = "bracket1";
    if (totalIncome >= 100000) bracket = "bracket3";
    else if (totalIncome >= 50000) bracket = "bracket2";

    // 5. Suggested Budget (based on bracket)
    const suggestedBudgetPresets = {
      bracket1: { needs: 53, wants: 27, investments: 20, emergency: 0 },
      bracket2: { needs: 50, wants: 20, investments: 25, emergency: 5 },
      bracket3: { needs: 45, wants: 20, investments: 30, emergency: 5 }
    };

    const suggestedBudget = suggestedBudgetPresets[bracket];

    // 6. Emergency Fund Requirement (6 months EXPENSES)
    const emergencyRequired = totalExpenses * 6;

    // 7. Build temporary context for AI
    const tempContext = {
      totals: { monthlyIncome: totalIncome, totalExpenses, netSavings },
      categories,
      goals,
      suggestedBudget,
      bracket,
      emergencyPlan: { required: emergencyRequired }
    };

    // 8. Generate insights using AI
    const aiResponse = await generateFinanceInsights(tempContext);

    // Extract reply + actions
    const aiReply = aiResponse.reply || "";
    const actions = Array.isArray(aiResponse.actions) ? aiResponse.actions : [];

    // Normalize + save actions
    if (actions.length > 0) {
      const normalized = actions.map(a => ({
        id: a.id || randomUUID(),
        ...a,
        createdAt: new Date()
      }));
    
      await FinancialContext.updateOne(
        { userId },
        { $push: { pendingActions: { $each: normalized } } }
      );
    }
    


    // 9. Save everything to FinancialContext
    await FinancialContext.updateOne(
      { userId },
      {
        $set: {
          totals: { monthlyIncome: totalIncome, totalExpenses, netSavings },
          categories,
          goals,
          emergencyPlan: { required: emergencyRequired },
          suggestedBudget,
          autoInsights: aiReply,
          lastUpdated: new Date()
        }
      },
      { upsert: true }
    );
    
    return true;

  } catch (err) {
    console.log("Context update error:", err);
    return false;
  }
};
