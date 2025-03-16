/*
  # Course Detail Enhancements

  1. New Columns
    - Add instructor details
    - Add course metadata
    - Add learning path information

  2. Changes
    - Enhance course structure
    - Add tracking capabilities
*/

-- Add new columns to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS instructor_name text,
ADD COLUMN IF NOT EXISTS instructor_bio text,
ADD COLUMN IF NOT EXISTS instructor_avatar text,
ADD COLUMN IF NOT EXISTS skills_gained jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS course_outline jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS what_you_will_learn jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS requirements jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS target_audience jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS course_level text CHECK (course_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
ADD COLUMN IF NOT EXISTS estimated_hours integer,
ADD COLUMN IF NOT EXISTS last_updated timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS language text DEFAULT 'English',
ADD COLUMN IF NOT EXISTS certificate_included boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_lifetime_access boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS has_assignments boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_projects boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_quizzes boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_certificate boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS has_mentorship boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS rating decimal DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_students integer DEFAULT 0;

-- Update existing AI course with enhanced details
UPDATE courses
SET 
  instructor_name = 'Dr. Sarah Chen',
  instructor_bio = 'Former Lead AI Engineer at OpenAI with 10+ years of experience in production AI systems. PhD in Machine Learning from Stanford.',
  instructor_avatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
  skills_gained = jsonb_build_array(
    'Advanced Prompt Engineering',
    'RAG System Design',
    'LLM Fine-tuning',
    'Production Deployment',
    'System Optimization',
    'AI Ethics & Safety'
  ),
  course_outline = jsonb_build_array(
    'Foundation: LLM Architecture & Theory',
    'Advanced RAG Systems',
    'AI Agents & Automation',
    'Production Implementation',
    'Ethics & Best Practices'
  ),
  what_you_will_learn = jsonb_build_array(
    'Master core LLM concepts and architectures',
    'Build production-ready RAG systems',
    'Implement AI agents and automation',
    'Deploy and scale AI applications',
    'Optimize for performance and cost',
    'Ensure ethical AI development'
  ),
  requirements = jsonb_build_array(
    'Strong Python programming skills',
    'Basic understanding of machine learning',
    'Familiarity with cloud platforms',
    'Experience with API development'
  ),
  target_audience = jsonb_build_array(
    'Software Engineers transitioning to AI',
    'ML Engineers seeking LLM expertise',
    'AI Researchers and Practitioners',
    'Technical Team Leaders'
  ),
  course_level = 'advanced',
  estimated_hours = 120,
  language = 'English',
  certificate_included = true,
  has_lifetime_access = true,
  has_assignments = true,
  has_projects = true,
  has_quizzes = true,
  has_certificate = true,
  has_mentorship = true,
  rating = 4.8,
  total_reviews = 128,
  total_students = 1024
WHERE title = 'AI Accelerator Pro 2025';