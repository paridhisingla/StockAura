const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 5000;


app.use(express.json());
app.use(cors());


mongoose.connect('mongodb://localhost:27017/stockaura', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));


const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const stockSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    maxStocks: { type: Number, required: true },
    sector: { type: String, required: true },
    marketCap: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  stockSchema.pre('save', function(next) {
    if (typeof this.maxStocks === 'string') {
      this.maxStocks = parseInt(this.maxStocks);
    }
    if (typeof this.price === 'string') {
      this.price = parseFloat(this.price);
    }
    next();
  });
  const Stock = mongoose.model('Stock', stockSchema);
  

app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password, phoneNumber } = req.body;

        
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        
        const user = new User({
            username,
            email,
            password: hashedPassword,
            phoneNumber
        });

        await user.save();
        const wallet = new Wallet({ userId: user._id, balance: 0 });
    await wallet.save();

        
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            'your_jwt_secret',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            'your_jwt_secret',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phoneNumber: user.phoneNumber
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});


app.get('/api/stocks', async (req, res) => {
    try {
        const stocks = await Stock.find().sort({ createdAt: -1 });
        res.json(stocks);
    } catch (error) {
        console.error('Error fetching stocks:', error);
        res.status(500).json({ message: 'Error fetching stocks' });
    }
});
  
  app.post('/api/stocks', async (req, res) => {
    try {
      const stock = new Stock(req.body);
      await stock.save();
      res.status(201).json(stock);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.put('/api/stocks/:id', async (req, res) => {
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
  });
  
  app.delete('/api/stocks/:id', async (req, res) => {
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
});
  app.put('/api/stocks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid stock ID format' });
        }

        const stock = await Stock.findById(id);
        if (!stock) {
            return res.status(404).json({ message: 'Stock not found' });
        }

        const updatedStock = await Stock.findByIdAndUpdate(
            id,
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );

        res.json(updatedStock);
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ message: 'Error updating stock' });
    }
});

  app.get('/api/stocks/:id', async (req, res) => {
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
});

  app.patch('/api/stocks/:id', async (req, res) => {
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
            { status :status, updatedAt: new Date() },
            { new: true }
        );

        res.json(updatedStock);
    } catch (error) {
        console.error('Error updating stock status:', error);
        res.status(500).json({ message: 'Error updating stock status' });
    }
});




const walletSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    balance: { type: Number, default: 0 },
    transactions: [{
      type: { type: String, enum: ['deposit', 'withdrawal', 'purchase', 'sale'] },
      amount: Number,
      stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock' },
      quantity: Number,
      date: { type: Date, default: Date.now }
    }]
  });
  
  const Wallet = mongoose.model('Wallet', walletSchema);
  
  const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock', required: true },
    type: { type: String, enum: ['buy', 'sell'], required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    date: { type: Date, default: Date.now }
  });
  
  const Transaction = mongoose.model('Transaction', transactionSchema);
  

  const portfolioSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stocks: [{
      stockId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stock' },
      quantity: { type: Number, required: true },
      purchasePrice: { type: Number, required: true }
    }]
  });
  
  const Portfolio = mongoose.model('Portfolio', portfolioSchema);
  
  
  userSchema.add({
    wallet: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' }
  });
  
  
  app.post('/api/wallet/deposit', async (req, res) => {
    try {
      const { userId, amount } = req.body;
      const wallet = await Wallet.findOneAndUpdate(
        { userId },
        { 
          $inc: { balance: amount },
          $push: { 
            transactions: {
              type: 'deposit',
              amount: amount
            }
          }
        },
        { new: true, upsert: true }
      );
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  

  app.post('/api/stocks/purchase', async (req, res) => {
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
  });
  
  app.get('/api/portfolio/:userId', async (req, res) => {
    try {
      const portfolio = await Portfolio.findOne({ userId: req.params.userId })
        .populate('stocks.stockId');
      const wallet = await Wallet.findOne({ userId: req.params.userId });
      let totalValue = 0;
    if (portfolio && portfolio.stocks) {
      totalValue = portfolio.stocks.reduce((sum, stock) => {
        return sum + (stock.quantity * stock.stockId.price);
      }, 0);
    }

 
    const enrichedPortfolio = portfolio ? {
      ...portfolio._doc,
      totalValue
    } : null;
      res.json({ portfolio: enrichedPortfolio, wallet });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  app.post('/api/stocks/purchase', async (req, res) => {
    try {
      const { userId, stockId, quantity } = req.body;
      
      const purchaseQuantity = parseInt(quantity);
  
  
      if (!userId || !stockId || !purchaseQuantity || purchaseQuantity <= 0) {
        return res.status(400).json({ message: 'Invalid purchase request' });
      }
  
      const stock = await Stock.findById(stockId);
      if (!stock) {
        return res.status(404).json({ message: 'Stock not found' });
      }

      const stockPrice = parseFloat(stock.price);
      const totalCost = stockPrice * purchaseQuantity;
  

      if (stock.maxStocks < purchaseQuantity) {
        return res.status(400).json({ message: 'Not enough stocks available' });
      }

      let wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        wallet = new Wallet({ userId, balance: 0 });
        await wallet.save();
      }

      if (wallet.balance < totalCost) {
        return res.status(400).json({ message: 'Insufficient funds' });
      }
  
      stock.maxStocks = stock.maxStocks - purchaseQuantity;

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
          purchasePrice: stockPrice
        });
      }
  
    
      await Promise.all([
        stock.save(),
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
  });
 
app.get('/api/migrate-stocks', async (req, res) => {
    try {
      const stocks = await Stock.find({});
      
      for (const stock of stocks) {
        stock.maxStocks = parseInt(stock.maxStocks);
        stock.price = parseFloat(stock.price);
        await stock.save();
      }
      
      res.json({ message: 'Migration completed' });
    } catch (error) {
      res.status(500).json({ message: 'Migration failed', error: error.message });
    }
  });


  app.post('/api/stocks/sell', async (req, res) => {
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
  });

 
app.get('/price-history', async (req, res) => {
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
});

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
app.get('/performance/:userId', async (req, res) => {
    try {
      const transactions = await Transaction.find({ userId: req.params.userId })
        .sort({ date: 1 });
      
      
      const performanceData = calculateDailyPortfolioValues(transactions);
      
      res.json(performanceData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


  app.get('/api/portfolio/history/:userId', async (req, res) => {
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
  });
  

  app.get('/api/transactions/:userId', async (req, res) => {
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
  });
 

app.get('/api/users', async (req, res) => {
    try {
      const users = await User.find()
        .select('-password') 
        .sort({ createdAt: -1 });
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  });
  

  app.get('/api/wallet/:userId', async (req, res) => {
    try {
      const wallet = await Wallet.findOne({ userId: req.params.userId });
      if (!wallet) {
        return res.status(404).json({ message: 'Wallet not found' });
      }
      res.json(wallet);
    } catch (error) {
      console.error('Error fetching wallet:', error);
      res.status(500).json({ message: 'Error fetching wallet details' });
    }
  });

  app.get('/api/portfolio/:userId', async (req, res) => {
    try {
      const portfolio = await Portfolio.findOne({ userId: req.params.userId })
        .populate({
          path: 'stocks.stockId',
          select: 'companyName price description sector marketCap'
        });
  
      if (!portfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
      }
  
      let totalValue = 0;
      if (portfolio.stocks) {
        totalValue = portfolio.stocks.reduce((sum, stock) => {
          return sum + (stock.quantity * stock.stockId.price);
        }, 0);
      }
  
      res.json({
        ...portfolio.toObject(),
        totalValue
      });
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      res.status(500).json({ message: 'Error fetching portfolio details' });
    }
  });
  

  app.get('/api/transactions/:userId', async (req, res) => {
    try {
      const transactions = await Transaction.find({ userId: req.params.userId })
        .populate({
          path: 'stockId',
          select: 'companyName price'
        })
        .sort({ date: -1 });
  
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ message: 'Error fetching transaction history' });
    }
  });
  
  
  app.get('/api/portfolio/history/:userId', async (req, res) => {
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
  });
  
  
  app.get('/api/users/:userId', async (req, res) => {
    try {
      const user = await User.findById(req.params.userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const [wallet, portfolio, transactions] = await Promise.all([
        Wallet.findOne({ userId: req.params.userId }),
        Portfolio.findOne({ userId: req.params.userId }).populate('stocks.stockId'),
        Transaction.find({ userId: req.params.userId })
          .populate('stockId')
          .sort({ date: -1 })
      ]);
  
      res.json({
        user,
        wallet,
        portfolio,
        transactions
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ message: 'Error fetching user details' });
    }
  });
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

