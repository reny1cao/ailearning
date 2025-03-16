import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../store/authStore";
import { Course } from "../types/database";
import { useModuleNavigation } from "../hooks/useModuleNavigation";
import {
  BookOpen,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Bot,
  MessageCircle,
  Menu,
  Settings,
  Home,
  Layout,
  Bookmark,
  ChevronDown,
  BarChart2,
  Lightbulb,
  Sparkles,
  Book,
  PenTool,
  LucideIcon,
  X,
  Send,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Sheet, SheetContent } from "../components/ui/sheet";
import RichTextContent from "../components/RichTextContent";
import { useTextSelection } from "../hooks/useTextSelection";
import { useAIInteraction } from "../hooks/useAIInteraction";
import TextSelection from "../components/learning/TextSelection";
import AIResponse from "../components/learning/AIResponse";
import { visibilityManager } from "../lib/visibilityManager";
import { usePageLifecycle } from "../hooks/usePageLifecycle";

// Layout components
import LearningHeader from "../components/learning/layout/LearningHeader";
import ModulesSidebar from "../components/learning/layout/ModulesSidebar";
import MobileNavigation from "../components/learning/layout/MobileNavigation";

// Content components
import ModuleHeader from "../components/learning/content/ModuleHeader";
import ModuleContentView from "../components/learning/content/ModuleContentView";

// AI components
import AIChat from "../components/learning/ai/AIChat";

// Type definitions for notes
interface Note {
  id: string;
  content: string;
  timestamp: Date;
  type: "note" | "highlight" | "bookmark";
  selection?: string;
  moduleId: string;
}

interface NavigationItem {
  title: string;
  icon: LucideIcon;
  moduleId: string;
  isComplete: boolean;
  isCurrent: boolean;
}

const Learn = () => {
  const { courseId, moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">(
    "medium"
  );
  const [showSidebar, setShowSidebar] = useState(true);
  const [mobileActiveTab, setMobileActiveTab] = useState<
    "content" | "modules" | "ai" | "notes"
  >("content");
  const contentRef = useRef<HTMLDivElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const lastAuthCheckRef = useRef<number>(Date.now());
  const visibilityUnregisterRef = useRef<(() => void) | null>(null);

  const {
    modules,
    currentModule,
    progress,
    loading: moduleLoading,
    error: moduleError,
    navigateToModule,
  } = useModuleNavigation(courseId, moduleId);

  const {
    selectedText,
    position,
    showFormatting,
    handleTextSelection,
    clearSelection,
  } = useTextSelection(contentRef);

  const {
    isLoading: aiLoading,
    aiResponse,
    handleAIInteraction,
    clearResponse,
  } = useAIInteraction();

  // Use the page lifecycle hook to prevent unwanted refreshes
  const { isVisible, networkStatus } = usePageLifecycle({
    pageId: `learn-${courseId || "unknown"}-${moduleId || "unknown"}`,
    preventRefresh: true,
    onVisibilityChange: (isVisible) => {
      if (isVisible) {
        const now = Date.now();
        if (now - lastAuthCheckRef.current > 10000) {
          lastAuthCheckRef.current = now;

          // Very lightweight check - just verify auth is still valid
          if (user) {
            supabase.auth.getSession().then(({ data }) => {
              if (!data.session && user) {
                console.log("Session expired while away, redirecting to login");
                navigate("/auth");
              }
            });
          }
        }
      }
    },
  });

  // Set sidebar state based on screen size
  useEffect(() => {
    const handleResize = () => {
      const savedState = localStorage.getItem("sidebar-collapsed");

      if (window.innerWidth >= 1280) {
        // On XL screens, respect user preference if available
        setShowSidebar(savedState !== "true");
      } else if (window.innerWidth >= 768 && window.innerWidth < 1280) {
        // On medium screens, show mini sidebar by default
        setShowSidebar(false);
      } else if (window.innerWidth < 768) {
        // On mobile, always hide the sidebar
        setShowSidebar(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle sidebar with memory of user preference
  const toggleSidebar = () => {
    console.log("Toggle sidebar called, current state:", showSidebar);
    const newState = !showSidebar;
    setShowSidebar(newState);
    console.log("New sidebar state:", newState);

    // Remember user preference on larger screens
    if (window.innerWidth >= 768) {
      if (newState) {
        localStorage.removeItem("sidebar-collapsed");
      } else {
        localStorage.setItem("sidebar-collapsed", "true");
      }
    }

    // If on mobile and opening sidebar, activate modules tab
    if (newState && window.innerWidth < 768) {
      setMobileActiveTab("modules");
    }
  };

  // Mobile navigation handling
  useEffect(() => {
    // When mobile tab changes, update related state
    if (mobileActiveTab === "modules") {
      setShowSidebar(true);
    } else if (mobileActiveTab === "ai") {
      setShowAIChat(true);
    } else {
      setShowSidebar(false);
      if (mobileActiveTab !== "ai") {
        setShowAIChat(false);
      }
    }
  }, [mobileActiveTab]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchCourseData = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        setError(null);

        // Check enrollment
        const { data: enrollment } = await supabase
          .from("course_purchases")
          .select("*")
          .eq("course_id", courseId)
          .eq("user_id", user.id)
          .eq("payment_status", "completed")
          .maybeSingle();

        if (!enrollment) {
          navigate(`/courses/${courseId}`);
          return;
        }

        // Fetch course data
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single();

        if (courseError) throw courseError;
        setCourse(courseData);

        // Fetch notes for this course
        const { data: notesData } = await supabase
          .from("user_notes")
          .select("*")
          .eq("user_id", user.id)
          .eq("course_id", courseId);

        if (notesData) {
          setNotes(
            notesData.map((note) => ({
              ...note,
              timestamp: new Date(note.created_at),
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching course data:", error);
        setError("Failed to load course content");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, user, navigate]);

  const markComplete = async () => {
    if (!currentModule || !user) return;

    try {
      setIsTransitioning(true);

      const { data: existingProgress } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("module_id", currentModule.id)
        .maybeSingle();

      if (!existingProgress) {
        await supabase.from("user_progress").insert({
          user_id: user.id,
          module_id: currentModule.id,
          completed: true,
        });
      } else {
        await supabase
          .from("user_progress")
          .update({ completed: true })
          .eq("id", existingProgress.id);
      }

      // Navigate to next module if available
      const currentIndex = modules.findIndex((m) => m.id === currentModule.id);
      if (currentIndex < modules.length - 1) {
        setTimeout(() => {
          navigate(`/learn/${courseId}/module/${modules[currentIndex + 1].id}`);
          setIsTransitioning(false);
        }, 400);
      } else {
        setIsTransitioning(false);
      }
    } catch (error) {
      console.error("Error marking module complete:", error);
      setIsTransitioning(false);
    }
  };

  const handleAddNote = async (note: {
    content: string;
    type: "note" | "highlight" | "bookmark";
    selection?: string;
  }) => {
    if (!user || !currentModule) return;

    try {
      const newNote = {
        user_id: user.id,
        course_id: courseId as string,
        module_id: currentModule.id,
        content: note.content,
        type: note.type,
        selection: note.selection || null,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("user_notes")
        .insert(newNote)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setNotes((prev) => [
        ...prev,
        {
          ...data,
          id: data.id,
          content: data.content,
          timestamp: new Date(data.created_at),
          type: data.type,
          selection: data.selection,
          moduleId: data.module_id,
        },
      ]);
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  // Handle text selection actions
  const handleSelectionAction = (
    action: "highlight" | "bookmark" | "explain" | "example",
    text: string
  ) => {
    if (action === "highlight" || action === "bookmark") {
      handleAddNote({
        content: text,
        type: action,
        selection: text,
      });
      clearSelection();
    } else if (action === "explain" || action === "example") {
      handleAIInteraction(action, text, currentModule?.content || "");
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "small":
        return "text-sm";
      case "large":
        return "text-lg";
      default:
        return "text-base";
    }
  };

  const handleModuleSelect = (moduleId: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigateToModule(moduleId);
      setIsTransitioning(false);
      // Close sidebar on mobile after selection
      if (window.innerWidth < 768) {
        setShowSidebar(false);
        setMobileActiveTab("content");
      }
    }, 400);
  };

  const handleFontSizeChange = () => {
    setFontSize((size) =>
      size === "small" ? "medium" : size === "medium" ? "large" : "small"
    );
  };

  // Handle previous module navigation
  const handlePreviousModule = () => {
    const currentIndex = modules.findIndex((m) => m.id === currentModule?.id);
    if (currentIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        navigateToModule(modules[currentIndex - 1].id);
        setIsTransitioning(false);
      }, 400);
    }
  };

  // Handle next module navigation
  const handleNextModule = () => {
    const currentIndex = modules.findIndex((m) => m.id === currentModule?.id);
    if (currentIndex < modules.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        navigateToModule(modules[currentIndex + 1].id);
        setIsTransitioning(false);
      }, 400);
    } else {
      navigate("/dashboard");
    }
  };

  if (loading || moduleLoading || !course || !currentModule) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-[3px] border-indigo-100"></div>
            <div className="absolute inset-0 rounded-full border-t-[3px] border-indigo-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
              <BookOpen className="w-7 h-7" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">
            Loading your learning experience...
          </p>
        </div>
      </div>
    );
  }

  if (error || moduleError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="max-w-md bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error || moduleError || "Course not found"}
            </h2>
            <p className="text-gray-600">
              We couldn't load your course content. Please try again later or
              contact support if the problem persists.
            </p>
          </div>
          <button
            onClick={() => navigate("/courses")}
            className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const currentModuleIndex = modules.findIndex(
    (m) => m.id === currentModule.id
  );
  const isModuleComplete = progress.some(
    (p) => p.module_id === currentModule.id && p.completed
  );
  const moduleNotes = notes.filter(
    (note) => note.moduleId === currentModule.id
  );

  const completedModules = progress.filter((p) => p.completed).length;
  const overallProgress = Math.round((completedModules / modules.length) * 100);

  // Organize modules into navigation structure
  const moduleNavItems: NavigationItem[] = modules.map((module, index) => {
    const isComplete = progress.some(
      (p) => p.module_id === module.id && p.completed
    );
    const isCurrent = module.id === currentModule.id;

    return {
      title: module.title,
      icon: Book,
      moduleId: module.id,
      isComplete,
      isCurrent,
    };
  });

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Global Header */}
      <LearningHeader
        courseTitle={course.title}
        showAIChat={showAIChat}
        showSidebar={showSidebar}
        setShowAIChat={setShowAIChat}
        toggleSidebar={toggleSidebar}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Course Navigation Sidebar */}
        <ModulesSidebar
          courseTitle={course.title}
          modules={moduleNavItems}
          overallProgress={overallProgress}
          showSidebar={showSidebar}
          onModuleSelect={handleModuleSelect}
          toggleSidebar={toggleSidebar}
        />

        {/* Sidebar toggle button - positioned at the edge of main content */}
        <button
          onClick={toggleSidebar}
          className={`absolute top-4 ${
            showSidebar ? "left-64" : "left-0"
          } z-50 bg-white border border-gray-200 rounded-r-md p-2 shadow-sm hover:bg-gray-50 transition-all duration-300 hidden md:flex`}
          aria-label={showSidebar ? "Collapse sidebar" : "Expand sidebar"}
        >
          {showSidebar ? (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
        </button>

        <main
          className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
            showSidebar ? "md:ml-64 xl:ml-64" : "md:ml-10 xl:ml-0"
          }`}
        >
          {/* Module Header */}
          <ModuleHeader
            title={currentModule.title}
            moduleIndex={currentModuleIndex}
            totalModules={modules.length}
            showAIChat={showAIChat}
            setShowAIChat={setShowAIChat}
            onFontSizeChange={handleFontSizeChange}
          />

          {/* Content and AI Assistant Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Main Content Area */}
            <div
              ref={contentContainerRef}
              className={`flex-1 overflow-y-auto transition-all duration-300 ${
                showAIChat ? "md:pr-[400px]" : ""
              }`}
            >
              <ModuleContentView
                content={currentModule.content}
                fontSizeClass={getFontSizeClass()}
                isTransitioning={isTransitioning}
                notes={moduleNotes}
                isCurrentModuleComplete={isModuleComplete}
                currentModuleIndex={currentModuleIndex}
                totalModules={modules.length}
                onPrevious={handlePreviousModule}
                onNext={handleNextModule}
                onComplete={markComplete}
                onTextSelection={handleTextSelection}
              />
            </div>

            {/* AI Assistant Panel */}
            <AIChat
              isVisible={showAIChat}
              onClose={() => setShowAIChat(false)}
              currentModuleContent={currentModule?.content}
              currentModuleTitle={currentModule?.title}
            />
          </div>
        </main>
      </div>

      {/* Selection Tools */}
      {showFormatting && (
        <TextSelection
          position={position}
          selectedText={selectedText}
          isLoading={aiLoading}
          onAction={handleSelectionAction}
          onClose={clearSelection}
        />
      )}

      {aiResponse && (
        <AIResponse
          position={position}
          selectedText={selectedText}
          response={aiResponse}
          onClose={clearResponse}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <MobileNavigation
        activeTab={mobileActiveTab}
        onTabChange={setMobileActiveTab}
        showAIChat={showAIChat}
      />
    </div>
  );
};

export default Learn;
