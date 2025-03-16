import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  X,
  Maximize2,
  Minimize2,
  MessageSquare,
  Brain,
  BarChart,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { Message, TeachingStyle } from "../../../types/shared";
import MessageDisplay from "./MessageDisplay";
import InputArea from "./InputArea";
import { cn } from "../../../lib/utils";
import useTeacherChat from "../../../hooks/useTeacherChat";

interface AITeacherChatProps {
  fullscreen?: boolean;
  contextContent?: string;
  contextTitle?: string;
  currentTopic?: string;
  onClose?: () => void;
}

/**
 * AITeacherChat component - Main interface for interacting with the AI teaching assistant
 * Provides a full featured chat interface with tabs for concepts and learning analytics
 */
const AITeacherChat: React.FC<AITeacherChatProps> = ({
  fullscreen = false,
  contextContent = "",
  contextTitle = "",
  currentTopic = "",
  onClose,
}) => {
  // Local state
  const [tabView, setTabView] = useState<"chat" | "concepts" | "analytics">(
    "chat"
  );
  const [teachingStyle, setTeachingStyle] =
    useState<TeachingStyle>("conversational");
  const [showStyleOptions, setShowStyleOptions] = useState(false);
  const [activeConcept, setActiveConcept] = useState<string | null>(null);

  // Get the user ID
  const getUserId = (): string => {
    let userId = localStorage.getItem("ai_teacher_user_id");
    if (!userId) {
      userId = `user_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem("ai_teacher_user_id", userId);
    }
    return userId;
  };

  const userId = getUserId();

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use our custom hook
  const {
    messages,
    sendMessage,
    isLoading,
    isStreaming,
    concepts,
    followupQuestions,
    isApiAvailable,
    initializeChat,
    fetchLearningAnalytics,
    learningAnalytics,
  } = useTeacherChat();

  // Initialize on component mount
  useEffect(() => {
    initializeChat(userId);
    fetchLearningAnalytics(userId);
  }, [userId, initializeChat, fetchLearningAnalytics]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && tabView === "chat") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, tabView]);

  // Handle changing teaching style
  const changeTeachingStyle = (style: TeachingStyle) => {
    setTeachingStyle(style);
    setShowStyleOptions(false);
    console.log(`Teaching style changed to: ${style}`);

    // Send a user feedback message about the style change
    sendMessage(
      userId,
      `I'd like you to use a ${style} teaching style from now on.`,
      true,
      {
        moduleContent: contextContent,
        moduleTitle: contextTitle,
      }
    );
  };

  // Handle concept click
  const handleConceptClick = (concept: string) => {
    setActiveConcept(concept);
    if (tabView === "chat") {
      // If we're in the chat tab, send a message about the concept
      sendMessage(userId, `Tell me more about "${concept}"`);
    } else {
      // Otherwise, just switch to the concepts tab
      setTabView("concepts");
    }
  };

  // Render welcome message
  const renderWelcomeMessage = () => {
    return (
      <div className="text-center max-w-md mx-auto my-8 px-4">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bot className="h-8 w-8 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold mb-2">Your AI Learning Assistant</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          I'm here to help you understand concepts, answer questions, and guide
          your learning journey.
        </p>

        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-lg mb-6">
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <Lightbulb className="w-4 h-4 mr-1 text-amber-500" />
            <span>Try asking about:</span>
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {currentTopic && (
              <button
                onClick={() =>
                  sendMessage(userId, `Tell me about ${currentTopic}`)
                }
                className="px-3 py-1.5 bg-white dark:bg-gray-800 text-sm rounded-full shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
              >
                Tell me about {currentTopic}
              </button>
            )}
            <button
              onClick={() => sendMessage(userId, "What should I learn next?")}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 text-sm rounded-full shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
            >
              What should I learn next?
            </button>
            <button
              onClick={() => sendMessage(userId, "Give me a practice exercise")}
              className="px-3 py-1.5 bg-white dark:bg-gray-800 text-sm rounded-full shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
            >
              Give me a practice exercise
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden",
        fullscreen ? "h-screen" : "h-[600px] shadow-xl"
      )}
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-1.5 text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-medium text-gray-900 dark:text-white">
              AI Learning Assistant
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Helping you understand{" "}
              {currentTopic || contextTitle || "new concepts"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close AI teacher"
            >
              {fullscreen ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <X className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={cn(
            "flex-1 py-2 px-4 text-sm font-medium transition-colors duration-150 flex items-center justify-center space-x-1",
            tabView === "chat"
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500"
              : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
          )}
          onClick={() => setTabView("chat")}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Chat</span>
        </button>
        <button
          className={cn(
            "flex-1 py-2 px-4 text-sm font-medium transition-colors duration-150 flex items-center justify-center space-x-1",
            tabView === "concepts"
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500"
              : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
          )}
          onClick={() => setTabView("concepts")}
        >
          <Brain className="h-4 w-4" />
          <span>Concepts</span>
          {concepts.length > 0 && (
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 text-xs rounded-full px-2">
              {concepts.length}
            </span>
          )}
        </button>
        <button
          className={cn(
            "flex-1 py-2 px-4 text-sm font-medium transition-colors duration-150 flex items-center justify-center space-x-1",
            tabView === "analytics"
              ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500"
              : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
          )}
          onClick={() => setTabView("analytics")}
        >
          <BarChart className="h-4 w-4" />
          <span>Progress</span>
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {/* Chat tab */}
        {tabView === "chat" && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Welcome message or chat messages */}
              {messages.length === 0 ? (
                renderWelcomeMessage()
              ) : (
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "max-w-[80%] p-3 rounded-lg",
                        message.role === "user"
                          ? "bg-indigo-100 dark:bg-indigo-900/40 ml-auto text-gray-900 dark:text-white"
                          : "bg-white dark:bg-gray-800 mr-auto text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                      )}
                    >
                      <div className="text-sm">{message.content}</div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg mr-auto border border-gray-200 dark:border-gray-700 flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Thinking...
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Follow-up suggestions */}
            {followupQuestions && followupQuestions.length > 0 && (
              <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border-t border-indigo-100 dark:border-indigo-900/30">
                <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-2 flex items-center">
                  <Lightbulb className="w-3.5 h-3.5 mr-1 text-amber-500" />
                  <span>You might also want to ask:</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {followupQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(userId, question)}
                      className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded-full shadow-sm hover:shadow border border-gray-200 dark:border-gray-700"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <InputArea
                onSendMessage={(text) => sendMessage(userId, text)}
                isLoading={isLoading}
                onStyleChange={(style) => changeTeachingStyle(style)}
                currentStyle={teachingStyle}
                showStyleOptions={showStyleOptions}
                onToggleStyleOptions={() =>
                  setShowStyleOptions(!showStyleOptions)
                }
              />
            </div>
          </div>
        )}

        {/* Concepts tab */}
        {tabView === "concepts" && (
          <div className="p-4 overflow-y-auto h-full">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-indigo-500" />
              <span>Key Concepts</span>
            </h3>

            {concepts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {concepts.map((concept, index) => (
                  <button
                    key={index}
                    onClick={() => handleConceptClick(concept)}
                    className={cn(
                      "p-3 rounded-lg text-left transition-all",
                      concept === activeConcept
                        ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 font-medium"
                        : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                    )}
                  >
                    <div className="text-sm">{concept}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  No concepts identified yet
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Ask questions in the chat to identify key concepts
                </p>
              </div>
            )}
          </div>
        )}

        {/* Analytics tab */}
        {tabView === "analytics" && (
          <div className="p-4 overflow-y-auto h-full">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <BarChart className="w-5 h-5 mr-2 text-indigo-500" />
              <span>Learning Progress</span>
            </h3>

            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart className="h-8 w-8 text-gray-400 dark:text-gray-600" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                Your learning progress will appear here
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Continue the conversation to build your learning profile
              </p>
              <button
                onClick={() => setTabView("chat")}
                className="mt-4 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
              >
                Start Chatting
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITeacherChat;
