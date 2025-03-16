-- Insert sample courses
INSERT INTO courses (
  title,
  description,
  category,
  difficulty,
  price,
  is_premium,
  duration_weeks,
  visibility,
  status,
  instructor_name,
  instructor_bio,
  instructor_avatar,
  what_you_will_learn,
  requirements,
  target_audience,
  course_level,
  estimated_hours,
  has_lifetime_access,
  has_assignments,
  has_projects,
  has_certificate,
  has_mentorship,
  rating,
  total_reviews,
  total_students
) VALUES
(
  'Practical LLM Engineering',
  'Master the art of building production-ready LLM applications. Learn prompt engineering, RAG systems, and deployment strategies.',
  'LLM Engineering',
  'intermediate',
  199.99,
  true,
  8,
  'public',
  'published',
  'Dr. Michael Chen',
  'Senior AI Engineer at Google with 8+ years of experience in LLM systems. PhD in Computer Science from MIT.',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80',
  jsonb_build_array(
    'Design and implement production LLM systems',
    'Master advanced prompt engineering techniques',
    'Build efficient RAG architectures',
    'Deploy and scale LLM applications',
    'Optimize for performance and cost'
  ),
  jsonb_build_array(
    'Python programming experience',
    'Basic understanding of machine learning',
    'Familiarity with APIs'
  ),
  jsonb_build_array(
    'Software Engineers',
    'ML Engineers',
    'AI Developers',
    'Technical Leads'
  ),
  'intermediate',
  40,
  true,
  true,
  true,
  true,
  true,
  4.9,
  256,
  1024
),
(
  'Vector Database Mastery',
  'Comprehensive guide to implementing and optimizing vector databases for AI applications.',
  'Databases',
  'advanced',
  299.99,
  true,
  6,
  'public',
  'published',
  'Dr. Sarah Johnson',
  'Database architect with 10+ years of experience. Previously led vector search at Pinecone.',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
  jsonb_build_array(
    'Master vector database architectures',
    'Implement efficient similarity search',
    'Optimize embedding storage',
    'Scale vector operations',
    'Build production search systems'
  ),
  jsonb_build_array(
    'Strong programming background',
    'Database fundamentals',
    'Basic linear algebra'
  ),
  jsonb_build_array(
    'Database Engineers',
    'ML Engineers',
    'Search Engineers',
    'System Architects'
  ),
  'advanced',
  30,
  true,
  true,
  true,
  true,
  false,
  4.8,
  128,
  512
),
(
  'AI Agents & Automation',
  'Learn to build sophisticated AI agents that can automate complex tasks and workflows.',
  'AI Development',
  'advanced',
  399.99,
  true,
  10,
  'public',
  'published',
  'Prof. Alex Turner',
  'AI Research Scientist specializing in autonomous systems and multi-agent architectures.',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
  jsonb_build_array(
    'Design autonomous AI agents',
    'Implement planning systems',
    'Build tool-using agents',
    'Create multi-agent systems',
    'Deploy production agents'
  ),
  jsonb_build_array(
    'Advanced Python skills',
    'Experience with LLMs',
    'System design knowledge'
  ),
  jsonb_build_array(
    'AI Engineers',
    'Automation Engineers',
    'Research Scientists',
    'Tech Leads'
  ),
  'advanced',
  50,
  true,
  true,
  true,
  true,
  true,
  4.9,
  96,
  384
);

-- Insert modules for each course
WITH courses_data AS (
  SELECT id, title FROM courses WHERE title IN (
    'Practical LLM Engineering',
    'Vector Database Mastery',
    'AI Agents & Automation'
  )
)
INSERT INTO modules (
  course_id,
  title,
  description,
  order_number,
  content,
  status,
  estimated_time
)
SELECT 
  c.id,
  m.title,
  m.description,
  m.order_number,
  m.content,
  'published',
  m.estimated_time
FROM courses_data c
CROSS JOIN LATERAL (
  VALUES 
    -- Modules for each course
    (
      'Foundations and Setup',
      'Essential concepts and development environment setup',
      1,
      E'# Course Foundations\n\n## Learning Objectives\n- Understand core concepts\n- Set up development environment\n- Master basic tools\n\n## Topics\n\n### 1. Core Concepts\n- Key principles\n- System architecture\n- Best practices\n\n### 2. Development Setup\n- Environment configuration\n- Tool installation\n- Initial testing\n\n## Assessment\n- Environment check\n- Basic implementation\n- Knowledge test',
      60
    ),
    (
      'Core Implementation',
      'Build the fundamental components of the system',
      2,
      E'# Core Implementation\n\n## Learning Objectives\n- Implement basic features\n- Create core components\n- Test functionality\n\n## Topics\n\n### 1. Basic Features\n- Component design\n- Implementation details\n- Testing strategy\n\n### 2. Integration\n- System integration\n- Component communication\n- Error handling\n\n## Assessment\n- Feature implementation\n- Integration test\n- Code review',
      90
    ),
    (
      'Advanced Features',
      'Implement advanced functionality and optimizations',
      3,
      E'# Advanced Features\n\n## Learning Objectives\n- Build advanced features\n- Optimize performance\n- Scale system\n\n## Topics\n\n### 1. Advanced Implementation\n- Complex features\n- Performance optimization\n- Scaling strategies\n\n### 2. Production Ready\n- Deployment prep\n- Monitoring setup\n- Maintenance plan\n\n## Assessment\n- Advanced implementation\n- Performance testing\n- System evaluation',
      120
    ),
    (
      'Production Deployment',
      'Deploy and maintain the system in production',
      4,
      E'# Production Deployment\n\n## Learning Objectives\n- Deploy system\n- Monitor performance\n- Maintain operations\n\n## Topics\n\n### 1. Deployment\n- Production setup\n- Configuration\n- Launch process\n\n### 2. Operations\n- Monitoring\n- Maintenance\n- Updates\n\n## Assessment\n- Deployment success\n- Operational metrics\n- System stability',
      90
    )
  ) AS m(title, description, order_number, content, estimated_time);