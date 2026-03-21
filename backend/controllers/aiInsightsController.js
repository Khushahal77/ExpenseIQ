const Transaction = require('../models/Transaction');

// POST /api/ai-insights/generate
const generateInsights = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch user's transactions
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });

    if (transactions.length === 0) {
      return res.json({
        insights: ['No transactions found. Start adding your income and expenses to get personalized insights.'],
        suggestions: ['Begin tracking your daily expenses to understand your spending patterns.'],
        prediction: {
          nextMonthExpense: 0,
          nextMonthSavings: 0,
          trend: 'neutral',
          confidence: 0,
          summary: 'Add more transactions to enable AI predictions.',
        },
      });
    }

    // Calculate financial metrics
    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0;

    // Category breakdown
    const categoryTotals = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const sortedCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1]);

    const topCategory = sortedCategories[0];
    const topCategoryPct = totalExpense > 0 ? ((topCategory[1] / totalExpense) * 100).toFixed(0) : 0;

    // Monthly analysis
    const monthlyExpenses = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const month = t.date.toISOString().substring(0, 7);
        monthlyExpenses[month] = (monthlyExpenses[month] || 0) + t.amount;
      });

    const monthlyValues = Object.values(monthlyExpenses);
    const avgMonthlyExpense = monthlyValues.length > 0
      ? monthlyValues.reduce((s, v) => s + v, 0) / monthlyValues.length
      : 0;

    const lastMonthKey = Object.keys(monthlyExpenses).sort().pop();
    const lastMonthExpense = monthlyExpenses[lastMonthKey] || 0;
    const monthOverMonthChange = avgMonthlyExpense > 0
      ? (((lastMonthExpense - avgMonthlyExpense) / avgMonthlyExpense) * 100).toFixed(0)
      : 0;

    // ---- Generate Insights ----
    const insights = [];

    // Top spending category
    if (topCategory) {
      insights.push(
        `Your highest spending category is "${topCategory[0]}" at ₹${topCategory[1].toLocaleString()}, which accounts for ${topCategoryPct}% of your total expenses.`
      );
    }

    // Savings rate
    if (savingsRate > 30) {
      insights.push(`Excellent savings rate of ${savingsRate}%! You're saving more than the recommended 20% threshold.`);
    } else if (savingsRate > 15) {
      insights.push(`Your savings rate is ${savingsRate}%. Good progress, but aim for 20%+ for long-term financial health.`);
    } else if (savingsRate > 0) {
      insights.push(`Your savings rate is only ${savingsRate}%. Consider reducing discretionary spending to boost savings.`);
    } else {
      insights.push(`⚠️ You're spending more than you earn. Immediate action needed to control expenses.`);
    }

    // Monthly trend
    if (monthOverMonthChange > 10) {
      insights.push(`Your spending increased by ${monthOverMonthChange}% compared to your average. Review recent transactions for unnecessary expenses.`);
    } else if (monthOverMonthChange < -10) {
      insights.push(`Great job! Your spending decreased by ${Math.abs(monthOverMonthChange)}% compared to your average.`);
    } else {
      insights.push(`Your spending is consistent with your monthly average of ₹${avgMonthlyExpense.toLocaleString('en-IN', { maximumFractionDigits: 0 })}.`);
    }

    // Category diversity
    if (sortedCategories.length > 1) {
      const bottomCategory = sortedCategories[sortedCategories.length - 1];
      insights.push(
        `Your lowest expense category is "${bottomCategory[0]}" at ₹${bottomCategory[1].toLocaleString()}. Total tracked across ${sortedCategories.length} categories.`
      );
    }

    // Income consistency
    const incomeTransactions = transactions.filter((t) => t.type === 'income');
    if (incomeTransactions.length >= 2) {
      const avgIncome = totalIncome / incomeTransactions.length;
      insights.push(`Your average income per transaction is ₹${avgIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}. Track regularly for better predictions.`);
    }

    // ---- Generate Suggestions ----
    const suggestions = [];

    if (topCategory && parseFloat(topCategoryPct) > 30) {
      suggestions.push(`Consider setting a monthly budget cap for "${topCategory[0]}" — it takes up ${topCategoryPct}% of your spending.`);
    }

    if (savingsRate < 20) {
      suggestions.push('Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Automate a fixed savings transfer each month.');
    }

    suggestions.push(`Set up a monthly budget of ₹${(avgMonthlyExpense * 0.9).toLocaleString('en-IN', { maximumFractionDigits: 0 })} to push for a 10% reduction in expenses.`);

    if (sortedCategories.length >= 3) {
      const third = sortedCategories[2];
      suggestions.push(`Review "${third[0]}" spending (₹${third[1].toLocaleString()}) — small optimizations across multiple categories add up.`);
    }

    suggestions.push('Build an emergency fund covering 3-6 months of expenses for financial security.');

    // ---- Generate Prediction ----
    const predictedExpense = Math.round(avgMonthlyExpense * (1 + parseFloat(monthOverMonthChange) / 200));
    const avgMonthlyIncome = totalIncome / Math.max(Object.keys(monthlyExpenses).length, 1);
    const predictedSavings = Math.max(0, Math.round(avgMonthlyIncome - predictedExpense));
    const trend = predictedSavings > avgMonthlyExpense * 0.15 ? 'positive' : predictedSavings > 0 ? 'stable' : 'negative';
    const confidence = Math.min(95, Math.max(40, 50 + transactions.length * 2));

    const prediction = {
      nextMonthExpense: predictedExpense,
      nextMonthSavings: predictedSavings,
      trend,
      confidence,
      summary: `Based on ${transactions.length} transactions, we predict expenses of ~₹${predictedExpense.toLocaleString()} next month with potential savings of ₹${predictedSavings.toLocaleString()}. Your financial trend is ${trend} with ${confidence}% confidence.`,
    };

    res.json({ insights, suggestions, prediction });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateInsights };
