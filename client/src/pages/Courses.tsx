import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import { Course } from "../types/database";
import {
  Book,
  Search,
  Gauge,
  GraduationCap,
  LayoutGrid,
  X,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Star,
  Users,
  Filter,
  ChevronDown,
  ChevronRight,
  PanelRight,
  Bookmark,
  ListFilter,
  Grid,
} from "lucide-react";
import { staggerDelay, fadeInUpVariants } from "../utils/animation";
import CourseCard from "../components/CourseCard";
import SectionHeader from "../components/ui/SectionHeader";
import EmptyState from "../components/ui/EmptyState";

// Extended Course type to include the dynamic fields from Supabase query
interface ExtendedCourse extends Course {
  modules?: { count: number }[];
  course_purchases?: { count: number }[];
}

const Courses = () => {
  const [courses, setCourses] = useState<ExtendedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPurchases, setUserPurchases] = useState<string[]>([]);
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [featuredCourse, setFeaturedCourse] = useState<ExtendedCourse | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"grid" | "scroll">("grid");

  useEffect(() => {
    fetchCourses();
    if (user) {
      fetchUserPurchases();
    }
  }, [user, selectedCategory, selectedDifficulty, searchQuery]);

  // Add animation on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Set featured course when courses are loaded
  useEffect(() => {
    if (courses.length > 0 && !featuredCourse) {
      // Find a premium course to feature, or use the first course
      const premium = courses.find((course) => course.is_premium);
      setFeaturedCourse(premium || courses[0]);
    }
  }, [courses, featuredCourse]);

  const fetchCourses = async () => {
    try {
      let query = supabase.from("courses").select(`
          *,
          modules (count),
          course_purchases (count)
        `);

      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }

      if (selectedDifficulty) {
        query = query.eq("difficulty", selectedDifficulty);
      }

      if (searchQuery) {
        query = query.ilike("title", `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCourses((data as ExtendedCourse[]) || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPurchases = async () => {
    try {
      const { data } = await supabase
        .from("course_purchases")
        .select("course_id")
        .eq("user_id", user.id)
        .eq("payment_status", "completed");

      setUserPurchases(data?.map((p) => p.course_id) || []);
    } catch (error) {
      console.error("Error fetching user purchases:", error);
    }
  };

  // Function to clear all filters
  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedDifficulty(null);
    setSearchQuery("");
  };

  // Prepare filter options for categories
  const categories = Array.from(
    new Set(courses.map((course) => course.category))
  );

  // Prepare difficulty options
  const difficulties = ["beginner", "intermediate", "advanced"];

  // Check if any filters are active
  const hasActiveFilters =
    selectedCategory || selectedDifficulty || searchQuery;

  // Check if featured course is enrolled
  const isFeaturedCourseEnrolled = featuredCourse
    ? userPurchases.includes(featuredCourse.id)
    : false;

  // Get enrollment count for featured course
  const featuredCourseEnrollmentCount =
    featuredCourse?.course_purchases?.[0]?.count || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-[3px] border-indigo-100"></div>
            <div className="absolute inset-0 rounded-full border-t-[3px] border-indigo-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
              <Book className="w-7 h-7" />
            </div>
          </div>
          <p className="text-gray-600 mt-3 font-medium">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-auto pb-8">
      {/* Background subtle pattern */}
      <div className="absolute inset-0 bg-grid-slate-200 opacity-30"></div>

      {/* Main content with fade-in animation */}
      <div
        className={`transition-opacity duration-1000 ease-in-out ${
          isPageLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="w-full max-w-[1400px] mx-auto px-3 md:px-5 pt-20">
          {/* Main header and filters section */}
          <div className="mb-4">
            <div className="flex flex-wrap justify-between items-end gap-3 mb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg border border-indigo-100 mb-3">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <p className="text-xs font-medium text-indigo-700">
                    Browse Courses
                  </p>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Expand Your{" "}
                  <span className="text-indigo-600">AI Knowledge</span>
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${
                    viewMode === "grid"
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-white/70 text-gray-500 hover:bg-gray-100"
                  } transition-colors`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("scroll")}
                  className={`p-2 rounded-lg ${
                    viewMode === "scroll"
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-white/70 text-gray-500 hover:bg-gray-100"
                  } transition-colors`}
                >
                  <PanelRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search and Filters Row */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-grow max-w-md group">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white/90 backdrop-blur-sm shadow-sm hover:border-gray-300"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-2 text-sm bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg text-gray-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-200 flex items-center gap-2 shadow-sm"
              >
                <ListFilter className="w-4 h-4" />
                {showFilters ? "Hide filters" : "Filter"}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-all duration-200 flex items-center gap-2 border border-indigo-100 shadow-sm"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Filters */}
          <div
            className={`bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100 mb-4 transition-all duration-300 overflow-hidden ${
              showFilters
                ? "max-h-[500px] opacity-100 p-3"
                : "max-h-0 opacity-0 p-0 border-0"
            }`}
          >
            <div className="space-y-3">
              {/* Categories section */}
              <div>
                <h3 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider flex items-center">
                  <Bookmark className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                  Categories
                </h3>
                <div className="flex flex-wrap gap-1">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === category ? null : category
                        )
                      }
                      className={`px-2 py-0.5 text-xs rounded-full transition-all duration-200 ${
                        selectedCategory === category
                          ? "bg-indigo-500 text-white shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {category}
                      {selectedCategory === category && (
                        <X className="w-2.5 h-2.5 ml-1 inline-block" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulties section */}
              <div>
                <h3 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wider flex items-center">
                  <Gauge className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                  Difficulty
                </h3>
                <div className="flex flex-wrap gap-1">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() =>
                        setSelectedDifficulty(
                          selectedDifficulty === difficulty ? null : difficulty
                        )
                      }
                      className={`px-2 py-0.5 text-xs rounded-full transition-all duration-200 ${
                        selectedDifficulty === difficulty
                          ? "bg-indigo-500 text-white shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      {selectedDifficulty === difficulty && (
                        <X className="w-2.5 h-2.5 ml-1 inline-block" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Courses count */}
          {hasActiveFilters && (
            <div className="mb-4 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/50 shadow-sm">
              <p className="text-sm text-indigo-700 flex items-center">
                <Filter className="w-4 h-4 mr-2 text-indigo-500" />
                Showing{" "}
                <span className="font-medium mx-1">{courses.length}</span>{" "}
                {courses.length === 1 ? "course" : "courses"} matching your
                criteria
              </p>
            </div>
          )}

          {/* Course display */}
          {courses.length > 0 ? (
            <div
              className={`${
                viewMode === "scroll" ? "overflow-x-auto pb-2" : ""
              }`}
            >
              <div
                className={`
                ${
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "flex gap-4 pb-1 min-w-max"
                }
              `}
              >
                {courses.map((course, index) => {
                  const isEnrolled = userPurchases.includes(course.id);
                  const enrollmentCount =
                    course.course_purchases?.[0]?.count || 0;

                  return (
                    <div
                      className={
                        viewMode === "grid" ? "" : "w-[330px] flex-shrink-0"
                      }
                      key={course.id}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: `fadeIn 0.5s ease-out ${
                          index * 50
                        }ms forwards`,
                      }}
                    >
                      <CourseCard
                        course={course}
                        isEnrolled={isEnrolled}
                        enrollmentCount={enrollmentCount}
                        animationDelay={0}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
              <EmptyState
                icon={<Book className="w-10 h-10 text-gray-300" />}
                title="No courses found"
                description={
                  hasActiveFilters
                    ? "We couldn't find any courses matching your filters. Try adjusting your search criteria or clearing the filters."
                    : "Courses are coming soon! Check back later for new content."
                }
                actionText={hasActiveFilters ? "Clear filters" : undefined}
                onAction={hasActiveFilters ? clearFilters : undefined}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Courses;

// Add CSS animation
const fadeInAnimation = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

// Add this to the global CSS
const style = document.createElement("style");
style.innerHTML = fadeInAnimation;
document.head.appendChild(style);
