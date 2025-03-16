import React, { useEffect, useState } from "react";

// Import section components using barrel import
import {
  HomeMainSection,
  HomePlatformSection,
  HomeFeaturesSection,
  HomeJourneySection,
} from "../sections/home";

/**
 * Home page component
 * Uses composition of section components for better organization and maintainability
 */
const Home: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Add a small delay before showing content for a smooth entrance
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative">
      {/* Background subtle pattern */}
      <div className="absolute inset-0 bg-grid-slate-200 opacity-30"></div>

      {/* Main content with fade-in animation */}
      <div
        className={`h-full overflow-x-auto scrollbar-hide transition-opacity duration-1000 ease-in-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex h-full items-center pt-16 pb-8 px-4 md:px-8">
          <HomeMainSection />
          <HomePlatformSection />
          <HomeFeaturesSection />
          <HomeJourneySection />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hidden md:flex absolute bottom-6 left-1/2 transform -translate-x-1/2 text-gray-400 items-center gap-2 text-sm animate-pulse">
        <span>Scroll to explore</span>
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </div>
  );
};

export default Home;
