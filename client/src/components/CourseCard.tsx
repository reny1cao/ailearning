import React from "react";
import { Link } from "react-router-dom";
import {
  Book,
  Star,
  Clock,
  Users,
  Calendar,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Code,
} from "lucide-react";
import { Course } from "../types/database";

// Types for difficulty settings
type Difficulty = "beginner" | "intermediate" | "advanced";

// Extended Course type to include the dynamic fields from Supabase query
interface ExtendedCourse extends Course {
  modules?: { count: number }[];
  course_purchases?: { count: number }[];
}

// Enhanced styling for difficulty indicators
const difficultyConfig = {
  beginner: {
    color: "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200",
    icon: "🌱",
    label: "Beginner"
  },
  intermediate: {
    color: "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 border border-yellow-200",
    icon: "🚀",
    label: "Intermediate"
  },
  advanced: {
    color: "bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200",
    icon: "⭐",
    label: "Advanced"
  },
};

interface CourseCardProps {
  course: ExtendedCourse | Course;
  isEnrolled?: boolean;
  enrollmentCount?: number;
  animationDelay?: number;
}

/**
 * A reusable card component for displaying course information
 */
const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isEnrolled = false,
  enrollmentCount = 0,
  animationDelay = 0,
}) => {
  const difficulty = course.difficulty as Difficulty;

  // Use the enrollmentCount prop if provided, otherwise try to get it from the course
  const finalEnrollmentCount =
    enrollmentCount ||
    (course as ExtendedCourse).course_purchases?.[0]?.count ||
    0;

  // Get module count from the course if available
  const moduleCount = (course as ExtendedCourse).modules?.[0]?.count || 0;

  return (
    <div
      className="bg-white rounded-xl shadow-md border border-gray-100 flex flex-col h-full overflow-hidden group transition-all duration-300 hover:shadow-lg hover:border-indigo-100 hover:translate-y-[-2px]"
      style={{
        animationDelay: `${animationDelay}ms`,
        opacity: 0,
        animation: `fadeIn 0.5s ease-out ${animationDelay}ms forwards`,
      }}
    >
      {/* Course Image/Banner */}
      <div className="aspect-video bg-gradient-to-br from-indigo-50 to-indigo-100 relative overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 via-indigo-100 to-white group-hover:from-indigo-100 group-hover:to-indigo-50 transition-all duration-300">
            <Code className="w-12 h-12 text-indigo-300 group-hover:text-indigo-400 transition-colors duration-300" />
          </div>
        )}

        {/* Course Status Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Premium badge */}
        {course.is_premium && (
          <div className="absolute top-2 right-2 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-full text-xs font-medium flex items-center shadow-sm">
            <Sparkles className="w-3 h-3 mr-1" />
            Premium
          </div>
        )}

        {/* Enrolled badge */}
        {isEnrolled && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-xs font-medium flex items-center shadow-sm">
            <CheckCircle className="w-3 h-3 mr-1" />
            Enrolled
          </div>
        )}
      </div>

      {/* Course Content with gradient transition from image */}
      <div className="p-5 flex-1 flex flex-col bg-white">
        {/* Difficulty and Category */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyConfig[difficulty].color} transition-all duration-300 group-hover:shadow-sm`}
          >
            {difficultyConfig[difficulty].icon}
            <span className="ml-1">
              {difficultyConfig[difficulty].label}
            </span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 border border-indigo-200 transition-all duration-300 group-hover:shadow-sm group-hover:from-indigo-100 group-hover:to-indigo-200">
            {course.category}
          </span>
        </div>

        {/* Title with improved truncation */}
        <div className="mb-4 overflow-hidden">
          <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-700 transition-colors duration-300 line-clamp-2">
            {course.title}
          </h3>
        </div>

        {/* Description with fade effect */}
        <div className="mb-4 flex-1 min-h-[40px] overflow-hidden relative">
          <p className="text-xs text-gray-600 line-clamp-3 group-hover:text-gray-700 transition-colors duration-300">
            {course.description}
          </p>
          <div className="absolute bottom-0 right-0 left-0 h-6 bg-gradient-to-t from-white to-transparent"></div>
        </div>

        {/* Course Meta */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-xs text-gray-500">
          <div className="flex items-center group-hover:text-indigo-600 transition-colors duration-300">
            <Clock className="w-3 h-3 mr-2 text-indigo-500 group-hover:text-indigo-600 transition-colors duration-300" />
            {course.duration_weeks} weeks
          </div>
          <div className="flex items-center group-hover:text-indigo-600 transition-colors duration-300">
            <Users className="w-3 h-3 mr-2 text-indigo-500 group-hover:text-indigo-600 transition-colors duration-300" />
            {finalEnrollmentCount} enrolled
          </div>
          <div className="flex items-center group-hover:text-indigo-600 transition-colors duration-300">
            <Book className="w-3 h-3 mr-2 text-indigo-500 group-hover:text-indigo-600 transition-colors duration-300" />
            {moduleCount} modules
          </div>
          <div className="flex items-center group-hover:text-indigo-600 transition-colors duration-300">
            <Calendar className="w-3 h-3 mr-2 text-indigo-500 group-hover:text-indigo-600 transition-colors duration-300" />
            Updated recently
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/courses/${course.id}`}
          className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-medium transition-all duration-300 hover:from-indigo-700 hover:to-indigo-800 hover:shadow-md group-hover:shadow-indigo-100"
        >
          <span className="transition-transform duration-300 group-hover:translate-x-[-4px]">
            {isEnrolled ? "Continue Learning" : "View Course"}
          </span>
          <ArrowRight className="w-3 h-3 ml-2 transition-all duration-300 group-hover:translate-x-1 group-hover:ml-3" />
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
