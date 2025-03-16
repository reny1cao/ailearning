/*
  # Add course purchases functionality

  1. New Tables
    - `course_purchases`: Track user course purchases
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `course_id` (uuid, references courses)
      - `purchase_date` (timestamptz)
      - `amount_paid` (decimal)

  2. Security
    - Enable RLS on course_purchases table
    - Add policies for users to view their purchases
*/

CREATE TABLE IF NOT EXISTS course_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  purchase_date timestamptz DEFAULT now(),
  amount_paid decimal NOT NULL,
  UNIQUE(user_id, course_id)
);

ALTER TABLE course_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchases"
  ON course_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases"
  ON course_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);