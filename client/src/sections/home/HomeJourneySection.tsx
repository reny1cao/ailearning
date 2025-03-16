import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Map, CheckCircle, Lightbulb } from "lucide-react";
import { SECTION_WIDTHS } from "../../constants/layout";

/**
 * The learning journey section of the home page
 */
const HomeJourneySection: React.FC = () => {
  const journeySteps = [
    { number: "01", title: "Fundamentals", description: "Learn the core concepts of AI development" },
    { number: "02", title: "Practice", description: "Apply your knowledge with guided projects" },
    { number: "03", title: "Master", description: "Build advanced AI applications independently" },
  ];

  return (
    <section
      className={`h-[85vh] hidden md:flex flex-col justify-center p-12 ${SECTION_WIDTHS.journey} bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-3xl mx-4 shrink-0 shadow-2xl shadow-gray-900/30 relative overflow-hidden`}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full">
          <svg className="absolute right-0 top-0 h-[30rem] w-[30rem] -translate-y-1/3 translate-x-1/3 transform fill-purple-700/10" viewBox="0 0 600 600">
            <g>
              <path d="M300,510c-108.4,0-196.5-88.1-196.5-196.5S191.6,117,300,117s196.5,88.1,196.5,196.5S408.4,510,300,510z M300,132.6c-99.8,0-180.9,81.1-180.9,180.9S200.2,494.4,300,494.4S480.9,413.3,480.9,313.5S399.8,132.6,300,132.6z"/>
              <path d="M418.3,485c-7.1,0-14.3-2.7-19.8-8.2c-10.9-10.9-10.9-28.7,0-39.6c10.9-10.9,28.7-10.9,39.6,0c10.9,10.9,10.9,28.7,0,39.6C432.6,482.3,425.5,485,418.3,485z"/>
              <path d="M141.3,145c-7.1,0-14.3-2.7-19.8-8.2c-10.9-10.9-10.9-28.7,0-39.6c10.9-10.9,28.7-10.9,39.6,0c10.9,10.9,10.9,28.7,0,39.6C155.6,142.3,148.5,145,141.3,145z"/>
            </g>
          </svg>
        </div>

        {/* Journey path line */}
        <div className="absolute left-[20%] top-[30%] h-[40%] w-0.5 bg-gradient-to-b from-blue-500/30 to-purple-500/30"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-white">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-lg mb-8">
          <Map className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-medium text-blue-300">Your Learning Path</span>
        </div>
        
        <h2 className="text-[3.5rem] font-bold mb-8 tracking-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Your</span> Journey
        </h2>
        
        <div className="space-y-8 mb-10 max-w-md">
          <p className="text-lg text-gray-300 leading-relaxed font-light">
            Follow your personalized learning path with an adaptive curriculum
            that ensures mastery of each concept before moving forward.
          </p>
          
          <div className="space-y-4">
            {journeySteps.map((step, index) => (
              <div key={index} className="flex items-center gap-5 group">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-sm font-medium text-blue-300 group-hover:bg-blue-500/20 transition-colors duration-300">
                  {step.number}
                </div>
                <div className="p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 flex-1 group-hover:bg-white/10 transition-colors duration-300">
                  <h3 className="text-white text-lg font-medium mb-1">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <Link
          to="/roadmap"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-blue-900/30"
        >
          Start learning
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    </section>
  );
};

export default HomeJourneySection;
