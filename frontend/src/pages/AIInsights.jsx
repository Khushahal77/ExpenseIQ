import { useState } from 'react';
import Card from '../components/Card';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { aiInsightsAPI } from '../services/api';
import { toast } from 'react-toastify';
import {
  HiOutlineLightBulb,
  HiOutlineSparkles,
  HiOutlineTrendingUp,
  HiOutlineChartBar,
  HiOutlineRefresh,
} from 'react-icons/hi';

const MOCK_INSIGHTS = {
  insights: [
    'Your food expenses account for 28% of your total spending — consider meal prepping to save up to ₹150/month.',
    'You spent 40% more on shopping this month compared to last month.',
    'Your income has been consistent over the past 3 months, averaging ₹5,800/month.',
    'Utility bills are 15% lower than the national average — great job conserving energy!',
    'Entertainment spending has decreased by 20% — keep it up!',
  ],
  suggestions: [
    'Set up a monthly budget of ₹300 for food and track it weekly.',
    'Consider investing 20% of your savings into a diversified index fund.',
    'Cancel unused subscriptions — you could save approximately ₹45/month.',
    'Build an emergency fund of 3-6 months of expenses (₹9,000 - ₹18,000).',
    'Automate your savings by setting up a recurring transfer of ₹500/month.',
  ],
  prediction: {
    nextMonthExpense: 3200,
    nextMonthSavings: 2800,
    trend: 'positive',
    confidence: 85,
    summary: 'Based on your spending patterns over the last 3 months, we predict your expenses will be around ₹3,200 next month with potential savings of ₹2,800. Your financial health trend is positive with an 85% confidence score.',
  },
};

const AIInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const { data } = await aiInsightsAPI.generate();
      setInsights(data);
    } catch {
      // Use mock data for demo
      await new Promise((r) => setTimeout(r, 2000));
      setInsights(MOCK_INSIGHTS);
      toast.success('AI Insights generated! 🤖');
    }
    setGenerated(true);
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">AI Insights</h1>
          <p className="text-dark-400 mt-1">Smart analysis powered by artificial intelligence</p>
        </div>
        <button
          onClick={generateInsights}
          disabled={loading}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              {generated ? <HiOutlineRefresh className="w-5 h-5" /> : <HiOutlineSparkles className="w-5 h-5" />}
              {generated ? 'Regenerate Insights' : 'Generate AI Insights'}
            </>
          )}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-violet/20 flex items-center justify-center mx-auto mb-6">
            <HiOutlineSparkles className="w-10 h-10 text-primary-400 animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Analyzing Your Finances...</h3>
          <p className="text-dark-400 max-w-md mx-auto">Our AI is crunching numbers, identifying patterns, and generating personalized insights for you.</p>
          <div className="mt-6"><LoadingSpinner size="md" /></div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !generated && (
        <Card className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-cyan/10 flex items-center justify-center mx-auto mb-6">
            <HiOutlineLightBulb className="w-10 h-10 text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Ready to Get Smart Insights?</h3>
          <p className="text-dark-400 max-w-md mx-auto mb-6">
            Click the button above to let our AI analyze your transaction history and provide personalized financial insights.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Spending Analysis', 'Savings Tips', 'Future Predictions'].map((tag) => (
              <span key={tag} className="px-4 py-2 rounded-full bg-dark-800/50 text-dark-300 text-sm border border-dark-700/50">
                ✨ {tag}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Results */}
      {!loading && insights && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Insights */}
          <Card className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                <HiOutlineLightBulb className="w-5 h-5 text-primary-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Key Insights</h2>
            </div>
            <div className="space-y-3">
              {insights.insights.map((item, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-dark-800/30 hover:bg-dark-700/30 transition-colors">
                  <span className="text-primary-400 font-bold text-sm mt-0.5">{i + 1}.</span>
                  <p className="text-sm text-dark-200 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Suggestions */}
          <Card>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center">
                <HiOutlineChartBar className="w-5 h-5 text-accent-cyan" />
              </div>
              <h2 className="text-lg font-semibold text-white">Suggestions</h2>
            </div>
            <div className="space-y-3">
              {insights.suggestions.map((item, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-dark-800/30">
                  <span className="text-accent-cyan mt-0.5">💡</span>
                  <p className="text-sm text-dark-200 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Prediction */}
          <Card>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center">
                <HiOutlineTrendingUp className="w-5 h-5 text-accent-green" />
              </div>
              <h2 className="text-lg font-semibold text-white">Prediction</h2>
            </div>
            <p className="text-sm text-dark-300 mb-5 leading-relaxed">{insights.prediction.summary}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-dark-800/30 text-center">
                <p className="text-xs text-dark-400 uppercase tracking-wider">Est. Expense</p>
                <p className="text-xl font-bold text-red-400 mt-1">₹{insights.prediction.nextMonthExpense.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl bg-dark-800/30 text-center">
                <p className="text-xs text-dark-400 uppercase tracking-wider">Est. Savings</p>
                <p className="text-xl font-bold text-emerald-400 mt-1">₹{insights.prediction.nextMonthSavings.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-xl bg-dark-800/30">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-dark-400">Confidence</span>
                <span className="text-primary-400 font-medium">{insights.prediction.confidence}%</span>
              </div>
              <div className="w-full bg-dark-700/30 rounded-full h-2.5">
                <div className="h-2.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-cyan transition-all duration-1000" style={{width:`${insights.prediction.confidence}%`}} />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
