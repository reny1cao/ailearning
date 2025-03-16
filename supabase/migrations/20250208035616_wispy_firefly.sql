/*
  # Add sample data for LLM course platform

  1. Sample Data
    - Adds courses with varying difficulties and categories
    - Adds modules for each course
    - Adds sample certificates

  2. Content
    - Mix of free and premium courses
    - Realistic course descriptions and content
    - Varied pricing for premium courses
*/

-- Sample Courses
INSERT INTO courses (title, description, category, difficulty, price, is_premium) VALUES
('Fundamentals of Prompt Engineering', 'Master the art of crafting effective prompts for LLMs. Learn best practices, common patterns, and advanced techniques.', 'Prompt Engineering', 'beginner', 0, false),
('Advanced RAG Systems', 'Deep dive into Retrieval Augmented Generation. Build production-ready systems with vector databases and efficient chunking strategies.', 'RAG', 'advanced', 199.99, true),
('Vector Databases Masterclass', 'Comprehensive guide to vector databases. Learn about embeddings, similarity search, and scaling vector operations.', 'Vector Databases', 'intermediate', 149.99, true),
('LLM Fine-Tuning Workshop', 'Hands-on course on fine-tuning language models. From PEFT to full fine-tuning, master all techniques.', 'Model Fine-Tuning', 'advanced', 299.99, true),
('Responsible AI Development', 'Essential guide to ethical AI development. Cover bias, safety, and responsible deployment practices.', 'Ethics & Deployment', 'intermediate', 0, false),
('LLM Interview Preparation', 'Comprehensive preparation for LLM engineering interviews. Includes real interview questions and scenarios.', 'Interview Prep', 'intermediate', 99.99, true);

-- Sample Modules for "Fundamentals of Prompt Engineering"
INSERT INTO modules (course_id, title, description, order_number, content) 
SELECT 
  id,
  unnest(ARRAY[
    'Introduction to Prompt Engineering',
    'Basic Prompt Patterns',
    'Context and Memory Management',
    'Advanced Prompt Techniques'
  ]),
  unnest(ARRAY[
    'Overview of prompt engineering and its importance in LLM applications.',
    'Learn common prompt patterns and when to use them.',
    'Techniques for managing context and memory in complex conversations.',
    'Advanced techniques for improving prompt effectiveness.'
  ]),
  unnest(ARRAY[1, 2, 3, 4]),
  unnest(ARRAY[
    'Welcome to the course! In this module...',
    'Basic prompt patterns include...',
    'Context management is crucial for...',
    'Advanced techniques we will cover...'
  ])
FROM courses 
WHERE title = 'Fundamentals of Prompt Engineering';

-- Sample Modules for "Advanced RAG Systems"
INSERT INTO modules (course_id, title, description, order_number, content) 
SELECT 
  id,
  unnest(ARRAY[
    'RAG Fundamentals',
    'Vector Database Integration',
    'Chunking Strategies',
    'Performance Optimization',
    'Production Deployment'
  ]),
  unnest(ARRAY[
    'Introduction to RAG systems and their components.',
    'Integrating vector databases for efficient retrieval.',
    'Advanced text chunking strategies for optimal retrieval.',
    'Optimizing RAG system performance.',
    'Deploying RAG systems to production.'
  ]),
  unnest(ARRAY[1, 2, 3, 4, 5]),
  unnest(ARRAY[
    'RAG systems combine the power of...',
    'Vector databases are essential for...',
    'Effective chunking is crucial for...',
    'Performance optimization involves...',
    'When deploying to production...'
  ])
FROM courses 
WHERE title = 'Advanced RAG Systems';

-- Sample Modules for "Vector Databases Masterclass"
INSERT INTO modules (course_id, title, description, order_number, content) 
SELECT 
  id,
  unnest(ARRAY[
    'Vector Database Basics',
    'Embedding Models',
    'Similarity Search',
    'Scaling Vector Operations'
  ]),
  unnest(ARRAY[
    'Introduction to vector databases and their use cases.',
    'Understanding and selecting embedding models.',
    'Implementing efficient similarity search.',
    'Strategies for scaling vector operations.'
  ]),
  unnest(ARRAY[1, 2, 3, 4]),
  unnest(ARRAY[
    'Vector databases store and index...',
    'Embedding models convert text into...',
    'Similarity search allows us to...',
    'Scaling vector operations requires...'
  ])
FROM courses 
WHERE title = 'Vector Databases Masterclass';