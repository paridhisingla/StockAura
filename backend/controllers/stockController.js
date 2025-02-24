const Stock = require('../models/Stock');

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

exports.getStockById = async (req, res) => {
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
