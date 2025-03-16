/*
  # AI Engineer Prep Course Creation

  1. New Content
    - Premium AI Engineer Prep course
    - Four comprehensive modules covering core curriculum
    - Detailed course content and structure

  2. Changes
    - Add new course with modules
    - Set proper pricing and visibility
*/

-- Insert the main AI Engineer Prep course
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
  prerequisites,
  learning_objectives,
  thumbnail_url
) VALUES (
  'AI Accelerator Pro 2025',
  'Master AI engineering with our comprehensive program covering foundational models, RAG systems, AI agents, and multimodal AI. This industry-leading course combines theoretical knowledge with practical implementation, preparing you for high-paying roles in AI engineering.',
  'AI Engineering',
  'advanced',
  4999.00,
  true,
  24,
  'public',
  'published',
  jsonb_build_array(
    'Basic Python programming knowledge',
    'Understanding of REST APIs',
    'Familiarity with web development concepts'
  ),
  jsonb_build_array(
    'Master core LLM concepts and architectures',
    'Implement effective prompt engineering techniques',
    'Build production-ready RAG systems',
    'Deploy AI applications responsibly',
    'Optimize for performance and cost'
  ),
  'https://images.unsplash.com/photo-1531482615713-2afd69097998'
);

-- Insert detailed modules
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
-- Module 1: Foundational Models & Benchmarks
(
  (SELECT id FROM course_id),
  'Foundational Models & Benchmarks',
  'Master key LLM architectures and evaluation techniques with hands-on implementation.',
  1,
  E'# Foundational Models & Benchmarks\n\n## Learning Objectives\n- Understand GPT-4, Claude 3.5, and LLaMA 3 architectures\n- Master model evaluation using MMLU Pro and SWE-Bench\n- Implement automated prompt engineering with LangChain and DSPy\n\n## Key Topics\n\n### 1. Modern LLM Architectures\n- Architecture deep-dive: GPT-4, Claude 3.5, LLaMA 3\n- Attention mechanisms and scaling laws\n- Model comparison and selection criteria\n- Performance characteristics and trade-offs\n\n### 2. Benchmarking & Evaluation\n- MMLU Pro implementation\n- SWE-Bench for coding tasks\n- IFEval for instruction following\n- Custom benchmark development\n\n### 3. Automated Prompt Engineering\n- LangChain integration\n- DSPy implementation\n- Prompt optimization techniques\n- Template management\n\n## Hands-on Projects\n1. Model Evaluation Pipeline\n   - Build comprehensive testing framework\n   - Implement multiple benchmarks\n   - Generate performance reports\n\n2. Automated Prompt Engineering System\n   - Create prompt optimization system\n   - Implement A/B testing\n   - Deploy monitoring dashboard\n\n## Assessment\n- Architecture analysis paper\n- Benchmark implementation\n- System optimization project\n- Final evaluation\n\n## Resources\n- Research Papers\n- Implementation Guides\n- Best Practices\n- Case Studies',
  'published'
),
-- Module 2: Retrieval-Augmented Generation
(
  (SELECT id FROM course_id),
  'Advanced RAG Systems',
  'Deep dive into cutting-edge RAG techniques and implementations.',
  2,
  E'# Advanced RAG Systems\n\n## Learning Objectives\n- Master HyDE and GraphRAG implementations\n- Build production-ready RAG systems\n- Implement hallucination mitigation\n- Optimize retrieval performance\n\n## Key Topics\n\n### 1. Advanced RAG Architectures\n- HyDE implementation\n- GraphRAG systems\n- RAGAS evaluation\n- Multi-vector retrieval\n\n### 2. Vector Databases\n- FAISS optimization\n- ColBERT implementation\n- OpenAI embeddings\n- Hybrid search strategies\n\n### 3. Production Deployment\n- Scaling considerations\n- Performance optimization\n- Cost management\n- Monitoring systems\n\n## Hands-on Projects\n1. Enterprise RAG System\n   - Build scalable RAG pipeline\n   - Implement multiple retrieval strategies\n   - Deploy monitoring system\n\n2. Knowledge Graph Integration\n   - Create hybrid search system\n   - Implement entity linking\n   - Build visualization dashboard\n\n## Assessment\n- System design document\n- Implementation project\n- Performance optimization\n- Final deployment\n\n## Resources\n- Vector DB Documentation\n- Research Papers\n- Case Studies\n- Best Practices',
  'published'
),
-- Module 3: AI Agents & Code Generation
(
  (SELECT id FROM course_id),
  'AI Agents & Code Generation',
  'Learn to build and deploy sophisticated AI agents and code generation systems.',
  3,
  E'# AI Agents & Code Generation\n\n## Learning Objectives\n- Build advanced AI agents using ReAct and MemGPT\n- Implement curriculum learning with Voyager\n- Master code generation with DeepSeek-Coder\n- Optimize using HumanEval and LiveCodeBench\n\n## Key Topics\n\n### 1. Agent Frameworks\n- ReAct implementation\n- MemGPT for long-term memory\n- Voyager curriculum learning\n- Agent coordination systems\n\n### 2. Code Generation\n- DeepSeek-Coder optimization\n- CodeLlama implementation\n- Test generation\n- Code review automation\n\n### 3. Production Systems\n- Deployment strategies\n- Performance monitoring\n- Security considerations\n- Cost optimization\n\n## Hands-on Projects\n1. Autonomous Agent System\n   - Build multi-agent system\n   - Implement memory management\n   - Deploy monitoring dashboard\n\n2. Code Generation Pipeline\n   - Create code generation system\n   - Implement testing framework\n   - Build review automation\n\n## Assessment\n- Agent implementation\n- Code generation project\n- System optimization\n- Final deployment\n\n## Resources\n- Framework Documentation\n- Research Papers\n- Case Studies\n- Best Practices',
  'published'
),
-- Module 4: Vision & Multimodal AI
(
  (SELECT id FROM course_id),
  'Vision & Multimodal AI',
  'Master the implementation of vision and multimodal AI systems.',
  4,
  E'# Vision & Multimodal AI\n\n## Learning Objectives\n- Implement CLIP and SAM architectures\n- Build early fusion systems with Flamingo\n- Deploy production vision systems\n- Create synthetic media applications\n\n## Key Topics\n\n### 1. Vision Models\n- CLIP implementation\n- SAM architecture\n- Early fusion techniques\n- Performance optimization\n\n### 2. Multimodal Systems\n- Flamingo architecture\n- Cross-modal attention\n- Feature fusion\n- Modal alignment\n\n### 3. Production Applications\n- Industrial vision systems\n- Synthetic media generation\n- Quality control\n- Performance monitoring\n\n## Hands-on Projects\n1. Vision System\n   - Build industrial inspection system\n   - Implement real-time processing\n   - Deploy monitoring dashboard\n\n2. Multimodal Application\n   - Create content generation system\n   - Implement quality control\n   - Build user interface\n\n## Assessment\n- Vision system implementation\n- Multimodal project\n- Performance optimization\n- Final deployment\n\n## Resources\n- Model Documentation\n- Research Papers\n- Case Studies\n- Best Practices',
  'published'
);