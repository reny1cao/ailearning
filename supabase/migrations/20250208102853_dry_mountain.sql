/*
  # Add Course Duration and Visibility Settings

  1. New Columns
    - duration_weeks: Track course duration in weeks
    - visibility: Control course visibility status
    - instructor_required: Flag for courses requiring instructor

  2. Changes
    - Adds duration tracking
    - Implements visibility control
    - Adds instructor requirement flag
    - Sets default visibility for paid courses
*/

-- Add new columns to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration_weeks integer DEFAULT 4;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'draft' CHECK (visibility IN ('draft', 'public', 'private'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_required boolean DEFAULT true;

-- Set visibility to public for all paid courses
UPDATE courses 
SET visibility = 'public'
WHERE price > 0;

-- Set visibility to public for premium courses
UPDATE courses 
SET visibility = 'public'
WHERE is_premium = true;

-- Set instructor_required false for basic courses
UPDATE courses 
SET instructor_required = false
WHERE difficulty = 'beginner' AND price = 0;

-- Create policy for visibility
DROP POLICY IF EXISTS "Users can view visible courses" ON courses;
CREATE POLICY "Users can view visible courses"
ON courses
FOR SELECT
USING (
  visibility = 'public' OR 
  (auth.uid() IN (
    SELECT user_id FROM course_purchases 
    WHERE course_id = courses.id
  ))
);