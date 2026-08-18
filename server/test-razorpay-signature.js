/**
 * Razorpay Test Signature Generator
 * Run: node test-razorpay-signature.js
 * 
 * Yeh script test ke liye razorpay_signature generate karta hai
 * Production mein signature Razorpay khud bhejta hai payment ke baad
 */

const crypto = require('crypto');

// ⚠️ Apne .env ke values yahan daalein (sirf testing ke liye)
const RAZORPAY_KEY_SECRET = 'your_test_key_secret_here'; // .env se copy karein

// Postman se create-order ke baad mile order_id aur payment_id daalein
const razorpay_order_id   = 'order_TEST_XXXXXXXXXXXX';   // create-order response se
const razorpay_payment_id = 'pay_TEST_XXXXXXXXXXXX';      // dashboard se ya fake test value

// Signature generate karo
const body = razorpay_order_id + '|' + razorpay_payment_id;
const signature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(body)
  .digest('hex');

console.log('\n✅ Razorpay Test Signature Generated!\n');
console.log('razorpay_order_id   :', razorpay_order_id);
console.log('razorpay_payment_id :', razorpay_payment_id);
console.log('razorpay_signature  :', signature);
console.log('\n--- Ab yeh JSON Postman mein /api/payments/verify mein bhejo ---');
console.log(JSON.stringify({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature: signature
}, null, 2));
