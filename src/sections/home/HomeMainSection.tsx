import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Brain, BookOpen, Code, Users, Star } from "lucide-react";
import { SECTION_WIDTHS } from "../../constants/layout";

/**
 * The main hero section of the home page
 */
const HomeMainSection: React.FC = () => {
  return (
    <section
      className={`h-[85vh] ${SECTION_WIDTHS.main} bg-white rounded-3xl mx-2 md:mx-4 border border-gray-100 shrink-0 shadow-2xl shadow-indigo-200/30 relative overflow-hidden`}
    >
      {/* Background subtle pattern */}
      <div className="absolute inset-0 bg-grid-indigo-100/40 opacity-30"></div>

      {/* Gradient blob */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-indigo-50 to-blue-100 rounded-full blur-3xl opacity-60"></div>

      <div className="relative h-full w-full flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[720px] grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-12">
          {/* Left Column */}
          <div className="space-y-10">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-2xl border border-indigo-100 shadow-sm">
                <Brain className="w-5 h-5 text-indigo-600" />
                <p className="text-sm font-medium text-indigo-700">
                  AI Learning Platform
                </p>
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-5">
                  Master AI <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 relative">
                    Development
                    <svg
                      className="absolute -bottom-3 left-0 w-full opacity-70"
                      viewBox="0 0 300 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 5.5C72 0.5 143 0.5 299 10.5"
                        stroke="url(#paint0_linear)"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient
                          id="paint0_linear"
                          x1="1"
                          y1="5.5"
                          x2="299"
                          y2="5.5"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#6366F1" />
                          <stop offset="1" stopColor="#A855F7" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-md">
                  Experience the future of AI education with personalized
                  learning paths and real-time AI assistance.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 shadow-sm">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span className="text-gray-700 font-medium">
                    10K+ Students
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 shadow-sm">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <span className="text-gray-700 font-medium">50+ Courses</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 shadow-sm">
                  <Star className="w-5 h-5 text-indigo-600" />
                  <span className="text-gray-700 font-medium">
                    4.9/5 Rating
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  to="/courses"
                  className="inline-flex items-center px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg shadow-indigo-200 transform hover:-translate-y-0.5"
                >
                  <span className="text-base font-medium">Start Learning</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link
                  to="/features"
                  className="inline-flex items-center px-6 py-3.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 text-gray-700 hover:border-indigo-200 transform hover:-translate-y-0.5"
                >
                  <span className="text-base font-medium">View Features</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl border border-indigo-100 shadow-md transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Code className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                      Interactive Learning
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Practice with real-world AI projects and get instant
                      feedback on your progress.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-100 shadow-md transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                      AI-Powered Guidance
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Get personalized learning recommendations and support
                      tailored to your learning style.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl text-white shadow-xl overflow-hidden relative group">
              {/* Animated gradient accent */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

              <h3 className="font-semibold mb-3 text-xl relative">
                Ready to Start?
              </h3>
              <p className="text-gray-300 leading-relaxed mb-4 relative">
                Join thousands of learners mastering AI development with our
                comprehensive curriculum.
              </p>
              <Link
                to="/courses"
                className="inline-flex items-center text-sm font-medium text-white relative hover:text-indigo-200 transition-colors group"
              >
                Browse Courses
                <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeMainSection;
