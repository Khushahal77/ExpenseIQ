import { useState, useEffect, useCallback } from 'react';
import { transactionsAPI } from '../services/api';
import { toast } from 'react-toastify';

const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
    type: '',
  });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.type) params.type = filters.type;
      const { data } = await transactionsAPI.getAll(params);
      setTransactions(data.transactions || data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch transactions');
      // Use mock data for demo
      setTransactions(getMockTransactions());
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (transaction) => {
    try {
      const { data } = await transactionsAPI.create(transaction);
      setTransactions((prev) => [data.transaction || data, ...prev]);
      toast.success('Transaction added! ✅');
      return { success: true };
    } catch (err) {
      // Demo mode: add locally
      const newTx = {
        _id: Date.now().toString(),
        ...transaction,
        createdAt: new Date().toISOString(),
      };
      setTransactions((prev) => [newTx, ...prev]);
      toast.success('Transaction added (demo mode) ✅');
      return { success: true };
    }
  };

  const updateTransaction = async (id, transaction) => {
    try {
      const { data } = await transactionsAPI.update(id, transaction);
      setTransactions((prev) =>
        prev.map((t) => (t._id === id ? (data.transaction || data) : t))
      );
      toast.success('Transaction updated! ✏️');
      return { success: true };
    } catch (err) {
      // Demo mode: update locally
      setTransactions((prev) =>
        prev.map((t) => (t._id === id ? { ...t, ...transaction } : t))
      );
      toast.success('Transaction updated (demo mode) ✏️');
      return { success: true };
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await transactionsAPI.delete(id);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      toast.success('Transaction deleted! 🗑️');
    } catch (err) {
      // Demo mode: delete locally
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      toast.success('Transaction deleted (demo mode) 🗑️');
    }
  };

  return {
    transactions,
    loading,
    error,
    filters,
    setFilters,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions,
  };
};

const getMockTransactions = () => [
  { _id: '1', type: 'income', amount: 5000, category: 'Salary', note: 'Monthly salary', date: '2026-03-01' },
  { _id: '2', type: 'expense', amount: 120, category: 'Food', note: 'Groceries at Walmart', date: '2026-03-02' },
  { _id: '3', type: 'expense', amount: 60, category: 'Transport', note: 'Uber rides', date: '2026-03-03' },
  { _id: '4', type: 'expense', amount: 200, category: 'Shopping', note: 'New headphones', date: '2026-03-04' },
  { _id: '5', type: 'income', amount: 800, category: 'Freelance', note: 'Web project payment', date: '2026-03-05' },
  { _id: '6', type: 'expense', amount: 1500, category: 'Rent', note: 'Monthly rent', date: '2026-03-01' },
  { _id: '7', type: 'expense', amount: 45, category: 'Entertainment', note: 'Netflix + Spotify', date: '2026-03-06' },
  { _id: '8', type: 'expense', amount: 85, category: 'Utilities', note: 'Electricity bill', date: '2026-03-07' },
  { _id: '9', type: 'income', amount: 300, category: 'Investment', note: 'Dividend payout', date: '2026-03-10' },
  { _id: '10', type: 'expense', amount: 150, category: 'Health', note: 'Gym membership', date: '2026-03-08' },
  { _id: '11', type: 'expense', amount: 75, category: 'Food', note: 'Dinner out', date: '2026-03-12' },
  { _id: '12', type: 'expense', amount: 350, category: 'Shopping', note: 'Clothing', date: '2026-03-15' },
];

export default useTransactions;
