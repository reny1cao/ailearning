import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Menu, 
  CheckCircle, 
  BookOpen, 
  BarChart, 
  Clock,
  BookMarked,
  MessageCircle,
  Lightbulb,
  FileText,
  Youtube,
  Code,
  PenTool,
  Lock,
  Star,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
  Target
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Course, Module, UserProgress } from '../types/database';
import { paymentProvider } from '../lib/mockPayment';

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      if (user) {
        checkEnrollment();
      }
    }
  }, [courseId, user]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) {
        setError('Course not found');
        return;
      }

      if (!courseData) {
        setError('Course not found');
        return;
      }

      const { data: moduleData, error: moduleError } = await supabase
        .from('modules')
        .select(`
          id,
          title,
          description,
          order_number,
          content,
          status,
          estimated_time,
          user_progress (
            id,
            user_id,
            completed,
            updated_at
          )
        `)
        .eq('course_id', courseId)
        .eq('status', 'published')
        .order('order_number');

      if (moduleError) {
        console.error('Error fetching modules:', moduleError);
      }

      setCourse(courseData);
      setModules(moduleData || []);
      
      // Auto-expand the first module for preview
      if (moduleData && moduleData.length > 0) {
        setExpandedModules([moduleData[0].id]);
      }
    } catch (error) {
      console.error('Error in fetchCourseDetails:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    if (!user || !courseId) return;
    
    try {
      const { data: enrollment } = await supabase
        .from('course_purchases')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .eq('payment_status', 'completed')
        .maybeSingle();

      setIsEnrolled(!!enrollment);
    } catch (error) {
      console.error('Error checking enrollment:', error);
      setIsEnrolled(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!course) return;

    try {
      const session = await paymentProvider.createCheckoutSession({
        courseId: course.id,
        price: course.price,
        title: course.title,
        userId: user.id
      });

      setIsEnrolled(true);
      await checkEnrollment();
    } catch (error) {
      console.error('Error processing enrollment:', error);
    }
  };

  const getModuleAccessStatus = (moduleIndex: number) => {
    if (isEnrolled) return 'enrolled';
    if (!course?.is_premium) return 'free';
    if (moduleIndex === 0) return 'preview';
    return 'locked';
  };

  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleModuleClick = (moduleId: string, accessStatus: string) => {
    if (accessStatus === 'locked') {
      // Show upgrade prompt
      handleEnroll();
      return;
    }

    // For preview or enrolled modules, navigate to the learning page
    if (courseId) {
      navigate(`/learn/${courseId}/module/${moduleId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {error || 'Course not found'}
        </h2>
        <button
          onClick={() => navigate('/courses')}
          className="text-indigo-600 hover:text-indigo-800"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Course Header */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-xl shadow-lg overflow-hidden mb-8 text-white">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-700">
                  {course.category}
                </span>
                {course.is_premium && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-500 text-yellow-900 flex items-center">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    Premium
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-indigo-100 mb-6">{course.description}</p>

              <div className="flex flex-wrap gap-6 text-indigo-100">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  {course.total_students?.toLocaleString()} students
                </div>
                <div className="flex items-center">
                  <Star className="w-5 h-5 mr-2 fill-current text-yellow-500" />
                  {course.rating} ({course.total_reviews} reviews)
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  {course.estimated_hours} hours
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Last updated {new Date(course.last_updated).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="lg:justify-self-end">
              <div className="bg-white rounded-lg shadow-lg p-6 text-gray-900 max-w-md">
                {course.is_premium ? (
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                      <span className="text-lg font-semibold">Premium Course</span>
                    </div>
                    <div className="text-4xl font-bold">${course.price}</div>
                    <div className="text-gray-600 text-sm">One-time payment</div>
                  </div>
                ) : (
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <span className="text-lg font-semibold">Free Course</span>
                    </div>
                    <div className="text-gray-600">Start learning today</div>
                  </div>
                )}

                {isEnrolled ? (
                  <button
                    onClick={() => navigate(`/learn/${courseId}/module/${modules[0]?.id}`)}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-5 h-5" />
                    Continue Learning
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                  >
                    {course.is_premium ? (
                      <>
                        <Lock className="w-5 h-5" />
                        Enroll Now - ${course.price}
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-5 h-5" />
                        Start Learning Free
                      </>
                    )}
                  </button>
                )}

                <div className="mt-6 space-y-4">
                  <h4 className="font-semibold text-gray-900">This course includes:</h4>
                  <ul className="space-y-3 text-gray-600">
                    {course.has_lifetime_access && (
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                        Full lifetime access
                      </li>
                    )}
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                      {modules.length} in-depth modules
                    </li>
                    {course.has_assignments && (
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                        Practical assignments
                      </li>
                    )}
                    {course.has_certificate && (
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                        Certificate of completion
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-8">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'overview'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                activeTab === 'curriculum'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Curriculum
            </button>
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* What You'll Learn */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  What You'll Learn
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {course.what_you_will_learn?.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Requirements */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Requirements
                </h3>
                <ul className="space-y-2">
                  {course.requirements?.map((req, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mr-3" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Target Audience */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Who This Course is For
                </h3>
                <ul className="space-y-2">
                  {course.target_audience?.map((audience, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <Target className="w-5 h-5 text-indigo-600 mr-3" />
                      {audience}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Course Content
                  </h3>
                  <p className="text-gray-600">
                    {modules.length} modules • {course.estimated_hours} hours
                  </p>
                </div>
              </div>

              {modules.length > 0 ? (
                <div className="space-y-4">
                  {modules.map((module, index) => {
                    const accessStatus = getModuleAccessStatus(index);
                    const isCompleted = module.user_progress?.some(p => p.completed);
                    const isExpanded = expandedModules.includes(module.id);
                    
                    return (
                      <div
                        key={module.id}
                        className={`border rounded-lg transition duration-200 ${
                          accessStatus === 'locked' ? 'opacity-75' : 'hover:border-indigo-200'
                        }`}
                      >
                        <button
                          onClick={() => toggleModuleExpansion(module.id)}
                          className="w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-indigo-200 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center flex-1">
                              <div className={`w-8 h-8 flex items-center justify-center rounded-full border mr-3
                                ${isCompleted ? 'border-green-500 bg-green-50' : 
                                  accessStatus === 'preview' ? 'border-indigo-500 bg-indigo-50' :
                                  'border-gray-300'}`}
                              >
                                {isCompleted ? (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                  <span className="text-sm">{index + 1}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{module.title}</h3>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {module.estimated_time} minutes
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {accessStatus === 'locked' ? (
                                <Lock className="w-5 h-5 text-gray-400 mr-2" />
                              ) : accessStatus === 'preview' ? (
                                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full mr-2">
                                  Free Preview
                                </span>
                              ) : null}
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </button>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className={`px-4 pb-4 pt-2 border-t mt-2 ${
                            accessStatus === 'locked' ? 'blur-sm' : ''
                          }`}>
                            <p className="text-gray-600 mb-4">{module.description}</p>
                            
                            {/* Module Content Preview */}
                            <div className="space-y-3">
                              <div className="flex items-center text-gray-700">
                                <FileText className="w-4 h-4 mr-2" />
                                <span>Lecture materials and notes</span>
                              </div>
                              <div className="flex items-center text-gray-700">
                                <Code className="w-4 h-4 mr-2" />
                                <span>Practical exercises</span>
                              </div>
                              <div className="flex items-center text-gray-700">
                                <PenTool className="w-4 h-4 mr-2" />
                                <span>Hands-on assignments</span>
                              </div>
                            </div>

                            {accessStatus === 'preview' && (
                              <div className="mt-4 pt-4 border-t">
                                <button
                                  onClick={() => handleModuleClick(module.id, accessStatus)}
                                  className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                >
                                  <BookOpen className="w-4 h-4 mr-2" />
                                  Start Free Preview
                                </button>
                              </div>
                            )}

                            {accessStatus === 'locked' && (
                              <div className="mt-4 pt-4 border-t">
                                <button
                                  onClick={handleEnroll}
                                  className="w-full flex items-center justify-center px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                                >
                                  <Lock className="w-4 h-4 mr-2" />
                                  Unlock Full Course
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No modules available
                  </h3>
                  <p className="text-gray-600">
                    This course doesn't have any modules yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;