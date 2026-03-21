const Transaction = require('../models/Transaction');
const User = require('../models/User');

// GET /api/transactions
const getTransactions = async (req, res, next) => {
  try {
    const { category, type, startDate, endDate, page = 1, limit = 50 } = req.query;

    const filter = { userId: req.user.id };
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/transactions
const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, date, note, isRecurring, recurringFrequency } = req.body;

    // Validate
    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be income or expense' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const transaction = await Transaction.create({
      userId: req.user.id,
      type,
      amount,
      category: category.trim(),
      date: date || new Date(),
      note: note?.trim() || '',
      isRecurring: isRecurring || false,
      recurringFrequency: recurringFrequency || null,
    });

    // Budget alert check
    if (type === 'expense') {
      await checkBudgetAlert(req.user.id, res);
    }

    res.status(201).json({ transaction });
  } catch (error) {
    next(error);
  }
};

// PUT /api/transactions/:id
const updateTransaction = async (req, res, next) => {
  try {
    const { type, amount, category } = req.body;

    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be income or expense' });
    }
    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/transactions/:id
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Budget alert helper
const checkBudgetAlert = async (userId, res) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.budget || user.budget <= 0) return;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const result = await Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          type: 'expense',
          date: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalExpense = result[0]?.total || 0;
    if (totalExpense >= user.budget * 0.8) {
      res.set('X-Budget-Alert', 'true');
      res.set(
        'X-Budget-Message',
        totalExpense >= user.budget
          ? `Budget exceeded! Spent ${totalExpense} of ${user.budget}`
          : `Warning: 80%+ of budget used. Spent ${totalExpense} of ${user.budget}`
      );
    }
  } catch (err) {
    console.error('Budget alert check failed:', err.message);
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
