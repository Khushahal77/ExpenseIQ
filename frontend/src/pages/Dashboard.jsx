import { useState, useEffect } from 'react';
import Card from '../components/Card';
import { LoadingSpinner, LoadingSkeleton } from '../components/LoadingSpinner';
import { analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineCash,
  HiOutlineClock,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
} from 'react-icons/hi';
import { format } from 'date-fns';
import useTransactions from '../hooks/useTransactions';

const CATEGORY_ICONS = {
  Salary: '💼', Freelance: '💻', Investment: '📈', Food: '🍔', Transport: '🚗',
  Shopping: '🛍️', Rent: '🏠', Utilities: '💡', Entertainment: '🎬', Health: '🏥',
  Education: '📚', Other: '📌',
};

const Dashboard = () => {
  const { user } = useAuth();
  const { transactions, loading } = useTransactions();
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await analyticsAPI.getSummary();
        setSummary(data);
      } catch {
        // Calculate from transactions
        const income = transactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        setSummary({ totalIncome: income, totalExpense: expense, savings: income - expense });
      } finally {
        setSummaryLoading(false);
      }
    };

    if (transactions.length > 0 || !loading) {
      fetchSummary();
    }
  }, [transactions, loading]);

  const recentTransactions = transactions.slice(0, 8);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            {getGreeting()}, <span className="gradient-text">{user?.name?.split(' ')[0] || 'User'}</span> 👋
          </h1>
          <p className="text-dark-400 mt-1">Here&apos;s your financial overview</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-dark-400">
          <HiOutlineClock className="w-4 h-4" />
          {format(new Date(), 'EEEE, MMM d, yyyy')}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {summaryLoading ? (
          <>
            <LoadingSkeleton className="h-36" />
            <LoadingSkeleton className="h-36" />
            <LoadingSkeleton className="h-36" />
          </>
        ) : (
          <>
            {/* Total Income */}
            <Card className="stat-card group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <HiOutlineTrendingUp className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    <HiOutlineArrowUp className="w-3 h-3" /> Income
                  </span>
                </div>
                <h3 className="text-sm font-medium text-dark-400">Total Income</h3>
                <p className="text-2xl lg:text-3xl font-bold text-white mt-1">
                  ₹{summary?.totalIncome?.toLocaleString() || '0'}
                </p>
              </div>
            </Card>

            {/* Total Expense */}
            <Card className="stat-card group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-colors duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <HiOutlineTrendingDown className="w-6 h-6 text-red-400" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full">
                    <HiOutlineArrowDown className="w-3 h-3" /> Expense
                  </span>
                </div>
                <h3 className="text-sm font-medium text-dark-400">Total Expense</h3>
                <p className="text-2xl lg:text-3xl font-bold text-white mt-1">
                  ₹{summary?.totalExpense?.toLocaleString() || '0'}
                </p>
              </div>
            </Card>

            {/* Savings */}
            <Card className="stat-card group sm:col-span-2 lg:col-span-1">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-colors duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center">
                    <HiOutlineCash className="w-6 h-6 text-primary-400" />
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                    (summary?.savings || 0) >= 0
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-red-400 bg-red-500/10'
                  }`}>
                    {(summary?.savings || 0) >= 0 ? <HiOutlineArrowUp className="w-3 h-3" /> : <HiOutlineArrowDown className="w-3 h-3" />}
                    Savings
                  </span>
                </div>
                <h3 className="text-sm font-medium text-dark-400">Net Savings</h3>
                <p className={`text-2xl lg:text-3xl font-bold mt-1 ${
                  (summary?.savings || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  ₹{Math.abs(summary?.savings || 0).toLocaleString()}
                </p>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Recent Transactions */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
          <a href="/transactions" className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors">
            View All →
          </a>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading transactions..." />
        ) : recentTransactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-dark-400 text-lg">No transactions yet</p>
            <p className="text-dark-500 text-sm mt-1">Add your first transaction to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx, index) => (
              <div
                key={tx._id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-dark-700/30 transition-colors group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    tx.type === 'income' ? 'bg-emerald-500/10' : 'bg-dark-700/50'
                  }`}>
                    {CATEGORY_ICONS[tx.category] || '📌'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark-100">{tx.category}</p>
                    <p className="text-xs text-dark-400">{tx.note || 'No note'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount?.toLocaleString()}
                  </p>
                  <p className="text-xs text-dark-500">
                    {tx.date ? format(new Date(tx.date), 'MMM d') : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
