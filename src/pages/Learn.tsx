import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Course } from '../types/database';
import { useModuleNavigation } from '../hooks/useModuleNavigation';
import CourseSidebar from '../components/learning/CourseSidebar';
import ModuleNavigation from '../components/learning/ModuleNavigation';
import ModuleContent from '../components/learning/ModuleContent';
import { SheetContent, SheetTitle } from '../components/ui/sheet';

const Learn = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<{ id: string; content: string; timestamp: Date; }[]>([]);

  const {
    modules,
    currentModule,
    progress,
    loading: moduleLoading,
    error: moduleError,
    navigateToModule
  } = useModuleNavigation(courseId, moduleId);

  // Set initial sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const fetchCourseData = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        setError(null);

        // Check enrollment
        const { data: enrollment } = await supabase
          .from('course_purchases')
          .select('*')
          .eq('course_id', courseId)
          .eq('user_id', user.id)
          .eq('payment_status', 'completed')
          .maybeSingle();

        if (!enrollment) {
          navigate(`/courses/${courseId}`);
          return;
        }

        // Fetch course data
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();

        if (courseError) throw courseError;
        setCourse(courseData);
      } catch (error) {
        console.error('Error fetching course data:', error);
        setError('Failed to load course content');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, user, navigate]);

  const markComplete = async () => {
    if (!currentModule || !user) return;

    try {
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('module_id', currentModule.id)
        .maybeSingle();

      if (!existingProgress) {
        await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            module_id: currentModule.id,
            completed: true
          });
      } else {
        await supabase
          .from('user_progress')
          .update({ completed: true })
          .eq('id', existingProgress.id);
      }

      // Update local progress state
      const updatedProgress = [
        ...progress.filter(p => p.module_id !== currentModule.id),
        {
          user_id: user.id,
          module_id: currentModule.id,
          completed: true,
          id: existingProgress?.id || crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      // Navigate to next module if available
      const currentIndex = modules.findIndex(m => m.id === currentModule.id);
      if (currentIndex < modules.length - 1) {
        navigate(`/learn/${courseId}/module/${modules[currentIndex + 1].id}`);
      }
    } catch (error) {
      console.error('Error marking module complete:', error);
    }
  };

  if (loading || moduleLoading || !course || !currentModule) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || moduleError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || moduleError || 'Course not found'}
          </h2>
          <button
            onClick={() => navigate('/courses')}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const currentModuleIndex = modules.findIndex(m => m.id === currentModule.id);
  const isModuleComplete = progress.some(p => p.module_id === currentModule.id && p.completed);

  const sidebarContent = (
    <SheetContent side="left" className="w-[300px] p-0">
      <SheetTitle className="sr-only">Course Navigation</SheetTitle>
      <CourseSidebar
        title={course.title}
        modules={modules}
        progress={progress}
        currentModuleId={currentModule.id}
        sidebarOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(!sidebarOpen)}
        onModuleSelect={(moduleId) => navigate(`/learn/${courseId}/module/${moduleId}`)}
      />
    </SheetContent>
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-white">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <CourseSidebar
          title={course.title}
          modules={modules}
          progress={progress}
          currentModuleId={currentModule.id}
          sidebarOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(!sidebarOpen)}
          onModuleSelect={(moduleId) => navigate(`/learn/${courseId}/module/${moduleId}`)}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <ModuleNavigation
          currentIndex={currentModuleIndex}
          totalModules={modules.length}
          onPrevious={() => navigateToModule(modules[currentModuleIndex - 1].id)}
          onNext={() => navigateToModule(modules[currentModuleIndex + 1].id)}
          onBack={() => navigate('/dashboard')}
          onComplete={markComplete}
          title={currentModule.title}
          estimatedTime={currentModule.estimated_time || 0}
          isCompleted={isModuleComplete}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarContent}
        </ModuleNavigation>

        <div className="flex-1 overflow-hidden">
          <ModuleContent
            title={currentModule.title}
            estimatedTime={currentModule.estimated_time || 0}
            moduleNumber={currentModuleIndex + 1}
            content={currentModule.content}
            notes={notes}
            onAddNote={(note) => {
              setNotes([
                ...notes,
                { id: crypto.randomUUID(), content: note.content, timestamp: new Date() }
              ]);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Learn;