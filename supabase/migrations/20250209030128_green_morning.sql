-- First ensure proper foreign key relationships
ALTER TABLE modules
DROP CONSTRAINT IF EXISTS modules_course_id_fkey,
ADD CONSTRAINT modules_course_id_fkey 
  FOREIGN KEY (course_id) 
  REFERENCES courses(id) 
  ON DELETE CASCADE;

-- Insert modules for AI Accelerator Pro 2025
WITH course_id AS (
  SELECT id FROM courses WHERE title = 'AI Accelerator Pro 2025' LIMIT 1
)
INSERT INTO modules (
  course_id,
  title,
  description,
  order_number,
  content,
  status
) VALUES
-- Module 1: Foundations of AI Engineering
(
  (SELECT id FROM course_id),
  'Foundations of AI Engineering',
  'Master the core concepts and tools essential for modern AI engineering.',
  1,
  E'# Foundations of AI Engineering\n\n## Learning Objectives\n- Master Python for AI development\n- Understand neural network architectures\n- Implement basic ML algorithms\n- Set up development environments\n\n## Topics\n\n### 1. Python for AI\n- Advanced Python concepts\n- NumPy and PyTorch essentials\n- Data processing pipelines\n- Performance optimization\n\n### 2. Neural Networks\n- Architecture fundamentals\n- Forward and backward propagation\n- Activation functions\n- Loss functions and optimization\n\n### 3. Development Environment\n- Git and version control\n- Docker containers\n- Cloud development\n- CI/CD pipelines\n\n## Projects\n1. AI Development Pipeline\n   - Set up complete environment\n   - Implement data processing\n   - Create model training pipeline\n\n## Assessment\n- Coding assignments\n- Environment setup\n- Pipeline implementation',
  'published'
),
-- Module 2: Large Language Models
(
  (SELECT id FROM course_id),
  'Large Language Models',
  'Deep dive into LLM architectures, training, and deployment.',
  2,
  E'# Large Language Models\n\n## Learning Objectives\n- Understand transformer architecture\n- Master prompt engineering\n- Implement fine-tuning\n- Deploy LLM applications\n\n## Topics\n\n### 1. Transformer Architecture\n- Attention mechanisms\n- Position embeddings\n- Layer normalization\n- Model scaling\n\n### 2. Prompt Engineering\n- Few-shot learning\n- Chain-of-thought prompting\n- System prompts\n- Output formatting\n\n### 3. Model Fine-tuning\n- PEFT methods\n- LoRA implementation\n- QLoRA optimization\n- Parameter-efficient training\n\n## Projects\n1. Custom LLM Application\n   - Fine-tune base model\n   - Implement prompting system\n   - Deploy application\n\n## Assessment\n- Architecture implementation\n- Fine-tuning project\n- Deployment evaluation',
  'published'
),
-- Module 3: RAG Systems
(
  (SELECT id FROM course_id),
  'Advanced RAG Systems',
  'Build production-ready Retrieval Augmented Generation systems.',
  3,
  E'# Advanced RAG Systems\n\n## Learning Objectives\n- Design RAG architectures\n- Implement vector databases\n- Optimize retrieval\n- Deploy production systems\n\n## Topics\n\n### 1. RAG Architecture\n- Component design\n- Retrieval strategies\n- Reranking methods\n- System integration\n\n### 2. Vector Databases\n- FAISS implementation\n- Embedding models\n- Indexing strategies\n- Query optimization\n\n### 3. Production Systems\n- Scaling considerations\n- Monitoring setup\n- Performance tuning\n- Cost optimization\n\n## Projects\n1. Enterprise RAG System\n   - Build complete pipeline\n   - Implement monitoring\n   - Deploy to production\n\n## Assessment\n- System design\n- Implementation quality\n- Performance metrics',
  'published'
),
-- Module 4: AI Agents
(
  (SELECT id FROM course_id),
  'AI Agents and Automation',
  'Create sophisticated AI agents for complex tasks.',
  4,
  E'# AI Agents and Automation\n\n## Learning Objectives\n- Design agent architectures\n- Implement planning systems\n- Create tool-using agents\n- Deploy autonomous systems\n\n## Topics\n\n### 1. Agent Architecture\n- Planning algorithms\n- Memory systems\n- Tool integration\n- Multi-agent coordination\n\n### 2. Tool Usage\n- API integration\n- Code execution\n- Safety mechanisms\n- Error handling\n\n### 3. Deployment\n- Monitoring systems\n- Safety measures\n- Performance tracking\n- Cost management\n\n## Projects\n1. Autonomous Agent\n   - Build agent system\n   - Implement tools\n   - Deploy monitoring\n\n## Assessment\n- Architecture design\n- Implementation\n- System evaluation',
  'published'
),
-- Module 5: Production AI Systems
(
  (SELECT id FROM course_id),
  'Production AI Engineering',
  'Master the deployment and maintenance of AI systems.',
  5,
  E'# Production AI Engineering\n\n## Learning Objectives\n- Design scalable systems\n- Implement monitoring\n- Optimize performance\n- Manage costs\n\n## Topics\n\n### 1. System Architecture\n- Microservices design\n- Load balancing\n- Caching strategies\n- Database optimization\n\n### 2. Monitoring\n- Metrics collection\n- Alert systems\n- Performance tracking\n- Cost monitoring\n\n### 3. Optimization\n- Performance tuning\n- Cost management\n- Resource allocation\n- Scaling strategies\n\n## Projects\n1. Production System\n   - Design architecture\n   - Implement monitoring\n   - Deploy and optimize\n\n## Assessment\n- System design\n- Implementation\n- Performance metrics',
  'published'
),
-- Module 6: AI Ethics and Safety
(
  (SELECT id FROM course_id),
  'AI Ethics and Safety',
  'Implement responsible AI development practices.',
  6,
  E'# AI Ethics and Safety\n\n## Learning Objectives\n- Understand ethical considerations\n- Implement safety measures\n- Design responsible systems\n- Ensure compliance\n\n## Topics\n\n### 1. Ethical AI\n- Bias detection\n- Fairness metrics\n- Transparency\n- Accountability\n\n### 2. Safety Systems\n- Input validation\n- Output filtering\n- Monitoring systems\n- Incident response\n\n### 3. Compliance\n- Regulatory requirements\n- Documentation\n- Audit procedures\n- Risk management\n\n## Projects\n1. Ethical AI System\n   - Implement safety measures\n   - Create monitoring\n   - Document compliance\n\n## Assessment\n- Ethics evaluation\n- Safety implementation\n- Compliance audit',
  'published'
);