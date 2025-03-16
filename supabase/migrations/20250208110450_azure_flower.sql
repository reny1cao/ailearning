/*
  # AI Engineering Curriculum Update

  1. Changes
    - Clear existing course data
    - Add comprehensive AI Engineering course
    - Add detailed modules with structured content
    
  2. Course Structure
    - Single comprehensive course
    - Five modules with clear progression
    - Hands-on projects and assessments
*/

-- First, clear existing courses (this will cascade to modules due to foreign key)
DELETE FROM courses;

-- Insert the main AI Engineering course
INSERT INTO courses (
  id,
  title,
  description,
  category,
  difficulty,
  price,
  is_premium,
  duration_weeks,
  visibility
) VALUES (
  gen_random_uuid(),
  'Comprehensive AI Engineering',
  'A complete journey from programming basics to advanced AI engineering. Master practical AI development skills through hands-on projects and real-world applications. This course provides a structured path to becoming a professional AI engineer.',
  'AI Engineering',
  'beginner',
  299.99,
  true,
  24,
  'public'
);

-- Insert detailed modules
WITH course_id AS (SELECT id FROM courses WHERE title = 'Comprehensive AI Engineering' LIMIT 1)
INSERT INTO modules (
  course_id,
  title,
  description,
  order_number,
  content
) VALUES
-- Foundation Module
(
  (SELECT id FROM course_id),
  'AI Engineering Foundations',
  'Build a solid foundation in AI concepts, Python programming, and essential tools for AI development.',
  1,
  E'# AI Engineering Foundations\n\n## Learning Objectives\n- Master Python programming for AI development\n- Understand fundamental AI/ML concepts\n- Set up a professional AI development environment\n- Learn data handling and preprocessing techniques\n\n## Technical Requirements\n- Computer with minimum 8GB RAM\n- Python 3.8 or higher\n- VS Code or PyCharm IDE\n\n## Topics Covered\n\n### 1. Python for AI Development\n- Advanced Python concepts\n- NumPy and Pandas fundamentals\n- Data structures and algorithms\n- Code optimization techniques\n\n### 2. Development Environment Setup\n- Virtual environments\n- Package management\n- Version control with Git\n- IDE configuration\n\n### 3. Data Fundamentals\n- Data types and structures\n- Data cleaning and preprocessing\n- Feature engineering basics\n- Data visualization\n\n## Projects\n1. Data Analysis Pipeline\n   - Build an end-to-end data processing pipeline\n   - Implement data cleaning and transformation\n   - Create insightful visualizations\n\n2. Algorithm Implementation\n   - Implement common ML algorithms from scratch\n   - Optimize code performance\n   - Write professional documentation\n\n## Assessment\n- Weekly coding assignments\n- Data processing project\n- Algorithm implementation project\n- Final module exam\n\n## Resources\n- Python Documentation\n- NumPy and Pandas Guides\n- Git Tutorial\n- Recommended Books and Articles'
),
-- Machine Learning Fundamentals
(
  (SELECT id FROM course_id),
  'Machine Learning Fundamentals',
  'Master core machine learning concepts, algorithms, and their practical implementation.',
  2,
  E'# Machine Learning Fundamentals\n\n## Learning Objectives\n- Understand key ML algorithms and their applications\n- Implement ML models from scratch\n- Master scikit-learn for practical ML\n- Learn model evaluation and validation techniques\n\n## Prerequisites\n- Python programming proficiency\n- Basic linear algebra and statistics\n- Data preprocessing skills\n\n## Topics Covered\n\n### 1. Supervised Learning\n- Linear and logistic regression\n- Decision trees and random forests\n- Support vector machines\n- Neural networks basics\n\n### 2. Unsupervised Learning\n- Clustering algorithms\n- Dimensionality reduction\n- Anomaly detection\n- Association rules\n\n### 3. Model Evaluation\n- Cross-validation techniques\n- Performance metrics\n- Bias-variance tradeoff\n- Model selection\n\n## Projects\n1. Customer Segmentation System\n   - Implement clustering algorithms\n   - Evaluate different approaches\n   - Create interactive visualizations\n\n2. Predictive Analytics Tool\n   - Build a complete ML pipeline\n   - Implement model selection\n   - Deploy the solution\n\n## Assessment\n- Algorithm implementation assignments\n- Project milestones\n- Peer reviews\n- Final project presentation\n\n## Resources\n- scikit-learn Documentation\n- ML Research Papers\n- Industry Case Studies'
),
-- Deep Learning and Neural Networks
(
  (SELECT id FROM course_id),
  'Deep Learning and Neural Networks',
  'Comprehensive coverage of deep learning concepts, architectures, and practical applications.',
  3,
  E'# Deep Learning and Neural Networks\n\n## Learning Objectives\n- Master deep learning frameworks\n- Implement various neural network architectures\n- Understand optimization techniques\n- Deploy deep learning models\n\n## Prerequisites\n- ML fundamentals\n- Python programming\n- Basic calculus and linear algebra\n\n## Topics Covered\n\n### 1. Neural Network Fundamentals\n- Backpropagation\n- Activation functions\n- Loss functions\n- Optimization algorithms\n\n### 2. Advanced Architectures\n- Convolutional Neural Networks\n- Recurrent Neural Networks\n- Transformers\n- GANs\n\n### 3. Model Optimization\n- Hyperparameter tuning\n- Regularization techniques\n- Transfer learning\n- Model compression\n\n## Projects\n1. Computer Vision Application\n   - Implement CNN architecture\n   - Train on custom dataset\n   - Deploy as web service\n\n2. NLP System\n   - Build transformer-based model\n   - Fine-tune pretrained models\n   - Create API endpoint\n\n## Assessment\n- Weekly programming assignments\n- Architecture implementation\n- Model optimization challenge\n- Final project\n\n## Resources\n- PyTorch Documentation\n- Research Papers\n- Deep Learning Book\n- Online Tutorials'
),
-- Large Language Models
(
  (SELECT id FROM course_id),
  'Large Language Models and Applications',
  'Master the implementation and deployment of Large Language Models in practical applications.',
  4,
  E'# Large Language Models and Applications\n\n## Learning Objectives\n- Understand LLM architectures and capabilities\n- Master prompt engineering\n- Implement RAG systems\n- Deploy and scale LLM applications\n\n## Prerequisites\n- Deep learning fundamentals\n- Python programming\n- Basic NLP concepts\n\n## Topics Covered\n\n### 1. LLM Fundamentals\n- Architecture overview\n- Training and fine-tuning\n- Prompt engineering\n- Model evaluation\n\n### 2. RAG Systems\n- Vector databases\n- Embedding models\n- Retrieval strategies\n- Knowledge integration\n\n### 3. Production Deployment\n- Model serving\n- Performance optimization\n- Monitoring and logging\n- Cost management\n\n## Projects\n1. Custom ChatBot\n   - Implement RAG system\n   - Design prompt templates\n   - Deploy production service\n\n2. Document Analysis System\n   - Build document processor\n   - Implement semantic search\n   - Create web interface\n\n## Assessment\n- Implementation exercises\n- System design projects\n- Performance optimization\n- Final deployment\n\n## Resources\n- LangChain Documentation\n- Hugging Face Guides\n- Research Papers\n- Case Studies'
),
-- Production AI Systems
(
  (SELECT id FROM course_id),
  'Production AI Systems',
  'Learn to design, deploy, and maintain AI systems in production environments.',
  5,
  E'# Production AI Systems\n\n## Learning Objectives\n- Design scalable AI architectures\n- Implement MLOps practices\n- Monitor and maintain AI systems\n- Optimize system performance\n\n## Prerequisites\n- ML/DL implementation experience\n- Python programming\n- Basic DevOps knowledge\n\n## Topics Covered\n\n### 1. System Architecture\n- Microservices design\n- API development\n- Scalability patterns\n- Security best practices\n\n### 2. MLOps\n- CI/CD for ML\n- Model versioning\n- Experiment tracking\n- Automated testing\n\n### 3. Monitoring and Maintenance\n- Performance monitoring\n- Error handling\n- System updates\n- Cost optimization\n\n## Projects\n1. End-to-End ML System\n   - Design system architecture\n   - Implement MLOps pipeline\n   - Deploy to cloud\n\n2. Monitoring Dashboard\n   - Build monitoring system\n   - Implement alerts\n   - Create admin interface\n\n## Assessment\n- Architecture design\n- Implementation projects\n- System optimization\n- Final deployment\n\n## Resources\n- MLOps Tools Documentation\n- Cloud Platform Guides\n- Best Practices\n- Case Studies'
);