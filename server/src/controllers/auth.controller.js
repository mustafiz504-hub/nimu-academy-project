// @ts-check
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { parsePhoneNumber, isValidPhoneNumber } = require('libphonenumber-js');
const pool = require('../config/db');
const { sendOtpEmail, sendLoginOtpEmail } = require('../utils/mailer');
const { sendOtpSms } = require('../services/sms.service');
const { generateOtp, hashOtp, verifyOtp, maskEmail, maskPhone } = require('../utils/otpUtils');

/** @typedef {import('express').Request & { user?: any }} Request */
/** @typedef {import('express').Response} Response */

/** OTP validity: 10 minutes */
const OTP_TTL_MS = 10 * 60 * 1000;
/** Max wrong verify attempts before requiring a resend */
const MAX_VERIFY_ATTEMPTS = 5;
/** Cooldown between resend requests */
const RESEND_COOLDOWN_MS = 60 * 1000;
/** Max resends per OTP session */
const MAX_RESEND_COUNT = 3;

/**
 * Determines whether a string looks like an email or a phone number.
 * @param {string} identifier
 * @returns {'email' | 'phone'}
 */
const detectIdentifierType = (identifier) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(identifier.trim()) ? 'email' : 'phone';
};

/**
 * Issues a JWT access token for a user.
 * @param {{ id: number, email: string, role: string }} user
 * @returns {string}
 */
const issueToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '7d' }
  );

// ─── Signup Initiate ──────────────────────────────────────────────────────────
/**
 * POST /auth/signup/initiate
 * Validates input, checks uniqueness, sends OTP to email + SMS simultaneously.
 * @param {Request} req
 * @param {Response} res
 */
const signupInitiate = async (req, res) => {
  try {
    const { name, email, password, terms_agreed, marketing_opt_in } = req.body;

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (!terms_agreed) {
      return res.status(400).json({ message: 'You must agree to the Terms & Privacy Policy.' });
    }

    let trimmedEmail = email.toLowerCase().trim();
    if (trimmedEmail.endsWith('@gamil.com')) {
      trimmedEmail = trimmedEmail.replace('@gamil.com', '@gmail.com');
    }

    // Check email uniqueness
    const emailCheck = await pool.query('SELECT id, is_verified FROM users WHERE email = $1', [trimmedEmail]);
    if (emailCheck.rows.length > 0 && emailCheck.rows[0].is_verified) {
      return res.status(409).json({ message: 'This email is already registered. Please sign in instead.' });
    }

    // Determine role
    let role = 'user';
    if (process.env.SUPERADMIN_EMAIL?.split(',').includes(trimmedEmail)) {
      role = 'superadmin';
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    // Generate + hash OTP
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);

    // Upsert user (unverified — if exists, update; if not, insert)
    const existingUser = emailCheck.rows[0];
    if (existingUser) {
      await pool.query(
        `UPDATE users
         SET name=$1, password=$2, role=$3, marketing_opt_in=$4,
             otp_code=$5, otp_expires_at=$6, otp_attempts=0, otp_resend_count=0, last_otp_sent_at=NOW()
         WHERE email=$7`,
        [name.trim(), hashedPassword, role, Boolean(marketing_opt_in), otpHash, otpExpiresAt, trimmedEmail]
      );
    } else {
      await pool.query(
        `INSERT INTO users
           (name, email, password, role, is_verified, email_verified, phone_verified,
            marketing_opt_in, otp_code, otp_expires_at, otp_attempts, otp_resend_count, last_otp_sent_at)
         VALUES ($1,$2,$3,$4,FALSE,FALSE,FALSE,$5,$6,$7,0,0,NOW())`,
        [name.trim(), trimmedEmail, hashedPassword, role, Boolean(marketing_opt_in), otpHash, otpExpiresAt]
      );
    }

    // Send OTP to email only
    await sendOtpEmail(trimmedEmail, otp, name.trim());

    return res.status(200).json({
      message: 'Verification code sent to your email.',
      email: trimmedEmail,
      maskedEmail: maskEmail(trimmedEmail),
    });
  } catch (error) {
    console.error('Signup initiate error:', error);
    return res.status(500).json({ message: 'Server error during signup. Please try again.' });
  }
};

// ─── Signup Verify ────────────────────────────────────────────────────────────
/**
 * POST /auth/signup/verify
 * Verifies OTP, creates account, issues JWT.
 * @param {Request} req
 * @param {Response} res
 */
const signupVerify = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP code are required.' });
    }

    let trimmedEmail = email.toLowerCase().trim();
    if (trimmedEmail.endsWith('@gamil.com')) {
      trimmedEmail = trimmedEmail.replace('@gamil.com', '@gmail.com');
    }
    const cleanOtp = String(otp).trim();

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [trimmedEmail]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No pending signup found for this email.' });
    }

    const user = result.rows[0];

    if (user.is_verified) {
      // Already verified — just log them in
      const token = issueToken(user);
      return res.status(200).json({
        message: 'Account already verified. Signed in successfully.',
        token,
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, phone_number: user.phone_number, role: user.role },
      });
    }

    // Check attempts
    if (user.otp_attempts >= MAX_VERIFY_ATTEMPTS) {
      return res.status(429).json({
        message: 'Too many failed attempts. Please request a new OTP.',
        locked: true,
      });
    }

    // Check expiry
    if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Verify hash
    const isValid = user.otp_code ? await verifyOtp(cleanOtp, user.otp_code) : false;

    if (!isValid) {
      await pool.query('UPDATE users SET otp_attempts = otp_attempts + 1 WHERE id = $1', [user.id]);
      const remaining = MAX_VERIFY_ATTEMPTS - (user.otp_attempts + 1);
      return res.status(400).json({
        message: remaining > 0
          ? `Incorrect OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : 'Incorrect OTP. Please request a new code.',
      });
    }

    // Mark verified, clear OTP
    let role = user.role;
    if (process.env.SUPERADMIN_EMAIL?.split(',').includes(trimmedEmail) && role !== 'superadmin') {
      role = 'superadmin';
    }

    await pool.query(
      `UPDATE users
       SET is_verified=TRUE, email_verified=TRUE, phone_verified=TRUE,
           otp_code=NULL, otp_expires_at=NULL, otp_attempts=0, otp_resend_count=0, role=$1
       WHERE id=$2`,
      [role, user.id]
    );

    // Log activity
    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [user.id, 'User signed up via OTP']);

    const token = issueToken({ id: user.id, email: user.email, role });

    return res.status(201).json({
      message: 'Account created successfully! Welcome to Nimu Academy.',
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, phone_number: user.phone_number, role },
    });
  } catch (error) {
    console.error('Signup verify error:', error);
    return res.status(500).json({ message: 'Server error during verification.' });
  }
};

// ─── Login Initiate ───────────────────────────────────────────────────────────
/**
 * POST /auth/login/initiate
 * Detects email vs phone, finds user, sends OTP to matching channel.
 * @param {Request} req
 * @param {Response} res
 */
const loginInitiate = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    let trimmedEmail = email.toLowerCase().trim();
    if (trimmedEmail.endsWith('@gamil.com')) {
      trimmedEmail = trimmedEmail.replace('@gamil.com', '@gmail.com');
    }

    const type = detectIdentifierType(trimmedEmail);

    let result;
    if (type === 'email') {
      result = await pool.query('SELECT * FROM users WHERE email = $1', [trimmedEmail]);
    } else {
      result = await pool.query('SELECT * FROM users WHERE phone = $1', [trimmedEmail]);
    }
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email/phone number.' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: 'Account not verified yet. Please complete your signup first.' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'This account was created without a password. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    // Auto-promote superadmin if needed
    if (process.env.SUPERADMIN_EMAIL?.split(',').includes(user.email) && user.role !== 'superadmin') {
      await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['superadmin', user.id]);
      user.role = 'superadmin';
    }

    // Generate + hash OTP
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);

    await pool.query(
      `UPDATE users
       SET otp_code=$1, otp_expires_at=$2, otp_attempts=0, otp_resend_count=0, last_otp_sent_at=NOW()
       WHERE id=$3`,
      [otpHash, otpExpiresAt, user.id]
    );

    // Send OTP to email only
    await sendLoginOtpEmail(user.email, otp, user.name);

    return res.status(200).json({
      message: 'Login code sent to your email.',
      channel: 'email',
      maskedTarget: maskEmail(user.email),
      identifier: user.email,
    });
  } catch (error) {
    console.error('Login initiate error:', error);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─── Login Verify ─────────────────────────────────────────────────────────────
/**
 * POST /auth/login/verify
 * Verifies OTP for login, issues JWT.
 * @param {Request} req
 * @param {Response} res
 */
const loginVerify = async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({ message: 'Email and OTP code are required.' });
    }

    let cleanIdentifier = identifier.toLowerCase().trim();
    if (cleanIdentifier.endsWith('@gamil.com')) {
      cleanIdentifier = cleanIdentifier.replace('@gamil.com', '@gmail.com');
    }
    const cleanOtp = String(otp).trim();

    const type = detectIdentifierType(cleanIdentifier);

    let result;
    if (type === 'email') {
      result = await pool.query('SELECT * FROM users WHERE email = $1', [cleanIdentifier]);
    } else {
      result = await pool.query('SELECT * FROM users WHERE phone = $1', [cleanIdentifier]);
    }
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    // Check attempts
    if (user.otp_attempts >= MAX_VERIFY_ATTEMPTS) {
      return res.status(429).json({
        message: 'Too many failed attempts. Please request a new OTP.',
        locked: true,
      });
    }

    // Check expiry
    if (!user.otp_expires_at || new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    const isValid = user.otp_code ? await verifyOtp(cleanOtp, user.otp_code) : false;

    if (!isValid) {
      await pool.query('UPDATE users SET otp_attempts = otp_attempts + 1 WHERE id = $1', [user.id]);
      const remaining = MAX_VERIFY_ATTEMPTS - (user.otp_attempts + 1);
      return res.status(400).json({
        message: remaining > 0
          ? `Incorrect OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : 'Incorrect OTP. Please request a new code.',
      });
    }

    // Clear OTP
    await pool.query(
      'UPDATE users SET otp_code=NULL, otp_expires_at=NULL, otp_attempts=0, otp_resend_count=0 WHERE id=$1',
      [user.id]
    );

    // Log activity
    await pool.query('INSERT INTO activity_logs (user_id, action) VALUES ($1, $2)', [user.id, 'User logged in via OTP']);

    const token = issueToken(user);

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, phone_number: user.phone_number, role: user.role },
    });
  } catch (error) {
    console.error('Login verify error:', error);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─── OTP Resend ───────────────────────────────────────────────────────────────
/**
 * POST /auth/otp/resend
 * Rate-limited OTP resend (60s cooldown, max 3 per session).
 * @param {Request} req
 * @param {Response} res
 */
const resendOtp = async (req, res) => {
  try {
    const { identifier, purpose } = req.body;
    // purpose: 'signup' | 'login'
    if (!identifier) {
      return res.status(400).json({ message: 'Identifier is required.' });
    }

    let cleanIdentifier = identifier.toLowerCase().trim();
    if (cleanIdentifier.endsWith('@gamil.com')) {
      cleanIdentifier = cleanIdentifier.replace('@gamil.com', '@gmail.com');
    }

    const type = detectIdentifierType(cleanIdentifier);

    let result;
    if (type === 'email') {
      result = await pool.query('SELECT * FROM users WHERE email = $1', [cleanIdentifier]);
    } else {
      result = await pool.query('SELECT * FROM users WHERE phone = $1', [cleanIdentifier]);
    }
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    // Rate limit: cooldown check
    if (user.last_otp_sent_at) {
      const elapsed = Date.now() - new Date(user.last_otp_sent_at).getTime();
      if (elapsed < RESEND_COOLDOWN_MS) {
        const waitSecs = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
        return res.status(429).json({
          message: `Please wait ${waitSecs} seconds before requesting another OTP.`,
          cooldownRemaining: waitSecs,
        });
      }
    }

    // Rate limit: max resends per session
    if ((user.otp_resend_count || 0) >= MAX_RESEND_COUNT) {
      return res.status(429).json({
        message: 'Maximum resend limit reached. Please start the process again.',
        maxReached: true,
      });
    }

    // Generate + hash new OTP
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);

    await pool.query(
      `UPDATE users
       SET otp_code=$1, otp_expires_at=$2, otp_attempts=0,
           otp_resend_count=COALESCE(otp_resend_count,0)+1, last_otp_sent_at=NOW()
       WHERE id=$3`,
      [otpHash, otpExpiresAt, user.id]
    );

    // Send to email only
    const isSignup = purpose === 'signup' || !user.is_verified;

    if (isSignup) {
      await sendOtpEmail(user.email, otp, user.name);
    } else {
      await sendLoginOtpEmail(user.email, otp, user.name);
    }

    return res.status(200).json({
      message: 'A new verification code has been sent.',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─── Legacy endpoints (deprecated — kept as stubs) ────────────────────────────
/**
 * DEPRECATED: POST /auth/register & POST /auth/signup
 * @param {Request} req
 * @param {Response} res
 */
const register = async (req, res) => {
  return res.status(410).json({
    message: 'This endpoint has been removed. Please use POST /auth/signup/initiate for passwordless signup.',
    newEndpoints: {
      signup: 'POST /auth/signup/initiate → POST /auth/signup/verify',
      login: 'POST /auth/login/initiate → POST /auth/login/verify',
    },
  });
};

/**
 * DEPRECATED: POST /auth/login
 * @param {Request} req
 * @param {Response} res
 */
const login = async (req, res) => {
  return res.status(410).json({
    message: 'Password login has been removed. Please use POST /auth/login/initiate for OTP-based login.',
    newEndpoints: {
      login: 'POST /auth/login/initiate → POST /auth/login/verify',
    },
  });
};

// ─── Logout (stateless) ───────────────────────────────────────────────────────
/** @param {Request} req @param {Response} res */
const logout = async (req, res) => {
  res.status(200).json({ message: 'Logged out successfully.' });
};

// ─── Get current user ─────────────────────────────────────────────────────────
/** @param {Request} req @param {Response} res */
const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, phone_number, country_code, role,
              is_verified, email_verified, phone_verified, marketing_opt_in, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

// Also keep verifyOtp/resendOtp as legacy aliases for existing mobile clients
const verifyOtpLegacy = async (req, res) => {
  return res.status(410).json({
    message: 'Please use POST /auth/signup/verify or POST /auth/login/verify instead.',
  });
};

module.exports = {
  signupInitiate,
  signupVerify,
  loginInitiate,
  loginVerify,
  resendOtp,
  logout,
  getMe,
  // Legacy stubs
  register,
  signup: register,
  login,
  verifyOtp: verifyOtpLegacy,
};
