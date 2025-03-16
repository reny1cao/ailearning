-- Add modules for courses that don't have any
WITH courses_without_modules AS (
  SELECT c.id, c.title
  FROM courses c
  LEFT JOIN modules m ON m.course_id = c.id
  GROUP BY c.id, c.title
  HAVING COUNT(m.id) = 0
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
FROM courses_without_modules c
CROSS JOIN (
  VALUES 
    (
      'Introduction to AI Engineering',
      'Learn the fundamentals of AI engineering and essential concepts.',
      1,
      E'# Introduction to AI Engineering\n\n## Learning Objectives\n- Understand AI fundamentals\n- Master basic concepts\n- Learn essential tools\n\n## Topics\n\n### 1. AI Basics\n- What is AI?\n- Types of AI\n- Applications\n- Core concepts\n\n### 2. Tools & Technologies\n- Development environments\n- Key libraries\n- Basic implementations\n\n### 3. Practical Applications\n- Real-world examples\n- Case studies\n- Best practices\n\n## Assessment\n- Knowledge check\n- Practical exercises\n- Final quiz',
      60
    ),
    (
      'AI Development Tools',
      'Master the essential tools and frameworks for AI development.',
      2,
      E'# AI Development Tools\n\n## Learning Objectives\n- Set up development environment\n- Learn key frameworks\n- Master essential tools\n\n## Topics\n\n### 1. Development Setup\n- IDE configuration\n- Virtual environments\n- Package management\n\n### 2. Frameworks\n- Popular AI frameworks\n- Library usage\n- Integration patterns\n\n### 3. Best Practices\n- Code organization\n- Testing strategies\n- Documentation\n\n## Assessment\n- Environment setup\n- Framework usage\n- Final project',
      90
    ),
    (
      'Practical AI Implementation',
      'Apply AI concepts in real-world scenarios and projects.',
      3,
      E'# Practical AI Implementation\n\n## Learning Objectives\n- Build real projects\n- Solve practical problems\n- Deploy solutions\n\n## Topics\n\n### 1. Project Planning\n- Requirements analysis\n- Architecture design\n- Implementation strategy\n\n### 2. Development\n- Coding practices\n- Testing methods\n- Documentation\n\n### 3. Deployment\n- Production considerations\n- Monitoring\n- Maintenance\n\n## Assessment\n- Project implementation\n- Code review\n- Deployment evaluation',
      120
    )
  ) AS m(title, description, order_number, content, estimated_time);