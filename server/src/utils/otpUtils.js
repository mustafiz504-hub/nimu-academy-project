// @ts-check
const bcrypt = require('bcryptjs');

/**
 * Generates a random 6-digit numeric OTP.
 * @returns {string}
 */
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hashes an OTP using bcrypt (cost factor 10).
 * We use bcrypt (not SHA-256) so it's consistent with existing bcrypt usage in the project.
 * @param {string} otp - The plain-text OTP to hash
 * @returns {Promise<string>} bcrypt hash
 */
const hashOtp = async (otp) => {
  return bcrypt.hash(otp, 10);
};

/**
 * Compares a plain OTP against a stored bcrypt hash.
 * @param {string} plainOtp - The OTP entered by the user
 * @param {string} hash - The stored hash from the database
 * @returns {Promise<boolean>}
 */
const verifyOtp = async (plainOtp, hash) => {
  return bcrypt.compare(plainOtp, hash);
};

/**
 * Masks an email address for display.
 * e.g. "john@gmail.com" → "j***@gmail.com"
 * @param {string} email
 * @returns {string}
 */
const maskEmail = (email) => {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const visible = local.slice(0, 1);
  return `${visible}***@${domain}`;
};

/**
 * Masks a phone number for display.
 * e.g. "+919876543210" → "+91 98***210"
 * @param {string} phone - Full phone number (E.164 format or with spaces)
 * @returns {string}
 */
const maskPhone = (phone) => {
  if (!phone) return phone;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 6) return phone;
  const visible = digits.slice(-3);
  return `${phone.slice(0, phone.indexOf(digits[0]) + 2)}***${visible}`;
};

module.exports = { generateOtp, hashOtp, verifyOtp, maskEmail, maskPhone };
