import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Course } from '../types/database';
import { 
  Book, 
  Star, 
  Clock, 
  ChevronRight,
  Users,
  Calendar,
  Filter,
  Search,
  Gauge,
  CheckCircle
} from 'lucide-react';

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

const difficultyIcons = {
  beginner: '🌱',
  intermediate: '🚀',
  advanced: '⭐',
};

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPurchases, setUserPurchases] = useState<string[]>([]);
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCourses();
    if (user) {
      fetchUserPurchases();
    }
  }, [user, selectedCategory, selectedDifficulty, searchQuery]);

  const fetchCourses = async () => {
    try {
      let query = supabase
        .from('courses')
        .select(`
          *,
          modules (count),
          course_purchases (count)
        `);
      
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      
      if (selectedDifficulty) {
        query = query.eq('difficulty', selectedDifficulty);
      }

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPurchases = async () => {
    try {
      const { data } = await supabase
        .from('course_purchases')
        .select('course_id')
        .eq('user_id', user.id)
        .eq('payment_status', 'completed');

      setUserPurchases(data?.map(p => p.course_id) || []);
    } catch (error) {
      console.error('Error fetching user purchases:', error);
    }
  };

  const categories = Array.from(new Set(courses.map(course => course.category)));
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Explore Our Courses
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          Master the latest LLM technologies with our expert-led courses. From beginner to advanced, find the perfect course for your skill level.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div className="relative">
            <Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedDifficulty || ''}
              onChange={(e) => setSelectedDifficulty(e.target.value || null)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Levels</option>
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const isEnrolled = userPurchases.includes(course.id);
          const enrollmentCount = course.course_purchases?.[0]?.count || 0;
          
          return (
            <div 
              key={course.id} 
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
            >
              {/* Course Image/Banner */}
              <div className="aspect-video bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-t-xl p-6 flex items-center justify-center relative overflow-hidden">
                {course.thumbnail_url ? (
                  <img 
                    src={course.thumbnail_url} 
                    alt={course.title}
                    className="w-full h-full object-cover absolute inset-0 rounded-t-xl"
                  />
                ) : (
                  <Book className="w-16 h-16 text-indigo-600" />
                )}
                {course.is_premium && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    Premium
                  </div>
                )}
                {isEnrolled && (
                  <div className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Enrolled
                  </div>
                )}
              </div>

              {/* Course Content */}
              <div className="p-6 flex-1 flex flex-col">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center
                    ${difficultyColors[course.difficulty as keyof typeof difficultyColors]}`}>
                    {difficultyIcons[course.difficulty as keyof typeof difficultyIcons]}
                    <span className="ml-1">
                      {course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
                    </span>
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                    {course.category}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-2 flex-1">
                  {course.description}
                </p>

                {/* Course Meta */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {course.duration_weeks} weeks
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    {enrollmentCount} enrolled
                  </div>
                  <div className="flex items-center">
                    <Book className="w-4 h-4 mr-2" />
                    {course.modules?.[0]?.count || 0} modules
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Updated recently
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  to={`/courses/${course.id}`}
                  className="w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  See Details
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {courses.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No courses found
          </h3>
          <p className="text-gray-600">
            Try adjusting your filters or search criteria
          </p>
        </div>
      )}
    </div>
  );
}

export default Courses;