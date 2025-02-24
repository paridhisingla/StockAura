const Transaction = require('../models/Transaction');
const Stock = require('../models/Stock');
const Wallet = require('../models/Wallet');
const Portfolio = require('../models/Portfolio');

exports.purchaseStock = async (req, res) => {
  try {
    const { userId, stockId, quantity } = req.body;
    const purchaseQuantity = parseInt(quantity);

    if (!userId || !stockId || !purchaseQuantity || purchaseQuantity <= 0) {
      return res.status(400).json({ message: 'Invalid purchase request' });
    }

    const stock = await Stock.findOneAndUpdate(
      {
        _id: stockId,
        maxStocks: { $gte: purchaseQuantity }
      },
      {
        $inc: { maxStocks: -purchaseQuantity }
      },
      { new: true }
    );

    if (!stock) {
      return res.status(400).json({ message: 'Stock not available in requested quantity' });
    }

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId, balance: 0 });
    }

    const totalCost = stock.price * purchaseQuantity;

    if (wallet.balance < totalCost) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    wallet.balance -= totalCost;
    wallet.transactions.push({
      type: 'purchase',
      amount: totalCost,
      stockId,
      quantity: purchaseQuantity
    });

    let portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      portfolio = new Portfolio({ userId, stocks: [] });
    }

    const existingStockIndex = portfolio.stocks.findIndex(
      item => item.stockId.toString() === stockId
    );

    if (existingStockIndex !== -1) {
      const existingStock = portfolio.stocks[existingStockIndex];
      const newQuantity = existingStock.quantity + purchaseQuantity;
      const newTotalCost = existingStock.purchasePrice * existingStock.quantity + totalCost;
      portfolio.stocks[existingStockIndex] = {
        stockId,
        quantity: newQuantity,
        purchasePrice: newTotalCost / newQuantity
      };
    } else {
      portfolio.stocks.push({
        stockId,
        quantity: purchaseQuantity,
        purchasePrice: stock.price
      });
    }

    await Promise.all([
      wallet.save(),
      portfolio.save()
    ]);

    res.json({
      message: 'Purchase successful',
      wallet,
      portfolio
    });

  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

exports.sellStock = async (req, res) => {
  try {
    const { userId, stockId, quantity, price } = req.body;

    if (!userId || !stockId || !quantity || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    const stockIndex = portfolio.stocks.findIndex(
      item => item.stockId.toString() === stockId
    );

    if (stockIndex === -1) {
      return res.status(404).json({ message: 'Stock not found in portfolio' });
    }

    const stockInPortfolio = portfolio.stocks[stockIndex];

    if (stockInPortfolio.quantity < quantity) {
      return res.status(400).json({ message: 'Not enough shares to sell' });
    }

    const saleAmount = price * quantity;

    if (stockInPortfolio.quantity === quantity) {
      portfolio.stocks.splice(stockIndex, 1);
    } else {
      portfolio.stocks[stockIndex].quantity -= quantity;
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    wallet.balance += saleAmount;
    wallet.transactions.push({
      type: 'sale',
      amount: saleAmount,
      stockId,
      quantity
    });

    const stock = await Stock.findById(stockId);
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    stock.maxStocks = stock.maxStocks + quantity;

    await Promise.all([
      portfolio.save(),
      wallet.save(),
      stock.save()
    ]);

    await Transaction.create({
      userId: userId,
      stockId: stockId,
      type: 'sell',
      quantity: quantity,
      price: price
    });

    res.json({
      message: 'Sale successful',
      wallet,
      portfolio
    });

  } catch (error) {
    console.error('Sale error:', error);
    res.status(500).json({
      message: 'Error processing sale',
      error: error.message
    });
  }
};

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

exports.getPortfolioHistory = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.params.userId })
      .populate({
        path: 'stocks.stockId',
        select: 'price'
      });

    const wallet = await Wallet.findOne({ userId: req.params.userId });

    let totalValue = 0;
    if (portfolio?.stocks) {
      totalValue = portfolio.stocks.reduce((sum, stock) => {
        return sum + (stock.quantity * stock.stockId.price);
      }, 0);
    }
    if (wallet) {
      totalValue += wallet.balance;
    }

    const transactions = await Transaction.find({ userId: req.params.userId })
      .sort({ date: 1 });

    let historyPoints = [];
    let runningValue = 0;

    transactions.forEach(transaction => {
      if (transaction.type === 'buy') {
        runningValue -= transaction.price * transaction.quantity;
      } else {
        runningValue += transaction.price * transaction.quantity;
      }

      historyPoints.push({
        date: transaction.date,
        totalValue: runningValue
      });
    });

    historyPoints.push({
      date: new Date(),
      totalValue
    });

    res.json(historyPoints);
  } catch (error) {
    console.error('Error fetching portfolio history:', error);
    res.status(500).json({ message: 'Error fetching portfolio history' });
  }
};
