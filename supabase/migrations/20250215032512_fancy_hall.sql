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
  'Enterprise LLM Engineering',
  'Master the implementation and deployment of Large Language Models in enterprise environments. Learn advanced techniques for building secure, scalable, and cost-effective LLM applications that meet enterprise requirements.',
  'LLM Engineering',
  'advanced',
  1999.99,
  true,
  16,
  'public',
  'published',
  'Dr. James Wilson',
  'Former Head of AI Infrastructure at Microsoft with 15+ years of experience in enterprise AI systems. PhD in Computer Science from Berkeley.',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80',
  jsonb_build_array(
    'Design enterprise-grade LLM architectures',
    'Implement secure and compliant LLM systems',
    'Build scalable RAG pipelines',
    'Master cost optimization techniques',
    'Deploy production monitoring systems',
    'Ensure enterprise security and compliance'
  ),
  jsonb_build_array(
    'Advanced Python programming skills',
    'Experience with cloud platforms',
    'Understanding of LLM fundamentals',
    'Basic knowledge of security principles'
  ),
  jsonb_build_array(
    'Enterprise AI Engineers',
    'Solution Architects',
    'Technical Leaders',
    'AI Infrastructure Engineers'
  ),
  'advanced',
  180,
  true,
  true,
  true,
  true,
  true,
  4.9,
  128,
  512,
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80',
  NOW()
);

-- Insert modules for the course
WITH course_id AS (
  SELECT id FROM courses WHERE title = 'Enterprise LLM Engineering' LIMIT 1
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
-- Module 1: Enterprise Architecture
(
  (SELECT id FROM course_id),
  'Enterprise LLM Architecture',
  'Design robust and secure LLM architectures for enterprise environments.',
  1,
  E'# Enterprise LLM Architecture\n\n## Learning Objectives\n- Design secure LLM architectures\n- Implement enterprise patterns\n- Master system integration\n- Ensure scalability\n\n## Topics\n\n### 1. Architecture Patterns\n- Enterprise design patterns\n- Security architecture\n- Integration frameworks\n- Scalability models\n\n### 2. System Components\n- API management\n- Authentication systems\n- Monitoring frameworks\n- Logging infrastructure\n\n### 3. Enterprise Integration\n- Service mesh\n- Message queues\n- Event systems\n- Data pipelines\n\n## Projects\n1. Enterprise Architecture\n   - Design system architecture\n   - Document security measures\n   - Create integration plan\n\n## Assessment\n- Architecture review\n- Security evaluation\n- Integration testing',
  'published',
  180
),
-- Module 2: Security & Compliance
(
  (SELECT id FROM course_id),
  'Enterprise Security & Compliance',
  'Implement comprehensive security measures and ensure regulatory compliance.',
  2,
  E'# Enterprise Security & Compliance\n\n## Learning Objectives\n- Implement security measures\n- Ensure compliance\n- Master access control\n- Monitor security\n\n## Topics\n\n### 1. Security Implementation\n- Authentication systems\n- Authorization frameworks\n- Data encryption\n- Security protocols\n\n### 2. Compliance\n- Regulatory requirements\n- Audit procedures\n- Documentation\n- Risk management\n\n### 3. Monitoring\n- Security monitoring\n- Compliance tracking\n- Audit logging\n- Incident response\n\n## Projects\n1. Security System\n   - Implement security\n   - Document compliance\n   - Create monitoring\n\n## Assessment\n- Security review\n- Compliance audit\n- System testing',
  'published',
  160
),
-- Module 3: Enterprise RAG Systems
(
  (SELECT id FROM course_id),
  'Enterprise RAG Implementation',
  'Build scalable and secure RAG systems for enterprise applications.',
  3,
  E'# Enterprise RAG Implementation\n\n## Learning Objectives\n- Design enterprise RAG\n- Implement security\n- Ensure scalability\n- Monitor performance\n\n## Topics\n\n### 1. RAG Architecture\n- Enterprise patterns\n- Security measures\n- Scaling strategies\n- Performance optimization\n\n### 2. Implementation\n- Secure retrieval\n- Data protection\n- Access control\n- Monitoring systems\n\n### 3. Production\n- Deployment strategies\n- Performance tuning\n- Cost optimization\n- Maintenance\n\n## Projects\n1. Enterprise RAG\n   - Build secure system\n   - Implement monitoring\n   - Deploy solution\n\n## Assessment\n- System review\n- Security audit\n- Performance testing',
  'published',
  170
),
-- Module 4: Cost Optimization
(
  (SELECT id FROM course_id),
  'Enterprise Cost Management',
  'Master cost optimization techniques for enterprise LLM applications.',
  4,
  E'# Enterprise Cost Management\n\n## Learning Objectives\n- Optimize costs\n- Implement budgeting\n- Monitor usage\n- Manage resources\n\n## Topics\n\n### 1. Cost Optimization\n- Usage analysis\n- Resource management\n- Scaling strategies\n- Budget controls\n\n### 2. Implementation\n- Monitoring systems\n- Alert frameworks\n- Resource allocation\n- Usage tracking\n\n### 3. Management\n- Budget planning\n- Cost forecasting\n- Resource optimization\n- Performance tuning\n\n## Projects\n1. Cost Management\n   - Implement monitoring\n   - Create budgets\n   - Optimize resources\n\n## Assessment\n- Cost analysis\n- Resource review\n- System efficiency',
  'published',
  150
),
-- Module 5: Production Monitoring
(
  (SELECT id FROM course_id),
  'Enterprise Monitoring',
  'Implement comprehensive monitoring systems for enterprise LLM applications.',
  5,
  E'# Enterprise Monitoring\n\n## Learning Objectives\n- Design monitoring\n- Implement alerts\n- Track performance\n- Manage incidents\n\n## Topics\n\n### 1. Monitoring Systems\n- Metrics collection\n- Performance tracking\n- Resource monitoring\n- Alert systems\n\n### 2. Implementation\n- Monitoring setup\n- Alert configuration\n- Dashboard creation\n- Incident management\n\n### 3. Management\n- System maintenance\n- Performance tuning\n- Resource optimization\n- Incident response\n\n## Projects\n1. Monitoring System\n   - Build monitoring\n   - Create dashboards\n   - Implement alerts\n\n## Assessment\n- System review\n- Alert testing\n- Performance analysis',
  'published',
  140
),
-- Module 6: Enterprise Operations
(
  (SELECT id FROM course_id),
  'Enterprise Operations',
  'Master the operational aspects of enterprise LLM systems.',
  6,
  E'# Enterprise Operations\n\n## Learning Objectives\n- Manage operations\n- Ensure reliability\n- Handle incidents\n- Optimize performance\n\n## Topics\n\n### 1. Operations\n- System management\n- Maintenance procedures\n- Update strategies\n- Documentation\n\n### 2. Reliability\n- SLA management\n- Performance metrics\n- Availability monitoring\n- Incident handling\n\n### 3. Optimization\n- Performance tuning\n- Resource management\n- Cost optimization\n- System efficiency\n\n## Projects\n1. Operations System\n   - Create procedures\n   - Implement monitoring\n   - Document processes\n\n## Assessment\n- Operations review\n- System reliability\n- Performance metrics',
  'published',
  130
);