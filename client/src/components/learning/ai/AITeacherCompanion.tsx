import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  X,
  Lightbulb,
  MessageSquare,
  Brain,
  BarChart,
  Maximize2,
  Minimize2,
  ArrowRight,
  Zap,
  Loader2,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import useTeacherChat from "../../../hooks/useTeacherChat";
import { Message, TeachingStyle } from "../../../types/shared";
import MessageDisplay from "./MessageDisplay";

interface AITeacherCompanionProps {
  position?: "left" | "right";
  mode?: "floating" | "sidebar";
  initialExpanded?: boolean;
  contextContent?: string;
  contextTitle?: string;
  currentTopic?: string;
  onMaximize?: () => void;
}

/**
 * AI Teacher Companion - A contextual learning assistant that sits alongside content
 * This component provides a less intrusive, more integrated learning experience
 */
const AITeacherCompanion: React.FC<AITeacherCompanionProps> = ({
  position = "right",
  mode = "floating",
  initialExpanded = false,
  contextContent = "",
  contextTitle = "",
  currentTopic = "",
  onMaximize,
}) => {
  // State for UI
  const [expanded, setExpanded] = useState(initialExpanded);
  const [activeTab, setActiveTab] = useState<"chat" | "concepts" | "progress">(
    "chat"
  );
  const [inputText, setInputText] = useState("");
  const [inputRows, setInputRows] = useState(1);
  const [teachingStyle, setTeachingStyle] =
    useState<TeachingStyle>("conversational");
  const [activeConcept, setActiveConcept] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Refs
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const companionRef = useRef<HTMLDivElement>(null);

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

  // Use our custom hook for chat functionality
  const {
    messages,
    isLoading,
    isStreaming,
    error,
    concepts,
    followupQuestions,
    isApiAvailable,
    sendMessage,
    initializeChat,
    fetchLearningAnalytics,
  } = useTeacherChat();

  // Auto-resize text input
  const maxRows = 4;

  const autoResizeInput = (text: string) => {
    if (!text) {
      setInputRows(1);
      return;
    }

    const lineCount = text.split("\n").length;
    const newRows = Math.min(maxRows, Math.max(1, lineCount));
    setInputRows(newRows);
  };

  // Modify the initialization useEffect to only run when expanded
  useEffect(() => {
    // Only initialize chat when the companion is expanded or if there are messages
    if ((expanded || messages.length > 0) && userId) {
      initializeChat(userId);
      fetchLearningAnalytics(userId);
    }

    // If there's a current topic, suggest it as a first message
    if (currentTopic && !messages.length && expanded) {
      setInputText(`Tell me about ${currentTopic}`);
    }
  }, [
    expanded, // Add expanded as a dependency
    userId,
    initializeChat,
    fetchLearningAnalytics,
    currentTopic,
    messages.length,
  ]);

  // Initialize chat when component mounts
  useEffect(() => {
    if (expanded) {
      initializeChat(userId);

      // Initialize scroll position
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop =
            chatContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [expanded, userId, initializeChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current && expanded) {
      const isNearBottom =
        chatContainerRef.current.scrollHeight -
          chatContainerRef.current.scrollTop -
          chatContainerRef.current.clientHeight <
        100;

      // Check if we have a streaming message to ensure smooth scrolling during streaming
      const hasStreamingMessage = messages.some((m) => m.streaming);

      // If we're near the bottom or there's a streaming message, scroll to bottom
      if (isNearBottom || hasStreamingMessage || messages.length <= 2) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    }
  }, [messages, expanded]);

  // Handle click outside to collapse if in floating mode
  useEffect(() => {
    if (mode !== "floating" || !expanded) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        companionRef.current &&
        !companionRef.current.contains(event.target as Node)
      ) {
        setExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mode, expanded]);

  // Modify handleSendMessage function
  const handleSendMessage = (text: string = inputText.trim()) => {
    if (!text || isLoading) return;

    // Mark as interacted to track user engagement
    setHasInteracted(true);

    // Prepare context with all relevant info
    const context = {
      moduleContent: contextContent,
      moduleTitle: contextTitle,
      teachingStyle,
    };

    // Log interaction for debugging
    console.log("Sending message:", text);

    // Always use streaming for better UX
    sendMessage(userId, text, true, context);

    // Reset input field
    setInputText("");
    setInputRows(1);

    // Ensure we're in chat tab
    setActiveTab("chat");

    // Ensure the companion is expanded
    if (!expanded) {
      setExpanded(true);
    }

    // Scroll to bottom after sending message
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  // Handle concept click
  const handleConceptClick = (concept: string) => {
    setActiveConcept(concept);
    if (activeTab === "chat") {
      // If we're in the chat tab, send a message about the concept
      handleSendMessage(`Tell me more about "${concept}"`);
    } else {
      // Otherwise, just switch to the concepts tab
      setActiveTab("concepts");
    }
  };

  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded((prev) => !prev);

    // If expanding, focus the input field
    if (!expanded && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  };

  // Key handlers
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Update typing indicator to make it more visible
  const TypingIndicator = () => (
    <div className="flex items-center gap-2 pl-4 my-3 sticky bottom-1">
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md">
        <Bot className="w-3.5 h-3.5" />
      </div>
      <div className="flex items-center bg-gray-100 dark:bg-gray-800 py-1.5 px-3 rounded-full text-xs text-gray-500 dark:text-gray-400 shadow-sm">
        <span className="mr-2 font-medium">AI is thinking</span>
        <span className="flex space-x-1">
          <span
            className="w-1 h-1 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-ping"
            style={{ animationDelay: "0ms" }}
          ></span>
          <span
            className="w-1 h-1 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-ping"
            style={{ animationDelay: "300ms" }}
          ></span>
          <span
            className="w-1 h-1 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-ping"
            style={{ animationDelay: "600ms" }}
          ></span>
        </span>
      </div>
    </div>
  );

  // Get appropriate dimensions based on mode
  const getCompanionSize = () => {
    if (mode === "sidebar") {
      return expanded ? "w-80" : "w-12";
    } else {
      return expanded ? "w-80 h-[500px] max-h-[80vh]" : "w-12 h-12";
    }
  };

  // Render collapsed state
  const renderTabs = () => {
    return (
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={cn(
            "flex-1 px-2 py-1.5 text-xs font-medium transition-all duration-200",
            activeTab === "chat"
              ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500"
              : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
          )}
          onClick={() => setActiveTab("chat")}
        >
          <div className="flex items-center justify-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </div>
        </button>
        <button
          className={cn(
            "flex-1 px-2 py-1.5 text-xs font-medium transition-all duration-200",
            activeTab === "concepts"
              ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500"
              : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
          )}
          onClick={() => setActiveTab("concepts")}
        >
          <div className="flex items-center justify-center gap-1">
            <Brain className="w-3.5 h-3.5" />
            <span>Concepts</span>
          </div>
        </button>
        <button
          className={cn(
            "flex-1 px-2 py-1.5 text-xs font-medium transition-all duration-200",
            activeTab === "progress"
              ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-500"
              : "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
          )}
          onClick={() => setActiveTab("progress")}
        >
          <div className="flex items-center justify-center gap-1">
            <BarChart className="w-3.5 h-3.5" />
            <span>Progress</span>
          </div>
        </button>
      </div>
    );
  };

  // Generate immediate suggestions based on context
  const getContextSuggestions = (): string[] => {
    if (!contextTitle && !currentTopic) return [];

    return [
      `Tell me about ${currentTopic || contextTitle}`,
      `What are the key concepts in ${currentTopic || contextTitle}?`,
      `Explain ${currentTopic || contextTitle} in simple terms`,
      `Give me practice questions about ${currentTopic || contextTitle}`,
    ];
  };

  // Render the companion main UI
  return (
    <div
      ref={companionRef}
      className={cn(
        "fixed z-40 transition-all duration-300 ease-in-out",
        mode === "floating"
          ? expanded
            ? "bottom-4 right-4 w-80 h-[500px] max-h-[80vh]"
            : "bottom-4 right-4 w-12 h-12"
          : "inset-y-0 right-0 w-80 border-l border-gray-200",
        position === "left" && "left-4 right-auto"
      )}
    >
      <AnimatePresence>
        {!expanded ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shadow-lg",
              isApiAvailable
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-gray-600 hover:bg-gray-700 text-white"
            )}
            onClick={toggleExpanded}
          >
            <Bot className="w-6 h-6" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              "flex flex-col overflow-hidden rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-full",
              getCompanionSize()
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                    Learning Assistant
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(isLoading || isStreaming) && hasInteracted
                      ? "Thinking..."
                      : contextTitle || "How can I help you learn?"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {onMaximize && (
                  <button
                    onClick={onMaximize}
                    className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label="Maximize"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={toggleExpanded}
                  className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            {renderTabs()}

            {/* Content area based on active tab */}
            <div className="flex-1 overflow-hidden">
              {/* Chat tab content */}
              {activeTab === "chat" && (
                <div className="flex flex-col h-full">
                  {/* Messages display */}
                  <div
                    className="flex-1 p-4 overflow-y-auto scroll-smooth"
                    ref={chatContainerRef}
                  >
                    {!messages.length ? (
                      <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg mb-2">
                          AI Teacher Assistant
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                          Ask me anything about {currentTopic || "this topic"}
                        </p>
                        {getContextSuggestions().map((suggestion, index) => (
                          <button
                            key={index}
                            className="w-full mb-2 p-2 text-left text-sm rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800/40 transition-colors"
                            onClick={() => handleSendMessage(suggestion)}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <>
                        <MessageDisplay
                          messages={messages}
                          isLoading={isLoading && !hasInteracted}
                          isStreaming={isStreaming}
                          misconceptions={[]}
                          messageReactions={{}}
                          copiedMessageId={null}
                          savedMessages={[]}
                          learningLevel=""
                          teachingStyle={teachingStyle}
                          hasExercise={false}
                          showExercise={false}
                          exerciseAnswer=""
                          lastInteractionTime={null}
                          onReaction={() => {}}
                          onCopy={() => {}}
                          onSave={() => {}}
                          onExerciseSubmit={() => {}}
                          onExerciseChange={() => {}}
                          onGenerateExercise={() => {}}
                        />

                        {/* Only show the typing indicator if messages exist and we're streaming but no message has the streaming flag */}
                        {hasInteracted &&
                          isStreaming &&
                          !messages.some((m) => m.streaming) && (
                            <TypingIndicator />
                          )}
                      </>
                    )}
                  </div>

                  {/* Input area */}
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="relative">
                      <textarea
                        ref={inputRef}
                        value={inputText}
                        onChange={(e) => {
                          setInputText(e.target.value);
                          autoResizeInput(e.target.value);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={
                          isApiAvailable
                            ? "Ask a question..."
                            : "Service unavailable..."
                        }
                        className={cn(
                          "w-full pr-12 py-2 px-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all",
                          inputRows > 1 ? "h-auto" : "h-10",
                          isLoading || !isApiAvailable ? "opacity-50" : ""
                        )}
                        rows={inputRows}
                        disabled={isLoading || !isApiAvailable}
                      />
                      <button
                        className={cn(
                          "absolute right-2 bottom-2 rounded-full p-1.5",
                          inputText.trim() && !isLoading
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                        )}
                        onClick={() => handleSendMessage()}
                        disabled={
                          !inputText.trim() || isLoading || !isApiAvailable
                        }
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ArrowRight className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {followupQuestions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {followupQuestions.slice(0, 2).map((q, i) => (
                          <button
                            key={i}
                            className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800/40 transition-colors"
                            onClick={() => handleSendMessage(q)}
                          >
                            {q.length > 30 ? q.substring(0, 30) + "..." : q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Only render other tabs when actually in that tab to save performance */}
              {activeTab === "concepts" && (
                <div className="flex-1 overflow-y-auto p-3">
                  <h4 className="text-xs font-medium mb-2 text-gray-500 dark:text-gray-400 flex items-center">
                    <Brain className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                    <span>Key Concepts</span>
                  </h4>

                  {concepts.length > 0 ? (
                    <div className="space-y-2">
                      {concepts.map((concept, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleConceptClick(concept)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-md text-sm transition-all",
                            concept === activeConcept
                              ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium"
                              : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                          )}
                        >
                          {concept}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Brain className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No concepts identified yet
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Continue the conversation to explore concepts
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "progress" && (
                <div className="flex-1 overflow-y-auto p-3">
                  <h4 className="text-xs font-medium mb-2 text-gray-500 dark:text-gray-400 flex items-center">
                    <BarChart className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                    <span>Learning Progress</span>
                  </h4>

                  <div className="text-center py-8">
                    <BarChart className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Learning analytics will appear here as you learn
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      Continue asking questions to build your profile
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AITeacherCompanion;
