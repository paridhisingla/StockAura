const Stock = require('../models/stockModel');
const Wallet = require('../models/walletModel');
const Portfolio = require('../models/portfolioModel');
const Transaction = require('../models/transactionModel');

exports.getStocks = async (req, res) => {
  try {
    const stocks = await Stock.find().sort({ createdAt: -1 });
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({ message: 'Error fetching stocks' });
  }
};

exports.createStock = async (req, res) => {
  try {
    const stock = new Stock(req.body);
    await stock.save();
    res.status(201).json(stock);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const stock = await Stock.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteStock = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid stock ID format' });
    }

    const stock = await Stock.findById(id);
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    await Stock.findByIdAndDelete(id);
    res.json({ message: 'Stock deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock:', error);
    res.status(500).json({ message: 'Error deleting stock' });
  }
};

exports.getStock = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid stock ID format' });
    }

    const stock = await Stock.findById(id);
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    res.json(stock);
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ message: 'Error fetching stock' });
  }
};

exports.updateStockStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid stock ID format' });
    }

    const stock = await Stock.findById(id);
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    const updatedStock = await Stock.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    res.json(updatedStock);
  } catch (error) {
    console.error('Error updating stock status:', error);
    res.status(500).json({ message: 'Error updating stock status' });
  }
};

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

    await Transaction.create({
      userId: userId,
      stockId: stockId,
      type: 'buy',
      quantity: purchaseQuantity,
      price: stock.price
    });

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

exports.getPriceHistory = async (req, res) => {
  try {
    const stocks = await Stock.find();
    const priceHistories = {};

    stocks.forEach(stock => {
      const history = generatePriceHistory(stock.price);
      priceHistories[stock._id] = history;
    });

    res.json(priceHistories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function generatePriceHistory(currentPrice) {
  const days = 30;
  const history = [];
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const variance = (Math.random() - 0.5) * 10;
    history.push({
      date,
      price: currentPrice + variance
    });
  }
  return history;
}

exports.getPerformanceData = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId })
      .sort({ date: 1 });

    const performanceData = calculateDailyPortfolioValues(transactions);

    res.json(performanceData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPortfolioHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId })
      .sort({ date: 1 });

    const dailyValues = [];
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));

    for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dayTransactions = transactions.filter(t =>
        new Date(t.date).toDateString() === d.toDateString()
      );

      let dayValue = 0;
      dayTransactions.forEach(t => {
        if (t.type === 'buy') {
          dayValue += t.price * t.quantity;
        } else if (t.type === 'sell') {
          dayValue -= t.price * t.quantity;
        }
      });

      dailyValues.push({
        date: new Date(d),
        totalValue: dayValue
      });
    }

    res.json(dailyValues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
