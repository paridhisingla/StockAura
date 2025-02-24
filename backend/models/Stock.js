const mongoose = require('mongoose');

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
module.exports = Stock;
