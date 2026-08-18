-- Add Razorpay tracking fields to enrollments table

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR(255),
ADD COLUMN IF NOT EXISTS amount NUMERIC(10, 2);
