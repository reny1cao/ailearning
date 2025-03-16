import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Course, Module, UserProgress } from '../types/database';
import { Award, BookOpen, BarChart, Trophy, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface CourseProgress {
  course: Course;
  progress: number;
  modulesCompleted: number;
  totalModules: number;
  lastUpdated: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const { data: enrolledCourses, error: enrollmentError } = await supabase
        .from('course_purchases')
        .select(`
          course_id,
          course:courses (
            *,
            modules:modules (
              *,
              user_progress:user_progress (
                *
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('payment_status', 'completed');

      if (enrollmentError) throw enrollmentError;

      if (enrolledCourses) {
        const progress = enrolledCourses
          .filter(enrollment => enrollment.course) // Filter out any null courses
          .map(enrollment => {
            const course = enrollment.course;
            const modules = course.modules || [];
            const completedModules = modules.filter(module => 
              module.user_progress?.some(p => 
                p.user_id === user.id && p.completed
              )
            );

            // Find the most recent update
            const lastUpdate = modules
              .flatMap(m => m.user_progress || [])
              .filter(p => p?.user_id === user.id)
              .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

            return {
              course,
              progress: modules.length ? (completedModules.length / modules.length) * 100 : 0,
              modulesCompleted: completedModules.length,
              totalModules: modules.length,
              lastUpdated: lastUpdate?.updated_at || null
            };
          });

        setCourseProgress(progress);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const totalModulesCompleted = courseProgress.reduce((acc, curr) => acc + curr.modulesCompleted, 0);
  const totalModules = courseProgress.reduce((acc, curr) => acc + curr.totalModules, 0);
  const averageProgress = courseProgress.length 
    ? courseProgress.reduce((acc, curr) => acc + curr.progress, 0) / courseProgress.length 
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back{user?.email ? `, ${user.email}` : ''}
        </h1>
        <p className="text-gray-600">
          Track your progress and continue your learning journey.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <span className="text-3xl font-bold text-gray-900">
              {courseProgress.length}
            </span>
          </div>
          <h3 className="text-gray-600">Courses Enrolled</h3>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <BarChart className="w-8 h-8 text-green-600" />
            <span className="text-3xl font-bold text-gray-900">
              {totalModulesCompleted}
              <span className="text-sm text-gray-500 ml-1">/ {totalModules}</span>
            </span>
          </div>
          <h3 className="text-gray-600">Modules Completed</h3>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Trophy className="w-8 h-8 text-yellow-600" />
            <span className="text-3xl font-bold text-gray-900">
              {Math.round(averageProgress)}%
            </span>
          </div>
          <h3 className="text-gray-600">Average Progress</h3>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <Award className="w-8 h-8 text-purple-600" />
            <span className="text-3xl font-bold text-gray-900">
              {courseProgress.filter(c => c.progress === 100).length}
            </span>
          </div>
          <h3 className="text-gray-600">Courses Completed</h3>
        </div>
      </div>

      {/* Course Progress */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Courses</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {courseProgress.map(({ course, progress, modulesCompleted, totalModules, lastUpdated }) => (
          <div key={course.id} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {modulesCompleted} of {totalModules} modules completed
                </p>
                {lastUpdated && (
                  <p className="text-xs text-gray-500">
                    Last activity: {new Date(lastUpdated).toLocaleDateString()}
                  </p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium
                ${progress === 100 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-indigo-100 text-indigo-800'}`}>
                {progress === 100 ? 'Completed' : 'In Progress'}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full
                    ${progress === 100 ? 'bg-green-500' : 'bg-indigo-600'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <Link
              to={course.modules && course.modules.length > 0 
                ? `/learn/${course.id}/module/${course.modules[0].id}`
                : `/courses/${course.id}`}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Continue Learning
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        ))}
      </div>

      {courseProgress.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No courses yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start your learning journey by enrolling in a course.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Browse Courses
            <ChevronRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default Dashboard;