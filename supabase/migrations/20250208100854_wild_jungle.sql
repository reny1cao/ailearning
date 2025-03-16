/*
  # Add payment status to course purchases

  1. Changes
    - Add payment_status column to course_purchases table
    - Add payment_method column to course_purchases table
    - Add transaction_id column to course_purchases table

  2. Security
    - No changes to RLS policies needed
*/

DO $$ 
BEGIN
  -- Add payment_status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'course_purchases' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE course_purchases 
    ADD COLUMN payment_status text NOT NULL DEFAULT 'completed',
    ADD COLUMN payment_method text,
    ADD COLUMN transaction_id text;
  END IF;
END $$;