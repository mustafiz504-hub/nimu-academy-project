const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, checkoutPage } = require('../controllers/payment.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/checkout-page', checkoutPage);
router.post('/create-order', verifyToken, createOrder);
router.post('/verify', verifyToken, verifyPayment);

module.exports = router;
