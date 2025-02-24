const Wallet = require('../models/Wallet');

exports.deposit = async (req, res) => {
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
};

exports.getWallet = async (req, res) => {
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
};
