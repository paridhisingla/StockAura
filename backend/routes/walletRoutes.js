const express = require('express');
const { deposit, getWallet } = require('../controllers/walletController');
const router = express.Router();

router.post('/deposit', deposit);
router.get('/:userId', getWallet);

module.exports = router;
