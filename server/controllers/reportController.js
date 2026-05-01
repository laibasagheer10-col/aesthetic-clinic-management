const Payment = require('../models/finance/Payment');
const Expense = require('../models/finance/Expense');

exports.getFinancialSummary = async (req, res) => {
  try {
    const totalRevenue = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalExpense = await Expense.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const revenue = totalRevenue[0]?.total || 0;
    const expense = totalExpense[0]?.total || 0;

    res.json({
      revenue,
      expense,
      profit: revenue - expense
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};