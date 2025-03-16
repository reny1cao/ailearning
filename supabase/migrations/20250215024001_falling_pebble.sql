/*
  # Add Premium AI Course
  
  1. New Course
    - Advanced AI course focused on production systems
    - Premium tier with comprehensive modules
    - Detailed curriculum and learning path
  
  2. Course Modules
    - 6 in-depth modules covering key topics
    - Practical assignments and projects
    - Production-focused content
*/

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
  'Production AI Systems Masterclass',
  'Master the art of building and deploying production-grade AI systems. Learn advanced architectures, scaling strategies, and real-world optimization techniques from industry experts.',
  'AI Engineering',
  'advanced',
  1499.99,
  true,
  16,
  'public',
  'published',
  'Dr. Michael Zhang',
  'Principal AI Architect at Tesla with 12+ years of experience building large-scale AI systems. PhD in Computer Science from Stanford.',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80',
  jsonb_build_array(
    'Design scalable AI architectures',
    'Implement production monitoring systems',
    'Master deployment strategies',
    'Optimize system performance',
    'Handle high-throughput AI workloads',
    'Ensure system reliability and safety'
  ),
  jsonb_build_array(
    'Strong programming skills in Python',
    'Experience with cloud platforms',
    'Basic understanding of AI/ML',
    'Familiarity with distributed systems'
  ),
  jsonb_build_array(
    'Senior Software Engineers',
    'AI System Architects',
    'DevOps Engineers',
    'Technical Leaders'
  ),
  'advanced',
  160,
  true,
  true,
  true,
  true,
  true,
  4.9,
  184,
  768,
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1920&q=80',
  NOW()
);

-- Insert modules for the course
WITH course_id AS (
  SELECT id FROM courses WHERE title = 'Production AI Systems Masterclass' LIMIT 1
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
-- Module 1: System Architecture
(
  (SELECT id FROM course_id),
  'AI System Architecture',
  'Design robust and scalable AI system architectures for production environments.',
  1,
  E'# AI System Architecture\n\n## Learning Objectives\n- Design scalable AI architectures\n- Implement microservices patterns\n- Master distributed systems\n- Ensure system reliability\n\n## Topics\n\n### 1. Architecture Patterns\n- Microservices design\n- Event-driven architectures\n- Distributed systems\n- Scalability patterns\n\n### 2. System Components\n- Service mesh\n- API gateways\n- Load balancers\n- Cache layers\n\n### 3. Infrastructure\n- Container orchestration\n- Cloud platforms\n- Network design\n- Storage systems\n\n## Projects\n1. System Design\n   - Design complete architecture\n   - Document components\n   - Create deployment plan\n\n## Assessment\n- Architecture review\n- Component design\n- System evaluation',
  'published',
  180
),
-- Module 2: Deployment Strategies
(
  (SELECT id FROM course_id),
  'Production Deployment',
  'Master advanced deployment strategies for AI systems.',
  2,
  E'# Production Deployment\n\n## Learning Objectives\n- Implement deployment strategies\n- Master CI/CD pipelines\n- Ensure zero-downtime updates\n- Monitor deployments\n\n## Topics\n\n### 1. Deployment Patterns\n- Blue-green deployment\n- Canary releases\n- Rolling updates\n- A/B testing\n\n### 2. CI/CD\n- Pipeline design\n- Automated testing\n- Deployment automation\n- Rollback strategies\n\n### 3. Infrastructure\n- Container registry\n- Kubernetes\n- Service mesh\n- Monitoring\n\n## Projects\n1. Deployment Pipeline\n   - Build CI/CD system\n   - Implement strategies\n   - Create monitoring\n\n## Assessment\n- Pipeline implementation\n- Strategy evaluation\n- System testing',
  'published',
  160
),
-- Module 3: Performance Optimization
(
  (SELECT id FROM course_id),
  'System Optimization',
  'Optimize AI system performance for production workloads.',
  3,
  E'# System Optimization\n\n## Learning Objectives\n- Optimize system performance\n- Implement caching strategies\n- Master resource management\n- Monitor metrics\n\n## Topics\n\n### 1. Performance Tuning\n- Resource optimization\n- Query optimization\n- Cache strategies\n- Load balancing\n\n### 2. Monitoring\n- Metrics collection\n- Performance tracking\n- Alert systems\n- Debugging tools\n\n### 3. Resource Management\n- CPU optimization\n- Memory management\n- Network efficiency\n- Storage optimization\n\n## Projects\n1. Optimization System\n   - Implement monitoring\n   - Optimize resources\n   - Create dashboards\n\n## Assessment\n- Performance metrics\n- System efficiency\n- Resource usage',
  'published',
  170
),
-- Module 4: Scaling Strategies
(
  (SELECT id FROM course_id),
  'System Scaling',
  'Implement effective scaling strategies for high-throughput AI systems.',
  4,
  E'# System Scaling\n\n## Learning Objectives\n- Design scaling strategies\n- Implement auto-scaling\n- Master load balancing\n- Optimize costs\n\n## Topics\n\n### 1. Scaling Patterns\n- Horizontal scaling\n- Vertical scaling\n- Database scaling\n- Cache scaling\n\n### 2. Auto-scaling\n- Scaling policies\n- Metrics-based scaling\n- Predictive scaling\n- Cost optimization\n\n### 3. Load Management\n- Load balancing\n- Traffic routing\n- Rate limiting\n- Queue management\n\n## Projects\n1. Scaling System\n   - Implement auto-scaling\n   - Create load tests\n   - Monitor performance\n\n## Assessment\n- Scaling implementation\n- Load testing\n- Cost analysis',
  'published',
  150
),
-- Module 5: Security & Compliance
(
  (SELECT id FROM course_id),
  'Security Implementation',
  'Implement comprehensive security measures for AI systems.',
  5,
  E'# Security Implementation\n\n## Learning Objectives\n- Design security architecture\n- Implement authentication\n- Ensure data protection\n- Monitor security\n\n## Topics\n\n### 1. Security Architecture\n- Authentication systems\n- Authorization\n- Encryption\n- Security protocols\n\n### 2. Data Protection\n- Data encryption\n- Access control\n- Privacy measures\n- Compliance requirements\n\n### 3. Monitoring\n- Security monitoring\n- Threat detection\n- Incident response\n- Audit logging\n\n## Projects\n1. Security System\n   - Implement security\n   - Create monitoring\n   - Document compliance\n\n## Assessment\n- Security review\n- Compliance check\n- System audit',
  'published',
  140
),
-- Module 6: Production Operations
(
  (SELECT id FROM course_id),
  'Production Management',
  'Master the operational aspects of production AI systems.',
  6,
  E'# Production Management\n\n## Learning Objectives\n- Manage production systems\n- Implement SRE practices\n- Ensure reliability\n- Handle incidents\n\n## Topics\n\n### 1. Operations\n- System monitoring\n- Incident management\n- Change control\n- Documentation\n\n### 2. Reliability\n- SLOs and SLAs\n- Error budgets\n- Reliability testing\n- Chaos engineering\n\n### 3. Incident Management\n- Response procedures\n- Escalation paths\n- Post-mortems\n- Improvement cycles\n\n## Projects\n1. Operations System\n   - Create runbooks\n   - Implement monitoring\n   - Document procedures\n\n## Assessment\n- Operations review\n- Reliability metrics\n- Incident handling',
  'published',
  130
);