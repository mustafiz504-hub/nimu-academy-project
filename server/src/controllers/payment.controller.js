const Razorpay = require('razorpay');
const crypto = require('crypto');
const pool = require('../config/db');

// Helper to safely get Razorpay credentials with fallback
const getRazorpayKeys = () => {
  const rawId = process.env.RAZORPAY_KEY_ID;
  const rawSecret = process.env.RAZORPAY_KEY_SECRET;

  const keyId = (rawId && rawId.trim()) ? rawId.trim().replace(/^["']|["']$/g, '') : 'rzp_test_TQnrOoJoIKGrCP';
  const keySecret = (rawSecret && rawSecret.trim()) ? rawSecret.trim().replace(/^["']|["']$/g, '') : 's3z7f04AYbfyM01Wm6I5J2nA';

  return { keyId, keySecret };
};

// POST /api/payments/create-order
exports.createOrder = async (req, res) => {
  try {
    const { course_id, enrollmentData } = req.body;
    const user_id = req.user.id;

    // 1. Fetch course details to get the price
    const courseResult = await pool.query('SELECT price, name FROM courses WHERE id = $1 AND active = true', [course_id]);
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found or inactive.' });
    }
    const course = courseResult.rows[0];
    const amount = Math.round(parseFloat(course.price) * 100); // Razorpay expects amount in paise

    if (amount <= 0) {
      return res.status(400).json({ message: 'Course is free. Payment not required.' });
    }

    // 2. Check if user is already enrolled
    const enrollResult = await pool.query(
      "SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2 AND status IN ('confirmed', 'completed')",
      [user_id, course_id]
    );
    if (enrollResult.rows.length > 0) {
      return res.status(400).json({ message: 'Already enrolled in this course.' });
    }

    // 3. Create order on Razorpay
    const { keyId, keySecret } = getRazorpayKeys();
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const options = {
      amount,
      currency: 'INR',
      receipt: `rcpt_c${course_id}_u${user_id}_${Date.now()}`.substring(0, 40),
    };
    const order = await razorpay.orders.create(options);

    // 4. Save pending enrollment with order id
    const { student_name, phone, city, batch_timing, mode, message } = enrollmentData || {};
    
    // Check if a pending enrollment exists and update, or create a new one
    const existingPending = await pool.query(
      "SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2 AND status = 'pending'",
      [user_id, course_id]
    );

    if (existingPending.rows.length > 0) {
      await pool.query(
        `UPDATE enrollments 
         SET razorpay_order_id = $1, amount = $2, customer_name = $3, phone = $4, message = $5 
         WHERE id = $6`,
        [order.id, course.price, student_name, phone, message, existingPending.rows[0].id]
      );
    } else {
      await pool.query(
        `INSERT INTO enrollments (user_id, course_id, customer_name, phone, message, status, razorpay_order_id, amount) 
         VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7)`,
        [user_id, course_id, student_name, phone, message, order.id, course.price]
      );
    }

    res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
      course_name: course.name,
      user_name: req.user.name,
      user_email: req.user.email,
      user_phone: phone || ''
    });

  } catch (error) {
    console.error('Razorpay create order error:', error);
    const errMsg = error?.error?.description || error?.message || 'Could not initiate payment.';
    res.status(500).json({ message: errMsg });
  }
};

// POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // 1. Verify signature
    //    Development/Expo Go mock bypass: mock payment ID se real signature check skip karo
    const isMockPayment = razorpay_payment_id?.startsWith('pay_mock_');
    const isDevelopment = process.env.NODE_ENV !== 'production';

    if (isMockPayment && isDevelopment) {
      console.log('[DEV] Mock payment detected — skipping signature verification');
    } else {
      const { keySecret } = getRazorpayKeys();
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature.' });
      }
    }

    // 2. Update database
    const updateResult = await pool.query(
      `UPDATE enrollments 
       SET status = 'confirmed', razorpay_payment_id = $1, razorpay_signature = $2 
       WHERE razorpay_order_id = $3 RETURNING *`,
      [razorpay_payment_id, razorpay_signature, razorpay_order_id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Enrollment record not found for this order.' });
    }

    const enrollment = updateResult.rows[0];

    // Log the activity
    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [
      enrollment.user_id,
      `Purchased course #${enrollment.course_id}`
    ]);

    res.status(200).json({
      success: true,
      message: 'Payment successful and enrollment confirmed.',
    });

  } catch (error) {
    console.error('Razorpay verify payment error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during verification.' });
  }
};

// GET /api/payments/checkout-page
exports.checkoutPage = (req, res) => {
  const { order_id, amount, course_name, course_id, user_name, user_email, user_phone, redirect_url } = req.query;
  const { keyId } = getRazorpayKeys();

  const baseRedirect = redirect_url || 'nimucooking://razorpay-callback';
  const sep = baseRedirect.includes('?') ? '&' : '?';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Nimu Academy Payment</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
           background: #FDF8F0; display: flex; align-items: center; justify-content: center;
           height: 100vh; margin: 0; flex-direction: column; text-align: center; padding: 20px; }
    .card { background: #FFFFFF; padding: 32px 24px; borderRadius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #F0E6D8; max-width: 320px; width: 100%; }
    .loader { color: #FF8C00; font-size: 16px; font-weight: 700; margin-top: 12px; }
    .success { color: #22C55E; font-size: 18px; font-weight: 800; }
    .subtext { color: #64748B; font-size: 13px; margin-top: 8px; }
    .btn { display: inline-block; margin-top: 16px; background: #FF8C00; color: #FFF; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card" id="statusCard">
    <div style="font-size: 40px;">💳</div>
    <p class="loader" id="statusText">Opening Razorpay checkout…</p>
    <p class="subtext">Please do not close this window</p>
  </div>

  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <script>
    function updateStatus(status, orderId, paymentId, signature, errorMsg) {
      var card = document.getElementById('statusCard');
      var base = '${baseRedirect.replace(/'/g, "\\'")}';
      var sep = '${sep}';

      if (status === 'success') {
        card.innerHTML = '<div style="font-size: 48px;">🎉</div>'
          + '<p class="success">Payment Successful!</p>'
          + '<p class="subtext">Returning to Nimu Academy App…</p>'
          + '<a id="returnBtn" href="#" class="btn">Click here if app does not open</a>';
        
        var redirectUrl = base + sep + 'status=success'
          + '&course_id='  + encodeURIComponent('${course_id || ''}')
          + '&order_id='   + encodeURIComponent(orderId || '')
          + '&payment_id=' + encodeURIComponent(paymentId || '')
          + '&signature='  + encodeURIComponent(signature || '');
        
        document.getElementById('returnBtn').href = redirectUrl;
        window.location.href = redirectUrl;
      } else if (status === 'cancelled') {
        card.innerHTML = '<div style="font-size: 48px;">⚠️</div>'
          + '<p style="color: #64748B; font-weight: 700; font-size: 16px;">Payment Cancelled</p>'
          + '<a id="returnBtn" href="#" class="btn">Return to App</a>';
        var redirectUrl = base + sep + 'status=cancelled';
        document.getElementById('returnBtn').href = redirectUrl;
        window.location.href = redirectUrl;
      } else {
        card.innerHTML = '<div style="font-size: 48px;">❌</div>'
          + '<p style="color: #EF4444; font-weight: 700; font-size: 16px;">Payment Failed</p>'
          + '<p class="subtext">' + (errorMsg || 'Something went wrong') + '</p>'
          + '<a id="returnBtn" href="#" class="btn">Return to App</a>';
        var redirectUrl = base + sep + 'status=failed&error=' + encodeURIComponent(errorMsg || '');
        document.getElementById('returnBtn').href = redirectUrl;
        window.location.href = redirectUrl;
      }
    }

    var options = {
      key: '${keyId}',
      amount: '${amount || 0}',
      currency: 'INR',
      name: 'Nimu Academy',
      description: 'Enrollment for ${String(course_name || 'Course').replace(/'/g, "\\'").replace(/"/g, '&quot;')}',
      image: window.location.origin + '/public/logo-round.png',
      order_id: '${order_id || ''}',
      prefill: {
        name: '${String(user_name || '').replace(/'/g, "\\'").replace(/"/g, '&quot;')}',
        email: '${user_email || ''}',
        contact: '${user_phone || ''}'
      },
      theme: { color: '#D35400' }, // Dark orange to ensure Razorpay uses WHITE text instead of black
      handler: function(response) {
        updateStatus('success', response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature);
      },
      modal: {
        ondismiss: function() {
          updateStatus('cancelled');
        }
      }
    };
    var rzp = new Razorpay(options);
    rzp.on('payment.failed', function(resp) {
      updateStatus('failed', null, null, null, resp.error ? resp.error.description : 'Payment failed');
    });
    setTimeout(function() { rzp.open(); }, 400);
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
};
