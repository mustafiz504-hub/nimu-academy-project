const nodemailer = require('nodemailer');

// Configure Nodemailer transporter using environment variables or fallback test transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER || '',
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || '',
  },
});

/**
 * Shared HTML email body builder for OTP emails.
 * @param {string} otpCode
 * @param {string} userName
 * @param {string} headingText - e.g. "Verify Your Email" or "Your Login Code"
 * @param {string} bodyText - Context sentence shown above the OTP box
 * @returns {string}
 */
const buildOtpHtml = (otpCode, userName, headingText, bodyText) => `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #FFE0B2; border-radius: 12px; background-color: #FFF9F0;">
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #FF8C00; margin: 0;">Nimu Cooking Academy 🍳</h2>
      <p style="color: #64748B; font-size: 14px; margin-top: 4px;">Your Culinary Journey Starts Here</p>
    </div>
    <div style="background-color: #FFFFFF; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(255, 140, 0, 0.1);">
      <h3 style="color: #1E1B18; margin-top: 0;">${headingText}</h3>
      <p style="color: #475569; font-size: 14px; line-height: 1.5;">
        Hi <strong>${userName}</strong>, ${bodyText}
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #FF8C00; background-color: #FFF3E0; padding: 12px 24px; border-radius: 8px; border: 1px dashed #FF8C00; display: inline-block;">
          ${otpCode}
        </span>
      </div>
      <p style="color: #64748B; font-size: 13px; margin-bottom: 0;">
        ⏳ This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
      </p>
    </div>
    <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #94A3B8;">
      If you did not request this code, please ignore this email.
    </div>
  </div>
`;

/**
 * Internal mailer function that sends or simulates email.
 * @param {string} to
 * @param {string} subject
 * @param {string} html
 * @param {string} context - for console log fallback label
 */
const sendMail = async (to, subject, html, context) => {
  try {
    if (!process.env.SMTP_USER && !process.env.EMAIL_USER) {
      console.log(`\n======================================================`);
      console.log(`📧 [DEV EMAIL SIMULATOR] ${context} for ${to}`);
      console.log(`======================================================\n`);
      return { success: true, simulated: true };
    }

    const info = await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Nimu Cooking Academy'}" <${process.env.SMTP_USER || 'noreply@nimu.com'}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
    console.log(`\n======================================================`);
    console.log(`📧 [DEV FALLBACK EMAIL] ${context} for ${to}`);
    console.log(`======================================================\n`);
    return { success: false, error, simulated: true };
  }
};

/**
 * Sends a signup OTP email (sent during registration).
 * @param {string} email - Recipient email
 * @param {string} otpCode - 6-digit OTP code
 * @param {string} [userName] - Recipient name
 */
async function sendOtpEmail(email, otpCode, userName = 'Learner') {
  const html = buildOtpHtml(
    otpCode,
    userName,
    'Verify Your Email Address',
    'welcome to Nimu Cooking Academy! Please enter the 6-digit verification code below to complete your registration:'
  );
  return sendMail(
    email,
    `${otpCode} is your verification code for Nimu Cooking Academy`,
    html,
    `Signup OTP: ${otpCode}`
  );
}

/**
 * Sends a login OTP email (sent during login).
 * @param {string} email - Recipient email
 * @param {string} otpCode - 6-digit OTP code
 * @param {string} [userName] - Recipient name
 */
async function sendLoginOtpEmail(email, otpCode, userName = 'Learner') {
  const html = buildOtpHtml(
    otpCode,
    userName,
    'Your Login Code',
    'here is your one-time login code for Nimu Cooking Academy:'
  );
  return sendMail(
    email,
    `${otpCode} is your login code for Nimu Cooking Academy`,
    html,
    `Login OTP: ${otpCode}`
  );
}

module.exports = { sendOtpEmail, sendLoginOtpEmail };
