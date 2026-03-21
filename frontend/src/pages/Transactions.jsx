import { useState } from 'react';
import Card from '../components/Card';
import Modal from '../components/Modal';
import TransactionForm from '../components/TransactionForm';
import { LoadingSpinner } from '../components/LoadingSpinner';
import useTransactions from '../hooks/useTransactions';
import { format } from 'date-fns';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineFilter,
  HiOutlineSearch,
  HiOutlineX,
} from 'react-icons/hi';

const CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Food', 'Transport',
  'Shopping', 'Rent', 'Utilities', 'Entertainment', 'Health', 'Education', 'Other'
];

const CATEGORY_ICONS = {
  Salary: '💼', Freelance: '💻', Investment: '📈', Food: '🍔', Transport: '🚗',
  Shopping: '🛍️', Rent: '🏠', Utilities: '💡', Entertainment: '🎬', Health: '🏥',
  Education: '📚', Other: '📌',
};

const Transactions = () => {
  const {
    transactions, loading, filters, setFilters,
    addTransaction, updateTransaction, deleteTransaction,
  } = useTransactions();

  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleAdd = async (data) => {
    await addTransaction(data);
    setShowModal(false);
  };

  const handleEdit = async (data) => {
    await updateTransaction(editingTx._id, data);
    setEditingTx(null);
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    await deleteTransaction(id);
    setDeleteConfirm(null);
  };

  const openEditModal = (tx) => {
    setEditingTx(tx);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTx(null);
  };

  const clearFilters = () => {
    setFilters({ category: '', startDate: '', endDate: '', type: '' });
    setSearchQuery('');
  };

  // Filter transactions locally
  const filteredTransactions = transactions.filter((tx) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !tx.category?.toLowerCase().includes(query) &&
        !tx.note?.toLowerCase().includes(query)
      ) return false;
    }
    if (filters.category && tx.category !== filters.category) return false;
    if (filters.type && tx.type !== filters.type) return false;
    if (filters.startDate && tx.date < filters.startDate) return false;
    if (filters.endDate && tx.date > filters.endDate) return false;
    return true;
  });

  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const hasActiveFilters = filters.category || filters.type || filters.startDate || filters.endDate || searchQuery;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Transactions</h1>
          <p className="text-dark-400 mt-1">Manage your income and expenses</p>
        </div>
        <button onClick={() => { setEditingTx(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card padding="p-4">
          <p className="text-xs text-dark-400 uppercase tracking-wider">Count</p>
          <p className="text-xl font-bold text-white mt-1">{filteredTransactions.length}</p>
        </Card>
        <Card padding="p-4">
          <p className="text-xs text-dark-400 uppercase tracking-wider">Income</p>
          <p className="text-xl font-bold text-emerald-400 mt-1">₹{totalIncome.toLocaleString()}</p>
        </Card>
        <Card padding="p-4">
          <p className="text-xs text-dark-400 uppercase tracking-wider">Expense</p>
          <p className="text-xl font-bold text-red-400 mt-1">₹{totalExpense.toLocaleString()}</p>
        </Card>
        <Card padding="p-4">
          <p className="text-xs text-dark-400 uppercase tracking-wider">Net</p>
          <p className={`text-xl font-bold mt-1 ${totalIncome - totalExpense >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            ₹{Math.abs(totalIncome - totalExpense).toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card padding="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="input-field pl-10 py-2.5"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-primary-500/20 border-primary-500/30 text-primary-400' : ''}`}
          >
            <HiOutlineFilter className="w-5 h-5" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-primary-400"></span>
            )}
          </button>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn-secondary flex items-center gap-2 text-red-400 hover:text-red-300">
              <HiOutlineX className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-dark-700/50 animate-slide-up">
            <div>
              <label className="label-text">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="input-field py-2"
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label className="label-text">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="input-field py-2"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">From Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="input-field py-2"
              />
            </div>
            <div>
              <label className="label-text">To Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="input-field py-2"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Transactions List */}
      <Card padding="p-0">
        {loading ? (
          <div className="p-6">
            <LoadingSpinner text="Loading transactions..." />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-dark-800/50 flex items-center justify-center mx-auto mb-4">
              <HiOutlineSearch className="w-8 h-8 text-dark-500" />
            </div>
            <p className="text-dark-400 text-lg">No transactions found</p>
            <p className="text-dark-500 text-sm mt-1">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Add your first transaction to get started'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dark-700/30">
            {filteredTransactions.map((tx, index) => (
              <div
                key={tx._id}
                className="flex items-center justify-between p-4 lg:p-5 hover:bg-dark-700/20 transition-colors group"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-center gap-3 lg:gap-4 flex-1 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                    tx.type === 'income' ? 'bg-emerald-500/10' : 'bg-dark-700/50'
                  }`}>
                    {CATEGORY_ICONS[tx.category] || '📌'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-dark-100 truncate">{tx.category}</p>
                      <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        tx.type === 'income'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {tx.type}
                      </span>
                    </div>
                    <p className="text-xs text-dark-400 truncate mt-0.5">{tx.note || 'No note'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 lg:gap-6">
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-dark-500">
                      {tx.date ? format(new Date(tx.date), 'MMM d, yyyy') : ''}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(tx)}
                      className="p-2 rounded-lg hover:bg-primary-500/10 text-dark-400 hover:text-primary-400 transition-colors"
                      title="Edit"
                    >
                      <HiOutlinePencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(tx._id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-dark-400 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingTx ? 'Edit Transaction' : 'Add Transaction'}
      >
        <TransactionForm
          onSubmit={editingTx ? handleEdit : handleAdd}
          initialData={editingTx}
          onCancel={closeModal}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Transaction"
        maxWidth="max-w-sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <HiOutlineTrash className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-dark-200 mb-2">Are you sure you want to delete this transaction?</p>
          <p className="text-dark-400 text-sm mb-6">This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger flex-1">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Transactions;
