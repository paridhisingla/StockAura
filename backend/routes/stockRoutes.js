const express = require('express');
const { getStocks, createStock, updateStock, deleteStock, getStockById, updateStockStatus } = require('../controllers/stockController');
const router = express.Router();

router.get('/', getStocks);
router.post('/', createStock);
router.put('/:id', updateStock);
router.delete('/:id', deleteStock);
router.get('/:id', getStockById);
router.patch('/:id', updateStockStatus);

module.exports = router;
