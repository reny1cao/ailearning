import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Target, Code, Bot, BookOpen } from "lucide-react";
import { SECTION_WIDTHS } from "../../constants/layout";

/**
 * The features section of the home page
 */
const HomeFeaturesSection: React.FC = () => {
  return (
    <section
      className={`h-[85vh] hidden md:flex flex-col justify-center p-12 ${SECTION_WIDTHS.features} bg-gradient-to-br from-[#6D28D9] to-[#4C1D95] rounded-3xl mx-4 shrink-0 shadow-2xl shadow-purple-500/20 relative overflow-hidden`}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-400/10 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-indigo-400/10 blur-3xl"></div>
        <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full border border-purple-300/20"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full border border-indigo-300/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-white">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg mb-8">
            <Target className="w-4 h-4 text-purple-300" />
            <span className="text-xs font-medium text-purple-200">
              Powerful Capabilities
            </span>
          </div>

          <h2 className="text-[3.5rem] font-bold mb-8 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300">
              Key
            </span>{" "}
            Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/15 transition-colors duration-300">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white text-lg font-medium mb-2">
                    Interactive Code
                  </h3>
                  <p className="text-purple-200/90 text-sm leading-relaxed">
                    Write and execute code directly in your browser with instant
                    feedback
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/15 transition-colors duration-300">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-md">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white text-lg font-medium mb-2">
                    AI Assistant
                  </h3>
                  <p className="text-purple-200/90 text-sm leading-relaxed">
                    Get personalized help at any time from our intelligent
                    teaching assistant
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/15 transition-colors duration-300">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white text-lg font-medium mb-2">
                    Adaptive Content
                  </h3>
                  <p className="text-purple-200/90 text-sm leading-relaxed">
                    Learning materials that adjust to your progress and learning
                    style
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/15 transition-colors duration-300">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-md">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white text-lg font-medium mb-2">
                    Projects
                  </h3>
                  <p className="text-purple-200/90 text-sm leading-relaxed">
                    Real-world AI projects that reinforce your learning and
                    build your portfolio
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Link
            to="/features"
            className="inline-flex items-center text-lg font-medium text-white group"
          >
            <span className="relative">
              Learn more
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-purple-300 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </span>
            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1 duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeFeaturesSection;
