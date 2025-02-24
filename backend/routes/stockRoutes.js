const express = require('express');
const {
  getStocks,
  createStock,
  updateStock,
  deleteStock,
  getStock,
  updateStockStatus,
  purchaseStock,
  sellStock,
  getPriceHistory,
  getPerformanceData,
  getPortfolioHistory
} = require('../controllers/stockController');

const router = express.Router();

router.get('/', getStocks);
router.post('/', createStock);
router.put('/:id', updateStock);
router.delete('/:id', deleteStock);
router.get('/:id', getStock);
router.patch('/:id', updateStockStatus);
router.post('/purchase', purchaseStock);
router.post('/sell', sellStock);
router.get('/price-history', getPriceHistory);
router.get('/performance/:userId', getPerformanceData);
router.get('/portfolio/history/:userId', getPortfolioHistory);

module.exports = router;
