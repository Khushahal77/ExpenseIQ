const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

const toObjectId = (id) => new mongoose.Types.ObjectId(id);
const getSummary = async (req, res, next) => {
  try {
    const result = await Transaction.aggregate([
      { $match: { userId: toObjectId(req.user.id) } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    result.forEach((r) => {
      if (r._id === 'income') totalIncome = r.total;
      if (r._id === 'expense') totalExpense = r.total;
    });

    res.json({
      totalIncome,
      totalExpense,
      savings: totalIncome - totalExpense,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/categories
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const result = await Transaction.aggregate([
      { $match: { userId: toObjectId(req.user.id), type: 'expense' } },
      {
        $group: {
          _id: '$category',
          value: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { value: -1 } },
      {
        $project: {
          _id: 0,
          name: '$_id',
          value: 1,
          count: 1,
        },
      },
    ]);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/monthly
const getMonthlyTrend = async (req, res, next) => {
  try {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const result = await Transaction.aggregate([
      { $match: { userId: toObjectId(req.user.id) } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Reshape data
    const monthlyMap = {};
    result.forEach((r) => {
      const key = `${r._id.year}-${r._id.month}`;
      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          name: `${months[r._id.month - 1]} ${r._id.year}`,
          income: 0,
          expense: 0,
        };
      }
      monthlyMap[key][r._id.type] = r.total;
    });

    res.json(Object.values(monthlyMap));
  } catch (error) {
    next(error);
  }
};

module.exports = { getSummary, getCategoryBreakdown, getMonthlyTrend };
