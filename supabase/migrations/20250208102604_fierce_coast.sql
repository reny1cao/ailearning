/*
  # Create LLM Interview Preparation Course and Modules

  1. New Content
    - Adds a comprehensive LLM interview preparation course
    - Creates detailed modules covering key topics
    - Includes learning objectives and content for each module

  2. Course Details
    - Premium course with structured curriculum
    - Covers prompt engineering, RAG systems, and practical implementation
    - Includes real-world examples and case studies
*/

-- Insert the main course
INSERT INTO courses (
  title,
  description,
  category,
  difficulty,
  price,
  is_premium
) VALUES (
  'Advanced LLM Engineering Interview Preparation',
  'Comprehensive preparation for LLM engineering interviews covering prompt engineering, RAG systems, and practical implementation. Learn how to tackle technical questions, system design challenges, and real-world scenarios.',
  'Interview Prep',
  'advanced',
  299.99,
  true
);

-- Create modules for the course
WITH course_id AS (
  SELECT id FROM courses 
  WHERE title = 'Advanced LLM Engineering Interview Preparation'
  LIMIT 1
)
INSERT INTO modules (
  course_id,
  title,
  description,
  order_number,
  content
) VALUES
-- Module 1: Foundations of LLM and Generative AI
(
  (SELECT id FROM course_id),
  'Foundations of LLM and Generative AI',
  'Master the core concepts of Large Language Models and differentiate between various AI approaches.',
  1,
  E'# Understanding LLMs and AI Fundamentals\n\n## Key Concepts\n\n### Predictive vs Generative AI\n- Predictive AI focuses on classification and prediction\n- Generative AI creates new content based on training data\n- Key differences in application and implementation\n\n### LLM Architecture and Training\n- Basic architecture of transformer-based models\n- Training methodologies and approaches\n- Token processing and sequence handling\n\n### Practical Examples\n- Real-world applications of different AI types\n- Case studies of successful implementations\n- Common pitfalls and how to avoid them\n\n## Interview Tips\n- How to structure your answers\n- Key points to emphasize\n- Common follow-up questions\n\n## Practice Questions\n1. Explain the difference between predictive and generative AI\n2. How would you describe the training process of an LLM?\n3. What are tokens and why are they important?'
),
-- Module 2: Advanced Prompt Engineering
(
  (SELECT id FROM course_id),
  'Advanced Prompt Engineering Techniques',
  'Deep dive into prompt engineering strategies and best practices for production systems.',
  2,
  E'# Mastering Prompt Engineering\n\n## Core Concepts\n\n### Temperature and Sampling\n- Understanding temperature parameter\n- Different sampling strategies\n- When to use each approach\n\n### Prompt Structure and Design\n- Basic prompt components\n- Advanced structuring techniques\n- Error handling and edge cases\n\n### In-Context Learning\n- Zero-shot vs few-shot learning\n- Example selection and formatting\n- Best practices for different scenarios\n\n## Advanced Topics\n\n### Handling Hallucinations\n- Common causes of hallucinations\n- Prevention strategies\n- Detection and mitigation\n\n### Improving Reasoning\n- Chain-of-thought prompting\n- Step-by-step reasoning\n- Verification and validation\n\n## Practice Scenarios\n1. Design a prompt for a customer service chatbot\n2. Implement error handling in prompts\n3. Debug problematic prompt responses'
),
-- Module 3: RAG Systems and Knowledge Integration
(
  (SELECT id FROM course_id),
  'RAG Systems and Knowledge Integration',
  'Learn how to design and implement effective Retrieval-Augmented Generation systems.',
  3,
  E'# Implementing RAG Systems\n\n## System Architecture\n\n### Components of RAG\n- Retrieval mechanisms\n- Integration with LLMs\n- Performance optimization\n\n### Knowledge Base Design\n- Data structuring\n- Indexing strategies\n- Update mechanisms\n\n## Implementation Strategies\n\n### Choosing Between RAG and Fine-tuning\n- Use case analysis\n- Cost considerations\n- Performance requirements\n\n### Custom Knowledge Integration\n- Proprietary data handling\n- Security considerations\n- Scaling strategies\n\n## System Design Exercise\n1. Design a RAG system for a large enterprise\n2. Handle real-time data updates\n3. Optimize for performance and cost\n\n## Interview Scenarios\n- Technical architecture questions\n- System design challenges\n- Performance optimization cases'
),
-- Module 4: Production Implementation and Best Practices
(
  (SELECT id FROM course_id),
  'Production Implementation and Best Practices',
  'Master the practical aspects of deploying LLM systems in production environments.',
  4,
  E'# Production LLM Systems\n\n## System Architecture\n\n### Deployment Strategies\n- Infrastructure considerations\n- Scaling patterns\n- Monitoring and logging\n\n### Performance Optimization\n- Caching strategies\n- Load balancing\n- Cost optimization\n\n## Best Practices\n\n### Security Considerations\n- Data privacy\n- Prompt injection prevention\n- Access control\n\n### Maintenance and Updates\n- Version control\n- Model updates\n- Knowledge base maintenance\n\n## Case Studies\n1. Large-scale deployment analysis\n2. Cost optimization scenarios\n3. Security incident handling\n\n## Mock Interview\n- System design questions\n- Technical deep dives\n- Problem-solving scenarios'
);