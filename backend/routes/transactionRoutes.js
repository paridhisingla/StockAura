const express = require('express');
const { purchaseStock, sellStock, getTransactions, getPortfolioHistory } = require('../controllers/transactionController');
const router = express.Router();

router.post('/purchase', purchaseStock);
router.post('/sell', sellStock);
router.get('/:userId', getTransactions);
router.get('/history/:userId', getPortfolioHistory);

module.exports = router;
