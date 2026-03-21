import { useState } from 'react';

const CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Food', 'Transport',
  'Shopping', 'Rent', 'Utilities', 'Entertainment', 'Health', 'Education', 'Other'
];

const TransactionForm = ({ onSubmit, initialData = null, onCancel }) => {
  const [formData, setFormData] = useState({
    type: initialData?.type || 'expense',
    amount: initialData?.amount || '',
    category: initialData?.category || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    note: initialData?.note || '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.date) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type Toggle */}
      <div>
        <label className="label-text">Transaction Type</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleChange('type', 'income')}
            className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              formData.type === 'income'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-dark-800/50 text-dark-400 border border-dark-700/50 hover:bg-dark-700/50'
            }`}
          >
            💰 Income
          </button>
          <button
            type="button"
            onClick={() => handleChange('type', 'expense')}
            className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
              formData.type === 'expense'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-dark-800/50 text-dark-400 border border-dark-700/50 hover:bg-dark-700/50'
            }`}
          >
            💸 Expense
          </button>
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="label-text">Amount (₹)</label>
        <input
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
          placeholder="Enter amount"
          className={`input-field ${errors.amount ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''}`}
        />
        {errors.amount && <p className="text-red-400 text-xs mt-1">{errors.amount}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="label-text">Category</label>
        <select
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className={`input-field ${errors.category ? 'border-red-500/50' : ''}`}
        >
          <option value="">Select category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
      </div>

      {/* Date */}
      <div>
        <label className="label-text">Date</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => handleChange('date', e.target.value)}
          className={`input-field ${errors.date ? 'border-red-500/50' : ''}`}
        />
        {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
      </div>

      {/* Note */}
      <div>
        <label className="label-text">Note (optional)</label>
        <textarea
          value={formData.note}
          onChange={(e) => handleChange('note', e.target.value)}
          placeholder="Add a note..."
          rows={2}
          className="input-field resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary flex-1">
          {initialData ? 'Update Transaction' : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
