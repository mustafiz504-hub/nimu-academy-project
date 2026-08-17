const express = require('express');
const router = express.Router();
const {
  signupInitiate,
  signupVerify,
  loginInitiate,
  loginVerify,
  resendOtp,
  logout,
  getMe,
  // Legacy stubs
  register,
  signup,
  login,
  verifyOtp,
} = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');
const { signupInitiateRules, loginInitiateRules, validate } = require('../middleware/validators');

// ─── OTP-Only Auth Routes ─────────────────────────────────────────────────────

// Signup Flow (2 steps)
router.post('/signup/initiate', signupInitiateRules(), validate, signupInitiate);
router.post('/signup/verify',   signupVerify);

// Login Flow (2 steps)
router.post('/login/initiate', loginInitiateRules(), validate, loginInitiate);
router.post('/login/verify',   loginVerify);

// OTP Resend (shared for signup + login)
router.post('/otp/resend', resendOtp);

// Session
router.post('/logout', logout);
router.get('/me',      verifyToken, getMe);

// ─── Legacy / Deprecated Routes (410 Gone) ───────────────────────────────────
// These are kept so old mobile clients get a clear error instead of a cryptic 404
router.post('/register',    register);
router.post('/signup',      signup);
router.post('/login',       login);
router.post('/verify-otp',  verifyOtp);
router.post('/resend-otp',  (req, res) => res.status(410).json({
  message: 'Please use POST /auth/otp/resend instead.',
}));

module.exports = router;
