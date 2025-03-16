import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  X,
  PlusCircle,
  Code,
  FileText,
  MessagesSquare,
  ListChecks,
  Lightbulb,
  Zap,
  Sparkles,
  BookOpen,
  RotateCcw,
  Download,
  Share2,
  Mic,
  MicOff,
  Copy,
  Check,
  Bookmark,
  BookmarkPlus,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { cn } from "../../lib/utils";

// Define message interface
interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  type?: "text" | "code" | "explanation" | "example" | "summary";
  timestamp: Date;
  bookmarked?: boolean;
  feedback?: "liked" | "disliked";
}

interface AITeacherProps {
  content?: string;
  selectedText?: string;
  onClose?: () => void;
}

const AITeacher: React.FC<AITeacherProps> = ({
  content,
  selectedText,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi there! I'm your AI learning assistant. How can I help you understand this material better?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionContext, setSessionContext] = useState<string>(content || "");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );

  // New state variables
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showExamples, setShowExamples] = useState(true);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isTyping, setIsTyping] = useState(false);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Suggestions for quick actions
  const suggestions = [
    {
      icon: <Lightbulb className="w-3.5 h-3.5" />,
      text: "Explain this concept",
      prompt: "Can you explain this concept in simpler terms?",
    },
    {
      icon: <Code className="w-3.5 h-3.5" />,
      text: "Show me code examples",
      prompt: "Can you provide code examples to illustrate this?",
    },
    {
      icon: <ListChecks className="w-3.5 h-3.5" />,
      text: "Quiz me",
      prompt: "Create a short quiz to test my understanding of this material.",
    },
    {
      icon: <Sparkles className="w-3.5 h-3.5" />,
      text: "Simplify",
      prompt: "Simplify this content for a beginner.",
    },
    {
      icon: <BookOpen className="w-3.5 h-3.5" />,
      text: "Summarize",
      prompt: "Summarize the key points of this content.",
    },
    {
      icon: <Zap className="w-3.5 h-3.5" />,
      text: "Give me a challenge",
      prompt: "Give me a challenging exercise related to this material.",
    },
  ];

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Initialize with selected text if provided
  useEffect(() => {
    if (selectedText && selectedText.trim() !== "") {
      setInput(
        `Can you explain this: "${selectedText.substring(0, 100)}${
          selectedText.length > 100 ? "..." : ""
        }"`
      );
    }
  }, [selectedText]);

  // New useEffect for recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    simulateResponse(input);
  };

  const simulateResponse = (userInput: string) => {
    setIsStreaming(true);

    // Create a placeholder for the streaming response
    const responseId = (Date.now() + 1).toString();
    const initialResponse: Message = {
      id: responseId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, initialResponse]);

    // Determine response type based on input
    let responseType: "text" | "code" | "explanation" | "example" | "summary" =
      "text";
    if (
      userInput.toLowerCase().includes("code") ||
      userInput.toLowerCase().includes("example")
    ) {
      responseType = "code";
    } else if (userInput.toLowerCase().includes("explain")) {
      responseType = "explanation";
    } else if (userInput.toLowerCase().includes("summarize")) {
      responseType = "summary";
    }

    // Sample responses based on type
    let fullResponse = "";
    switch (responseType) {
      case "code":
        fullResponse =
          "Here's an example code snippet:\n\n```javascript\nfunction calculateArea(radius) {\n  return Math.PI * radius * radius;\n}\n\nconst area = calculateArea(5);\nconsole.log(`The area is ${area.toFixed(2)} square units`);\n```\n\nThis code calculates the area of a circle given its radius. You can modify the radius value to get different results.";
        break;
      case "explanation":
        fullResponse =
          "Let me explain this concept:\n\nThis material is discussing how data structures are organized in memory and how algorithms can be optimized to work with these structures efficiently. The key insight is that by understanding the underlying hardware architecture, we can design algorithms that minimize cache misses and memory access times.\n\nThink of it like organizing your kitchen - if you keep frequently used items within easy reach, cooking becomes much faster and more efficient.";
        break;
      case "summary":
        fullResponse =
          "**Key Points Summary:**\n\n1. Data structures determine how information is stored and accessed in memory\n2. Efficient algorithms consider both theoretical complexity and practical hardware constraints\n3. Cache optimization can significantly improve real-world performance\n4. Space-time tradeoffs often involve balancing memory usage against computational speed\n5. The choice of data structure should match the specific access patterns of your application";
        break;
      default:
        fullResponse =
          "I understand you're asking about this topic. The concept you're looking at involves understanding how computational systems process and store information.\n\nWould you like me to go deeper into any specific aspect? I can provide examples, explanations, or practice exercises to help reinforce your understanding.";
    }

    // Simulate streaming by adding characters gradually
    let charIndex = 0;
    const streamInterval = setInterval(() => {
      if (charIndex < fullResponse.length) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === responseId
              ? {
                  ...msg,
                  content: fullResponse.substring(0, charIndex + 1),
                  type: responseType,
                }
              : msg
          )
        );
        charIndex++;
      } else {
        clearInterval(streamInterval);
        setIsLoading(false);
        setIsStreaming(false);
      }
    }, 10); // Adjust speed as needed
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt);
    // Focus on the input after selecting a suggestion
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "Conversation cleared. How can I help you with your learning?",
        timestamp: new Date(),
      },
    ]);
  };

  // New functions
  const toggleRecording = () => {
    if (!isRecording) {
      // Start recording - in a real app, this would use the Web Speech API
      setIsRecording(true);
      // Simulate recording for demo purposes
      setTimeout(() => {
        setIsRecording(false);
        setInput("Can you explain how machine learning algorithms work?");
      }, 3000);
    } else {
      // Stop recording
      setIsRecording(false);
    }
  };

  const copyMessageContent = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const toggleBookmark = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, bookmarked: !msg.bookmarked } : msg
      )
    );
  };

  const provideFeedback = (messageId: string, type: "liked" | "disliked") => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, feedback: type } : msg
      )
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // Show typing indicator
    setIsTyping(true);

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 1000);

    setTypingTimeout(timeout);
  };

  const renderMessageContent = (message: Message) => {
    // Simple markdown-like rendering
    if (message.content.includes("```")) {
      const parts = message.content.split(/```(\w*)\n/);
      return (
        <>
          {parts.map((part, index) => {
            if (index % 3 === 0) {
              // Text content
              return (
                <p key={index} className="whitespace-pre-wrap">
                  {part}
                </p>
              );
            } else if (index % 3 === 1) {
              // Language identifier
              return null;
            } else {
              // Code block
              return (
                <div
                  key={index}
                  className="bg-gray-800 text-gray-100 p-3 rounded-md my-2 font-mono text-sm overflow-x-auto relative group"
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyMessageContent(message.id, part)}
                      className="h-6 w-6 p-0 bg-gray-700 hover:bg-gray-600 rounded-md"
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="h-3 w-3 text-green-400" />
                      ) : (
                        <Copy className="h-3 w-3 text-gray-300" />
                      )}
                    </Button>
                  </div>
                  <pre>{part.replace(/```$/, "")}</pre>
                </div>
              );
            }
          })}
        </>
      );
    } else if (message.content.includes("**")) {
      // Bold text
      return (
        <div className="whitespace-pre-wrap">
          {message.content.split(/(\*\*.*?\*\*)/g).map((part, index) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={index}>{part.slice(2, -2)}</strong>;
            }
            return <span key={index}>{part}</span>;
          })}
        </div>
      );
    }

    return <p className="whitespace-pre-wrap">{message.content}</p>;
  };

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-md">
            <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              AI Learning Assistant
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Helping you understand concepts better
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExamples(!showExamples)}
            className="h-8 w-8 p-0 rounded-md"
            title={showExamples ? "Hide examples" : "Show examples"}
          >
            <PlusCircle
              className={`w-4 h-4 transition-transform ${
                showExamples ? "rotate-45" : "rotate-0"
              }`}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearConversation}
            className="h-8 w-8 p-0 rounded-md"
            title="Clear conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-md"
              title="Close"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex items-start gap-3 animate-in fade-in duration-200",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
              </div>
            )}

            <div
              className={cn(
                "rounded-xl px-4 py-3 max-w-[80%] group relative",
                message.role === "user"
                  ? "bg-indigo-600 text-white ml-auto"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              )}
            >
              {message.role === "assistant" && (
                <div className="absolute -left-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBookmark(message.id)}
                    className="h-6 w-6 p-0 rounded-md"
                    title={
                      message.bookmarked
                        ? "Remove bookmark"
                        : "Bookmark this response"
                    }
                  >
                    {message.bookmarked ? (
                      <Bookmark className="h-3.5 w-3.5 text-indigo-500" />
                    ) : (
                      <BookmarkPlus className="h-3.5 w-3.5 text-gray-400" />
                    )}
                  </Button>
                </div>
              )}

              {renderMessageContent(message)}

              {message.role === "assistant" && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => provideFeedback(message.id, "liked")}
                      className={cn(
                        "h-6 w-6 p-0 rounded-md",
                        message.feedback === "liked"
                          ? "text-green-500"
                          : "text-gray-400"
                      )}
                      title="This was helpful"
                      disabled={message.feedback !== undefined}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => provideFeedback(message.id, "disliked")}
                      className={cn(
                        "h-6 w-6 p-0 rounded-md",
                        message.feedback === "disliked"
                          ? "text-red-500"
                          : "text-gray-400"
                      )}
                      title="This wasn't helpful"
                      disabled={message.feedback !== undefined}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyMessageContent(message.id, message.content)
                      }
                      className="h-6 w-6 p-0 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Copy to clipboard"
                    >
                      {copiedMessageId === message.id ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {message.role === "user" && (
              <div className="bg-indigo-700 p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                <MessagesSquare className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && !isStreaming && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-pulse flex items-center gap-2">
              <div className="h-2 w-2 bg-indigo-600 dark:bg-indigo-400 rounded-full"></div>
              <div className="h-2 w-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animation-delay-200"></div>
              <div className="h-2 w-2 bg-indigo-600 dark:bg-indigo-400 rounded-full animation-delay-400"></div>
            </div>
          </div>
        )}

        {isTyping && !isLoading && (
          <div className="flex items-start gap-3">
            <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl px-4 py-3">
              <div className="animate-pulse flex items-center gap-1">
                <div className="h-1.5 w-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                <div className="h-1.5 w-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animation-delay-200"></div>
                <div className="h-1.5 w-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animation-delay-400"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showExamples && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-x-auto">
          <div className="flex gap-2 pb-2 items-center">
            {windowWidth > 640
              ? suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion.prompt)}
                    className="h-8 whitespace-nowrap text-xs flex items-center gap-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                  >
                    {suggestion.icon}
                    {suggestion.text}
                  </Button>
                ))
              : // Show fewer suggestions on mobile
                suggestions.slice(0, 3).map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion.prompt)}
                    className="h-8 whitespace-nowrap text-xs flex items-center gap-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                  >
                    {suggestion.icon}
                    {suggestion.text}
                  </Button>
                ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="relative">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this material..."
            className="min-h-[80px] pr-12 resize-none border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
            disabled={isLoading || isRecording}
          />
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <Button
              onClick={toggleRecording}
              disabled={isLoading}
              className={cn(
                "h-8 w-8 p-0 rounded-full",
                isRecording
                  ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
              title={isRecording ? "Stop recording" : "Start voice input"}
            >
              {isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || input.trim() === "" || isRecording}
              className={cn(
                "h-8 w-8 p-0 rounded-full",
                input.trim() === "" || isRecording
                  ? "opacity-70"
                  : "opacity-100"
              )}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {isRecording && (
            <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-black/5 backdrop-blur-[1px] rounded-md">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-pulse bg-red-500 h-4 w-4 rounded-full"></div>
                <span className="text-sm font-medium">
                  Recording... {formatTime(recordingTime)}
                </span>
                <span className="text-xs text-gray-500">
                  Click the microphone icon to stop
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <Download className="h-3 w-3 mr-1" />
              Save
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <Share2 className="h-3 w-3 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITeacher;
