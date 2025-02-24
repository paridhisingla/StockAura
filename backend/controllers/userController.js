const User = require('../models/User');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

exports.getUserById = async (req, res) => {
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
};
