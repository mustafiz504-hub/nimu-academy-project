const jwt = require('jsonwebtoken');

async function testRender() {
  try {
    const token = jwt.sign(
      { id: 9999, email: 'test9999@example.com', name: 'Test User 9999' },
      'nimu_secret_key_2026',
      { expiresIn: '1h' }
    );

    const response = await fetch('https://nimu-academy-backend.onrender.com/api/payments/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        course_id: 1,
        enrollmentData: {}
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testRender();
