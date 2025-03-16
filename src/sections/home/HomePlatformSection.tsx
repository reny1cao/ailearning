import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, BarChart } from "lucide-react";
import { SECTION_WIDTHS } from "../../constants/layout";

/**
 * The platform section of the home page
 */
const HomePlatformSection: React.FC = () => {
  return (
    <section
      className={`h-[85vh] hidden md:flex items-center p-12 ${SECTION_WIDTHS.platform} bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-3xl mx-4 shrink-0 shadow-2xl shadow-indigo-500/20 relative overflow-hidden`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute left-[10%] top-[20%] w-20 h-20 rounded-full bg-indigo-500/20 blur-xl"></div>
          <div className="absolute right-[15%] top-[30%] w-32 h-32 rounded-full bg-purple-500/20 blur-xl"></div>
          <div className="absolute left-[5%] bottom-[20%] w-24 h-24 rounded-full bg-blue-500/20 blur-xl"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-white max-w-md">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm mb-8">
          <Sparkles className="w-4 h-4 text-indigo-200" />
          <span className="text-xs font-medium text-indigo-100">
            Innovative Learning
          </span>
        </div>

        <h2 className="text-[3.5rem] font-bold mb-6 tracking-tight">
          <span className="text-indigo-200">Our</span> Platform
        </h2>

        <p className="text-lg text-white/90 leading-relaxed mb-10 font-light">
          Experience a new way of learning AI. Our platform adapts to your pace,
          providing interactive explanations and real-time assistance through
          our advanced AI teaching system.
        </p>

        <div className="space-y-6 mb-10">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Zap className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h3 className="text-white text-lg font-medium mb-1">
                Real-time Feedback
              </h3>
              <p className="text-indigo-100/90 text-sm">
                Get instant guidance as you write code and build AI applications
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <BarChart className="w-5 h-5 text-indigo-200" />
            </div>
            <div>
              <h3 className="text-white text-lg font-medium mb-1">
                Progress Tracking
              </h3>
              <p className="text-indigo-100/90 text-sm">
                Visualize your learning journey with detailed analytics
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/courses"
          className="inline-flex items-center text-lg font-medium text-white hover:text-indigo-200 transition-colors group"
        >
          <span className="relative">
            Explore courses
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-indigo-300/50 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </span>
          <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1 duration-300" />
        </Link>
      </div>
    </section>
  );
};

export default HomePlatformSection;
