const express = require('express');
const router = express.Router();
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

router.get('/:userId', auth, async (req, res) => {
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

        res.json({ 
            portfolio: portfolio ? {
                ...portfolio._doc,
                totalValue
            } : null, 
            wallet 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/history/:userId', auth, async (req, res) => {
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

module.exports = router;