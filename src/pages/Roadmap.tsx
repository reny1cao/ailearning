import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Course } from '../types/database';
import {
  BookOpen,
  Star,
  Award,
  ChevronRight,
  Play,
  CheckCircle,
  ArrowRight,
  Brain,
  Database,
  Code,
  Network,
  Settings,
  Shield,
  Zap,
  Clock
} from 'lucide-react';

interface CourseModule {
  title: string;
  concepts: string[];
  duration: string;
  skills: string[];
  assessment: string;
  project?: string;
}

interface LearningPath {
  id: string;
  title: string;
  overview: string;
  objectives: string[];
  prerequisites: string[];
  modules: CourseModule[];
  certification: string;
  duration: string;
}

const learningPaths: LearningPath[] = [
  {
    id: 'llm-foundations',
    title: 'LLM Engineering Foundations',
    overview: 'Master the fundamentals of LLM engineering, from basic concepts to practical implementations. This course provides a solid foundation for building AI-powered applications.',
    objectives: [
      'Understand core LLM concepts and architectures',
      'Implement effective prompt engineering techniques',
      'Build basic RAG systems',
      'Deploy LLM applications responsibly'
    ],
    prerequisites: [
      'Basic Python programming knowledge',
      'Understanding of REST APIs',
      'Familiarity with web development concepts'
    ],
    modules: [
      {
        title: '1. Introduction to Large Language Models',
        concepts: [
          'LLM architecture fundamentals',
          'Token-based processing',
          'Model capabilities and limitations',
          'Types of language models'
        ],
        duration: '2 weeks',
        skills: [
          'LLM concept mastery',
          'Model selection',
          'Basic implementation'
        ],
        assessment: 'Quiz on LLM fundamentals and architecture',
        project: 'Build a simple chatbot using OpenAI API'
      },
      {
        title: '2. Prompt Engineering Essentials',
        concepts: [
          'Prompt structure and components',
          'Few-shot learning techniques',
          'Context window management',
          'Prompt templates and patterns'
        ],
        duration: '2 weeks',
        skills: [
          'Effective prompt design',
          'Context optimization',
          'Response formatting'
        ],
        assessment: 'Practical prompt engineering challenges',
        project: 'Create a specialized prompt template library'
      },
      {
        title: '3. RAG Systems Foundation',
        concepts: [
          'Vector databases basics',
          'Embedding generation',
          'Retrieval strategies',
          'Knowledge integration'
        ],
        duration: '3 weeks',
        skills: [
          'Vector DB implementation',
          'Embedding management',
          'Query optimization'
        ],
        assessment: 'RAG system implementation test',
        project: 'Build a document Q&A system'
      }
    ],
    certification: 'LLM Engineering Foundation Certificate',
    duration: '7 weeks'
  },
  {
    id: 'llm-advanced',
    title: 'Advanced LLM Engineering',
    overview: 'Take your LLM engineering skills to the next level with advanced concepts, optimization techniques, and enterprise-grade implementations.',
    objectives: [
      'Design scalable LLM architectures',
      'Implement advanced RAG patterns',
      'Optimize for performance and cost',
      'Handle enterprise security requirements'
    ],
    prerequisites: [
      'Completion of LLM Engineering Foundations',
      'Experience with production deployments',
      'Understanding of distributed systems'
    ],
    modules: [
      {
        title: '1. Advanced RAG Architectures',
        concepts: [
          'Multi-vector retrieval',
          'Hybrid search strategies',
          'Dynamic knowledge updates',
          'Cross-encoder reranking'
        ],
        duration: '3 weeks',
        skills: [
          'Advanced retrieval design',
          'System optimization',
          'Performance tuning'
        ],
        assessment: 'Advanced RAG implementation project',
        project: 'Build a multi-source knowledge system'
      },
      {
        title: '2. Enterprise LLM Systems',
        concepts: [
          'Scalable architectures',
          'Security best practices',
          'Cost optimization',
          'Monitoring and observability'
        ],
        duration: '3 weeks',
        skills: [
          'Enterprise architecture',
          'Security implementation',
          'System monitoring'
        ],
        assessment: 'System design evaluation',
        project: 'Design and implement a secure LLM platform'
      },
      {
        title: '3. LLM Fine-tuning & Optimization',
        concepts: [
          'Model adaptation techniques',
          'PEFT methods',
          'Quantization strategies',
          'Performance benchmarking'
        ],
        duration: '2 weeks',
        skills: [
          'Model optimization',
          'Fine-tuning implementation',
          'Performance analysis'
        ],
        assessment: 'Model optimization project',
        project: 'Fine-tune a model for specific use case'
      }
    ],
    certification: 'Advanced LLM Engineering Certificate',
    duration: '8 weeks'
  }
];

const Roadmap = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Structured Learning Path to LLM Mastery
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Follow our carefully designed learning path to master LLM engineering. Each course builds upon the previous one, ensuring a solid foundation for your AI career.
        </p>
      </div>

      {/* Learning Paths */}
      <div className="space-y-16">
        {learningPaths.map((path) => (
          <div key={path.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Path Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">{path.title}</h2>
              <p className="text-lg text-indigo-100 mb-6">{path.overview}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {path.duration}
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 mr-1" />
                  {path.certification}
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Learning Objectives */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Learning Objectives
                </h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  {path.objectives.map((objective, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-800">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prerequisites */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Prerequisites
                </h3>
                <ul className="space-y-2">
                  {path.prerequisites.map((prerequisite, i) => (
                    <li key={i} className="flex items-center text-gray-700">
                      <ArrowRight className="w-4 h-4 text-indigo-500 mr-2" />
                      {prerequisite}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Modules */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Course Modules
                </h3>
                <div className="space-y-8">
                  {path.modules.map((module, index) => (
                    <div key={index} className="border rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">
                        {module.title}
                      </h4>
                      
                      {/* Key Concepts */}
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          Key Concepts
                        </h5>
                        <ul className="grid md:grid-cols-2 gap-2">
                          {module.concepts.map((concept, i) => (
                            <li key={i} className="flex items-center text-gray-600">
                              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2" />
                              {concept}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Skills & Assessment */}
                      <div className="grid md:grid-cols-2 gap-6 mt-4 pt-4 border-t">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            Skills Gained
                          </h5>
                          <ul className="space-y-1">
                            {module.skills.map((skill, i) => (
                              <li key={i} className="flex items-center text-gray-600">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                {skill}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            Assessment & Project
                          </h5>
                          <div className="space-y-2 text-gray-600">
                            <p className="flex items-start">
                              <Brain className="w-4 h-4 text-indigo-500 mr-2 mt-1" />
                              {module.assessment}
                            </p>
                            {module.project && (
                              <p className="flex items-start">
                                <Code className="w-4 h-4 text-indigo-500 mr-2 mt-1" />
                                {module.project}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Estimated duration: {module.duration}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 flex justify-end">
                <Link
                  to="/courses"
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  Start Learning
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Final CTA */}
      <div className="mt-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to Start Your LLM Engineering Journey?
        </h2>
        <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
          Begin with our foundation course and progress to advanced topics at your own pace. Get hands-on experience with real-world projects and expert guidance.
        </p>
        <Link
          to="/courses"
          className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition font-semibold"
        >
          Explore Courses
          <ChevronRight className="w-5 h-5 ml-2" />
        </Link>
      </div>
    </div>
  );
};

export default Roadmap;