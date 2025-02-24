const mongoose = require('mongoose');

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

module.exports = Wallet;
