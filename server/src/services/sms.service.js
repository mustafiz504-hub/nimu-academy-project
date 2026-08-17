// @ts-check
/**
 * SMS Service — MSG91 Integration
 *
 * Setup: Add the following to server/.env:
 *   MSG91_API_KEY=your_msg91_api_key
 *   MSG91_SENDER_ID=NIMUAC        (6-char sender ID from MSG91)
 *   MSG91_TEMPLATE_ID=your_template_id  (pre-approved DLT template ID)
 *
 * MSG91 Free Trial: https://msg91.com (sign up → get API key)
 *
 * If MSG91_API_KEY is not set, OTP will be logged to console (dev mode).
 */

const https = require('https');

/**
 * Send an OTP SMS via MSG91.
 * @param {string} phoneNumber - Full phone number in E.164 format (e.g., +919876543210)
 * @param {string} otpCode - 6-digit OTP string
 * @param {string} [userName] - User's name (for personalisation, if template supports it)
 * @returns {Promise<{ success: boolean; simulated?: boolean; error?: any }>}
 */
async function sendOtpSms(phoneNumber, otpCode, userName = 'User') {
  // Strip '+' from phone number for MSG91 (they want international format without +)
  const cleanPhone = phoneNumber.replace(/^\+/, '');

  // Dev/fallback mode — no API key configured
  if (!process.env.MSG91_API_KEY) {
    console.log(`\n======================================================`);
    console.log(`📱 [DEV SMS SIMULATOR] OTP for ${phoneNumber}: ${otpCode}`);
    console.log(`======================================================\n`);
    return { success: true, simulated: true };
  }

  const payload = JSON.stringify({
    template_id: process.env.MSG91_TEMPLATE_ID || '',
    mobile: cleanPhone,
    authkey: process.env.MSG91_API_KEY,
    otp: otpCode,
    // MSG91 OTP API variables (for template)
    VAR1: otpCode,
    VAR2: '10',  // expiry in minutes
  });

  return new Promise((resolve) => {
    const options = {
      hostname: 'control.msg91.com',
      path: '/api/v5/otp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': process.env.MSG91_API_KEY || '',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'success') {
            console.log(`✅ OTP SMS sent to ${phoneNumber} via MSG91`);
            resolve({ success: true });
          } else {
            console.error(`❌ MSG91 error:`, parsed);
            // Fallback: log OTP so development is never blocked
            console.log(`\n📱 [FALLBACK OTP] OTP for ${phoneNumber}: ${otpCode}\n`);
            resolve({ success: false, error: parsed });
          }
        } catch (e) {
          console.error('❌ MSG91 parse error:', e);
          console.log(`\n📱 [FALLBACK OTP] OTP for ${phoneNumber}: ${otpCode}\n`);
          resolve({ success: false, error: e });
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ MSG91 request error:', e);
      console.log(`\n📱 [FALLBACK OTP] OTP for ${phoneNumber}: ${otpCode}\n`);
      resolve({ success: false, error: e });
    });

    req.write(payload);
    req.end();
  });
}

module.exports = { sendOtpSms };
