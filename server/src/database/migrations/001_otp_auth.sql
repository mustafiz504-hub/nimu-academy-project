-- Migration: 001_otp_auth.sql
-- Safely alters the users table to support OTP-only authentication
-- All ALTER statements use IF NOT EXISTS or handle duplicates gracefully

-- 1. Make password nullable (existing password-users preserved, they'll just use OTP now)
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- 2. Add country_code column if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='country_code') THEN
    ALTER TABLE users ADD COLUMN country_code VARCHAR(10) DEFAULT '+91';
  END IF;
END $$;

-- 3. Add phone_number (E.164 structured) column if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone_number') THEN
    ALTER TABLE users ADD COLUMN phone_number VARCHAR(20) UNIQUE;
  END IF;
END $$;

-- 4. Add email_verified column if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email_verified') THEN
    ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 5. Add phone_verified column if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone_verified') THEN
    ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 6. Add marketing_opt_in column if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='marketing_opt_in') THEN
    ALTER TABLE users ADD COLUMN marketing_opt_in BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 7. Add otp_resend_count column if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='otp_resend_count') THEN
    ALTER TABLE users ADD COLUMN otp_resend_count INT DEFAULT 0;
  END IF;
END $$;

-- 8. Expand otp_code column to hold bcrypt hash (255 chars)
ALTER TABLE users ALTER COLUMN otp_code TYPE VARCHAR(255);
