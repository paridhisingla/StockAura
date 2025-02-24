const Transaction = require('../models/transactionModel');

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId })
      .populate('stockId')
      .sort({ date: -1 });

    const enrichedTransactions = transactions.map(t => ({
      ...t._doc,
      currentPrice: t.stockId.price,
      purchasePrice: t.price
    }));

    res.json(enrichedTransactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
