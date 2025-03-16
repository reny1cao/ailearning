import React, { useState, useEffect, lazy, Suspense } from "react";
import AITeacherChat from "./AITeacherChat";
// Import the companion lazily to prevent unnecessary initialization
const AITeacherCompanion = lazy(() => import("./AITeacherCompanion"));
import useTeacherChat from "../../../hooks/useTeacherChat";

interface AITeacherIntegrationProps {
  moduleContent?: string;
  moduleTitle?: string;
  currentTopic?: string;
  mode?: "fullscreen" | "companion";
  showIdeas?: boolean;
}

/**
 * AI Teacher Integration - Manages the AI teacher experience for the learning platform
 * This component handles the integration between the Learn page and the AITeacher components
 */
const AITeacherIntegration: React.FC<AITeacherIntegrationProps> = ({
  moduleContent = "",
  moduleTitle = "",
  currentTopic = "",
  mode = "companion",
  showIdeas = false,
}) => {
  // User settings stored in localStorage
  const [userSettings, setUserSettings] = useState({
    enableCompanion: true,
  });

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(mode === "fullscreen");

  // Get API status
  const { isApiAvailable } = useTeacherChat();

  // Load user settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("ai_teacher_settings");
    if (savedSettings) {
      try {
        setUserSettings(JSON.parse(savedSettings));
      } catch (e) {
        // If parsing fails, use default settings
        console.error("Failed to parse user settings", e);
      }
    }
  }, []);

  // Save settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem("ai_teacher_settings", JSON.stringify(userSettings));
  }, [userSettings]);

  // Handle fullscreen toggle
  const handleMaximize = () => {
    setIsFullscreen(true);
  };

  // Handle close fullscreen view
  const handleClose = () => {
    setIsFullscreen(false);
  };

  // If the AI teacher is disabled in user settings, don't render anything
  if (!userSettings.enableCompanion && mode === "companion") {
    return null;
  }

  return (
    <>
      {isFullscreen ? (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-hidden flex flex-col">
          <AITeacherChat
            fullscreen={true}
            onClose={handleClose}
            contextContent={moduleContent}
            contextTitle={moduleTitle}
            currentTopic={currentTopic}
          />
        </div>
      ) : (
        mode === "companion" && (
          <div className="ai-companion-wrapper">
            <Suspense
              fallback={
                <div className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-indigo-600 animate-pulse"></div>
              }
            >
              <AITeacherCompanion
                position="right"
                mode="floating"
                initialExpanded={false}
                contextContent={moduleContent}
                contextTitle={moduleTitle}
                currentTopic={currentTopic}
                onMaximize={handleMaximize}
              />
            </Suspense>
          </div>
        )
      )}
    </>
  );
};

export default AITeacherIntegration;
