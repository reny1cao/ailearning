import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  X,
  Send,
  Book,
  Lightbulb,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { getAIChatResponse } from "../../../lib/ai";
import { getSystemPrompt } from "../../../lib/deepseek";

interface AIChatProps {
  isVisible: boolean;
  onClose: () => void;
  currentModuleContent?: string;
  currentModuleTitle?: string;
}

interface ChatMessage {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  pending?: boolean;
}

const AIChat: React.FC<AIChatProps> = ({
  isVisible,
  onClose,
  currentModuleContent = "",
  currentModuleTitle = "",
}) => {
  const [inputText, setInputText] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize chat with welcome message
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hi! I'm your AI learning assistant. I can help you understand this content better. What would you like to know?",
        },
      ]);
    }
  }, [chatMessages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const suggestionButtons = [
    {
      text: "Explain this module's key concepts",
      icon: Book,
      action: () =>
        handleSuggestion(
          "Explain the key concepts in this module. Break down the most important ideas."
        ),
    },
    {
      text: "Quiz me on this content",
      icon: HelpCircle,
      action: () =>
        handleSuggestion(
          "Create a short quiz based on the content of this module to test my understanding."
        ),
    },
    {
      text: "Give me real-world examples",
      icon: Lightbulb,
      action: () =>
        handleSuggestion(
          "Provide some real-world examples that illustrate the concepts in this module."
        ),
    },
  ];

  const handleSuggestion = (text: string) => {
    if (isLoading) return;

    setInputText("");
    sendMessage(text);
  };

  const sendMessage = async (text: string = inputText.trim()) => {
    if (!text || isLoading) return;

    // Generate unique ID for this message
    const messageId = Date.now().toString();

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: messageId,
      role: "user",
      content: text,
    };

    // Add pending assistant message
    const pendingMessage: ChatMessage = {
      id: `${messageId}-response`,
      role: "assistant",
      content: "",
      pending: true,
    };

    setChatMessages((prev) => [...prev, userMessage, pendingMessage]);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Create messages array for API
      const systemMessage = {
        role: "system" as const,
        content:
          getSystemPrompt("tutor") +
          (currentModuleTitle
            ? `\nThe current module is titled: "${currentModuleTitle}".`
            : ""),
      };

      // Get all messages for context
      const allMessages = [
        systemMessage,
        ...chatMessages
          .filter((m) => m.role !== "system" && !m.pending)
          .map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: text },
      ];

      // Add module content as context if available
      if (currentModuleContent && currentModuleContent.trim()) {
        allMessages.splice(
          1,
          0,
          {
            role: "user" as const,
            content: `Here is the content of the current module: ${currentModuleContent.substring(
              0,
              4000
            )}`,
          },
          {
            role: "assistant" as const,
            content:
              "Thank you for providing the module content. I'll use this as context for our conversation.",
          }
        );
      }

      // Track response updates for streaming
      let responseContent = "";
      const handleUpdate = (content: string) => {
        responseContent += content;
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === `${messageId}-response`
              ? { ...msg, content: responseContent }
              : msg
          )
        );
      };

      // Get response from AI
      await getAIChatResponse(allMessages, handleUpdate);

      // Finalize the message
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === `${messageId}-response` ? { ...msg, pending: false } : msg
        )
      );
    } catch (error) {
      console.error("Chat error:", error);
      setErrorMessage("Sorry, something went wrong. Please try again.");

      // Update the pending message with error state
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === `${messageId}-response`
            ? {
                ...msg,
                content: "Sorry, I encountered an error. Please try again.",
                pending: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setInputText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setChatMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hi! I'm your AI learning assistant. I can help you understand this content better. What would you like to know?",
      },
    ]);
    setErrorMessage(null);
  };

  return (
    <div
      className={`fixed right-0 top-14 bottom-0 w-full md:w-[400px] bg-white border-l border-gray-200 shadow-lg transition-transform duration-300 ease-in-out transform ${
        isVisible ? "translate-x-0" : "translate-x-full"
      } z-30 pb-16 md:pb-0 flex flex-col`}
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <Bot className="w-4 h-4 text-indigo-600" />
          AI Learning Assistant
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={resetChat}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Reset chat"
            title="Reset chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Close AI chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4"
      >
        {chatMessages.map((message, index) => (
          <div
            key={message.id}
            className={`p-3 ${
              message.role === "user"
                ? "bg-indigo-50 border border-indigo-100 ml-8"
                : "bg-white border border-gray-100"
            } rounded-lg ${
              message.role === "user" ? "rounded-tr-none" : "rounded-tl-none"
            } shadow-sm ${message.role === "assistant" ? "mr-8" : ""}`}
          >
            <div className="flex items-start gap-3">
              {message.role === "assistant" && (
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mt-1 flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div className="flex-1">
                <p
                  className={`text-sm ${
                    message.role === "user"
                      ? "text-indigo-800"
                      : "text-gray-700"
                  } ${
                    message.pending
                      ? 'after:content-["▋"] after:animate-blink after:text-indigo-500 after:ml-1'
                      : ""
                  }`}
                >
                  {message.content || (message.pending ? "Thinking..." : "")}
                </p>

                {/* Show suggestion buttons only for the welcome message */}
                {message.id === "welcome" && (
                  <div className="grid grid-cols-1 gap-2 mt-3">
                    {suggestionButtons.map((button, idx) => (
                      <button
                        key={idx}
                        className="text-xs text-left px-3 py-2 bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors flex items-center gap-2"
                        onClick={button.action}
                        disabled={isLoading}
                      >
                        <button.icon className="w-3 h-3" />
                        {button.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white mt-1 flex-shrink-0">
                  <span className="text-xs font-medium">You</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-200 bg-white">
        <div className="relative">
          <textarea
            placeholder="Ask the AI tutor a question..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm min-h-[80px] resize-none"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            className={`absolute right-3 bottom-3 p-1.5 ${
              inputText.trim() && !isLoading
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-300 cursor-not-allowed"
            } text-white rounded-lg transition-colors`}
            disabled={!inputText.trim() || isLoading}
            onClick={() => sendMessage()}
            aria-label="Send message"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
