-- Insert new premium course
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
  total_students,
  thumbnail_url,
  last_updated
) VALUES (
  'Advanced AI Applications & Systems',
  'Master the development of sophisticated AI applications using cutting-edge techniques. Learn to build autonomous agents, implement multimodal systems, and create advanced AI solutions for real-world problems.',
  'AI Development',
  'advanced',
  1299.99,
  true,
  14,
  'public',
  'published',
  'Dr. Emily Chen',
  'Former AI Research Lead at DeepMind with 15+ years of experience in advanced AI systems. PhD in Artificial Intelligence from MIT.',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80',
  jsonb_build_array(
    'Build advanced AI applications',
    'Implement autonomous agent systems',
    'Create multimodal AI solutions',
    'Design real-time AI processing systems',
    'Develop AI-powered decision systems',
    'Master advanced optimization techniques'
  ),
  jsonb_build_array(
    'Advanced Python programming skills',
    'Strong mathematics background',
    'Experience with machine learning',
    'Understanding of neural networks'
  ),
  jsonb_build_array(
    'AI Engineers',
    'Research Scientists',
    'ML Engineers',
    'Technical Architects'
  ),
  'advanced',
  140,
  true,
  true,
  true,
  true,
  true,
  4.9,
  156,
  512,
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1920&q=80',
  NOW()
);

-- Insert modules for the course
WITH course_id AS (
  SELECT id FROM courses WHERE title = 'Advanced AI Applications & Systems' LIMIT 1
)
INSERT INTO modules (
  course_id,
  title,
  description,
  order_number,
  content,
  status,
  estimated_time
) VALUES
-- Module 1: Advanced AI Architectures
(
  (SELECT id FROM course_id),
  'Advanced AI Architectures',
  'Master sophisticated AI system architectures and implementation patterns.',
  1,
  E'# Advanced AI Architectures\n\n## Learning Objectives\n- Design complex AI systems\n- Implement advanced architectures\n- Master integration patterns\n- Optimize system design\n\n## Topics\n\n### 1. System Design\n- Advanced architectures\n- Integration patterns\n- System optimization\n- Performance tuning\n\n### 2. Implementation\n- Component design\n- System integration\n- Testing strategies\n- Deployment patterns\n\n### 3. Optimization\n- Performance optimization\n- Resource management\n- Scaling strategies\n- Monitoring systems\n\n## Projects\n1. AI System Design\n   - Create architecture\n   - Implement components\n   - Deploy solution\n\n## Assessment\n- Design review\n- Implementation quality\n- System performance',
  'published',
  180
),
-- Module 2: Autonomous Agents
(
  (SELECT id FROM course_id),
  'Autonomous Agent Systems',
  'Build sophisticated autonomous agent systems with advanced capabilities.',
  2,
  E'# Autonomous Agent Systems\n\n## Learning Objectives\n- Design agent architectures\n- Implement decision systems\n- Create learning agents\n- Deploy agent networks\n\n## Topics\n\n### 1. Agent Design\n- Architecture patterns\n- Decision systems\n- Learning mechanisms\n- Coordination protocols\n\n### 2. Implementation\n- Agent development\n- System integration\n- Testing frameworks\n- Deployment strategies\n\n### 3. Advanced Features\n- Multi-agent systems\n- Learning optimization\n- Performance tuning\n- Monitoring tools\n\n## Projects\n1. Agent System\n   - Build agent framework\n   - Implement features\n   - Deploy solution\n\n## Assessment\n- Implementation review\n- System performance\n- Agent behavior',
  'published',
  160
),
-- Module 3: Multimodal AI
(
  (SELECT id FROM course_id),
  'Multimodal AI Systems',
  'Create sophisticated AI systems that process multiple types of data and inputs.',
  3,
  E'# Multimodal AI Systems\n\n## Learning Objectives\n- Design multimodal systems\n- Implement data processing\n- Create fusion mechanisms\n- Deploy integrated solutions\n\n## Topics\n\n### 1. System Design\n- Architecture patterns\n- Data processing\n- Fusion mechanisms\n- Integration strategies\n\n### 2. Implementation\n- Processing pipelines\n- Model integration\n- System optimization\n- Deployment patterns\n\n### 3. Advanced Features\n- Real-time processing\n- Performance optimization\n- Scaling strategies\n- Monitoring systems\n\n## Projects\n1. Multimodal System\n   - Build processing pipeline\n   - Implement fusion\n   - Deploy solution\n\n## Assessment\n- Implementation quality\n- System performance\n- Integration testing',
  'published',
  170
),
-- Module 4: Real-time AI
(
  (SELECT id FROM course_id),
  'Real-time AI Processing',
  'Build high-performance AI systems for real-time data processing and decision making.',
  4,
  E'# Real-time AI Processing\n\n## Learning Objectives\n- Design real-time systems\n- Implement processing pipelines\n- Optimize performance\n- Deploy solutions\n\n## Topics\n\n### 1. System Design\n- Architecture patterns\n- Processing strategies\n- Performance optimization\n- Scaling mechanisms\n\n### 2. Implementation\n- Pipeline development\n- System integration\n- Testing frameworks\n- Deployment patterns\n\n### 3. Optimization\n- Performance tuning\n- Resource management\n- Scaling strategies\n- Monitoring systems\n\n## Projects\n1. Real-time System\n   - Build processing pipeline\n   - Implement features\n   - Deploy solution\n\n## Assessment\n- Implementation review\n- Performance metrics\n- System reliability',
  'published',
  150
),
-- Module 5: AI Decision Systems
(
  (SELECT id FROM course_id),
  'AI Decision Systems',
  'Create advanced AI systems for complex decision-making and optimization.',
  5,
  E'# AI Decision Systems\n\n## Learning Objectives\n- Design decision systems\n- Implement optimization\n- Create evaluation frameworks\n- Deploy solutions\n\n## Topics\n\n### 1. System Design\n- Architecture patterns\n- Decision frameworks\n- Optimization strategies\n- Evaluation methods\n\n### 2. Implementation\n- System development\n- Integration patterns\n- Testing strategies\n- Deployment methods\n\n### 3. Advanced Features\n- Performance optimization\n- Resource management\n- Scaling mechanisms\n- Monitoring tools\n\n## Projects\n1. Decision System\n   - Build framework\n   - Implement features\n   - Deploy solution\n\n## Assessment\n- Implementation quality\n- System performance\n- Decision accuracy',
  'published',
  140
),
-- Module 6: Advanced Optimization
(
  (SELECT id FROM course_id),
  'System Optimization',
  'Master advanced techniques for optimizing AI system performance and efficiency.',
  6,
  E'# System Optimization\n\n## Learning Objectives\n- Design optimization strategies\n- Implement performance tuning\n- Create monitoring systems\n- Deploy solutions\n\n## Topics\n\n### 1. Optimization\n- Performance strategies\n- Resource management\n- Scaling patterns\n- Monitoring frameworks\n\n### 2. Implementation\n- System tuning\n- Integration optimization\n- Testing methods\n- Deployment patterns\n\n### 3. Advanced Features\n- Real-time optimization\n- Resource efficiency\n- Scaling mechanisms\n- Monitoring tools\n\n## Projects\n1. Optimization System\n   - Build framework\n   - Implement features\n   - Deploy solution\n\n## Assessment\n- Implementation review\n- Performance metrics\n- System efficiency',
  'published',
  130
);