/*
  # Admin Platform Setup

  1. New Tables
    - `roles` - User roles for RBAC
    - `user_roles` - User-role assignments
    - `course_materials` - Course materials and resources
    - `quizzes` - Course quizzes
    - `quiz_questions` - Quiz questions
    - `quiz_attempts` - User quiz attempts
    - `course_analytics` - Course analytics data

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
    - Add policies for instructor access
    - Add policies for student access

  3. Changes
    - Add new columns to courses table
    - Add new columns to modules table
*/

-- Create roles enum
CREATE TYPE user_role AS ENUM ('admin', 'instructor', 'student');

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name user_role NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(name)
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Create course_materials table
CREATE TABLE IF NOT EXISTS course_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('video', 'text', 'pdf', 'quiz')),
  content text,
  url text,
  order_number integer NOT NULL,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  passing_score integer NOT NULL DEFAULT 70,
  time_limit integer, -- in minutes, null for no limit
  attempts_allowed integer DEFAULT 3,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  question text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  options jsonb, -- for multiple choice questions
  correct_answer text NOT NULL,
  points integer DEFAULT 1,
  order_number integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  score integer NOT NULL,
  answers jsonb NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(quiz_id, user_id, started_at)
);

-- Create course_analytics table
CREATE TABLE IF NOT EXISTS course_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  total_enrollments integer DEFAULT 0,
  active_students integer DEFAULT 0,
  completion_rate decimal DEFAULT 0,
  average_rating decimal DEFAULT 0,
  total_revenue decimal DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to courses
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
ADD COLUMN IF NOT EXISTS enrollment_limit integer,
ADD COLUMN IF NOT EXISTS start_date timestamptz,
ADD COLUMN IF NOT EXISTS end_date timestamptz,
ADD COLUMN IF NOT EXISTS prerequisites jsonb,
ADD COLUMN IF NOT EXISTS learning_objectives jsonb,
ADD COLUMN IF NOT EXISTS thumbnail_url text,
ADD COLUMN IF NOT EXISTS instructor_id uuid REFERENCES auth.users(id);

-- Add new columns to modules
ALTER TABLE modules 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
ADD COLUMN IF NOT EXISTS prerequisites jsonb,
ADD COLUMN IF NOT EXISTS estimated_time integer; -- in minutes

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for roles
CREATE POLICY "Admins can manage roles"
ON roles
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'admin'
  )
);

-- Create policies for user_roles
CREATE POLICY "Admins can manage user roles"
ON user_roles
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'admin'
  )
);

-- Create policies for course materials
CREATE POLICY "Admins and instructors can manage course materials"
ON course_materials
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('admin', 'instructor')
  )
);

CREATE POLICY "Students can view published materials of enrolled courses"
ON course_materials
FOR SELECT
TO authenticated
USING (
  is_published = true
  AND EXISTS (
    SELECT 1 FROM course_purchases cp
    JOIN modules m ON m.course_id = cp.course_id
    WHERE cp.user_id = auth.uid()
    AND m.id = course_materials.module_id
    AND cp.payment_status = 'completed'
  )
);

-- Create policies for quizzes and questions
CREATE POLICY "Admins and instructors can manage quizzes"
ON quizzes
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('admin', 'instructor')
  )
);

CREATE POLICY "Students can view published quizzes of enrolled courses"
ON quizzes
FOR SELECT
TO authenticated
USING (
  is_published = true
  AND EXISTS (
    SELECT 1 FROM course_purchases cp
    JOIN modules m ON m.course_id = cp.course_id
    WHERE cp.user_id = auth.uid()
    AND m.id = quizzes.module_id
    AND cp.payment_status = 'completed'
  )
);

-- Create policies for quiz attempts
CREATE POLICY "Students can manage their own quiz attempts"
ON quiz_attempts
TO authenticated
USING (user_id = auth.uid());

-- Create policies for course analytics
CREATE POLICY "Admins and instructors can view analytics"
ON course_analytics
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('admin', 'instructor')
  )
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('admin', 'Full system access and management capabilities'),
('instructor', 'Course creation and management capabilities'),
('student', 'Course enrollment and learning capabilities')
ON CONFLICT (name) DO NOTHING;