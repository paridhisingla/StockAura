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
    price: { type: String, required: true },
    maxStocks: { type: String, required: true },
    sector: { type: String, required: true },
    marketCap: { type: String, required: true },
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
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
            { status, updatedAt: new Date() },
            { new: true }
        );

        res.json(updatedStock);
    } catch (error) {
        console.error('Error updating stock status:', error);
        res.status(500).json({ message: 'Error updating stock status' });
    }
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));