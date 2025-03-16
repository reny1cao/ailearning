import React, { useEffect, useRef } from "react";
import {
  Bot,
  User,
  Info,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Bookmark,
  Lightbulb,
  Puzzle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { marked } from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { Message, TeachingStyle } from "../../../types/shared";
import MisconceptionAlert from "./MisconceptionAlert";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { CopyButton } from "../../../components/CopyButton";
import { Sparkles } from "lucide-react";

// Use highlight.js for code highlighting
marked.setOptions({
  highlight: function (code, lang) {
    const language = hljs.getLanguage(lang) ? lang : "plaintext";
    return hljs.highlight(code, { language }).value;
  },
});

// Add class names to rendered elements for better styling
const renderer = new marked.Renderer();
renderer.code = function (code, language) {
  const validLanguage = hljs.getLanguage(language) ? language : "plaintext";
  const highlightedCode = hljs.highlight(code, {
    language: validLanguage,
  }).value;
  return `<pre class="hljs rounded-md"><code class="language-${validLanguage}">${highlightedCode}</code></pre>`;
};

// Configure marked with our custom renderer
marked.use({ renderer });

interface MessageDisplayProps {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  misconceptions: any[];
  messageReactions: Record<number, "like" | "dislike" | null>;
  copiedMessageId: number | null;
  savedMessages: number[];
  learningLevel: string;
  teachingStyle: TeachingStyle;
  hasExercise: boolean;
  showExercise: boolean;
  exerciseAnswer: string;
  lastInteractionTime: Date | null;
  onReaction: (messageIndex: number, reaction: "like" | "dislike") => void;
  onCopy: (messageIndex: number) => void;
  onSave: (messageIndex: number) => void;
  onExerciseSubmit: () => void;
  onExerciseChange: (text: string) => void;
  onGenerateExercise: () => void;
}

/**
 * Displays chat messages with formatting, reactions, and interactive elements
 */
const MessageDisplay: React.FC<MessageDisplayProps> = ({
  messages,
  isLoading,
  isStreaming,
  misconceptions,
  messageReactions,
  copiedMessageId,
  savedMessages,
  learningLevel,
  teachingStyle,
  hasExercise,
  showExercise,
  exerciseAnswer,
  lastInteractionTime,
  onReaction,
  onCopy,
  onSave,
  onExerciseSubmit,
  onExerciseChange,
  onGenerateExercise,
}) => {
  // Create a ref for scrolling to the bottom of messages
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change or when streaming
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isStreaming]);

  // Render message content with markdown
  const renderMessageContent = (
    content: string,
    isStreamingMessage: boolean = false
  ) => {
    if (!content.trim() && isStreamingMessage) {
      // Show a nice typing indicator for empty streaming messages
      return (
        <div className="flex space-x-2 p-1 items-center">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      );
    }

    // Process Markdown with basic features only (no math or advanced syntax highlighting)
    // This simplifies the rendering to avoid dependency issues
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "text";

            // Handle inline code
            if (inline) {
              return (
                <code
                  className="px-1.5 py-0.5 mx-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono text-pink-600 dark:text-pink-400"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // For code blocks, use Prism highlighting
            return (
              <div className="relative group rounded-md overflow-hidden">
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CopyButton
                    text={String(children).replace(/\n$/, "")}
                    onCopy={() => {}}
                  />
                </div>
                <div className="bg-gray-900 py-1 px-4 text-xs text-gray-400 border-b border-gray-800 font-mono flex items-center">
                  <span>{language}</span>
                </div>
                <SyntaxHighlighter
                  language={language}
                  style={coldarkDark}
                  PreTag="div"
                  className="syntax-highlighter rounded-b-md"
                  showLineNumbers={true}
                  wrapLines={true}
                  customStyle={{
                    margin: 0,
                    padding: "1rem",
                    backgroundColor: "#1e1e2e",
                    borderRadius: "0 0 0.375rem 0.375rem",
                    fontSize: "0.875rem",
                  }}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            );
          },
          h1: ({ node, ...props }) => (
            <h1
              className="text-2xl font-bold my-4 pb-1 border-b border-gray-200 dark:border-gray-800"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-xl font-bold my-3 pb-1 border-b border-gray-200 dark:border-gray-800"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-bold my-3" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-5 my-3 space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-5 my-3 space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => <li className="my-1" {...props} />,
          p: ({ node, ...props }) => (
            <p className="my-2 leading-relaxed" {...props} />
          ),
          a: ({ node, href, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
              {...props}
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 py-1 my-3 text-gray-700 dark:text-gray-300 italic bg-gray-50 dark:bg-gray-800/50 rounded-r-md"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table
                className="min-w-full border-collapse border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden"
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead
              className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              {...props}
            />
          ),
          tbody: ({ node, ...props }) => (
            <tbody
              className="divide-y divide-gray-200 dark:divide-gray-700"
              {...props}
            />
          ),
          tr: ({ node, ...props }) => (
            <tr
              className="even:bg-gray-50 dark:even:bg-gray-900/30"
              {...props}
            />
          ),
          th: ({ node, ...props }) => (
            <th
              className="px-4 py-2 text-left text-sm font-medium"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 text-sm" {...props} />
          ),
          pre: ({ node, ...props }) => (
            <pre className="my-3 p-0 rounded-md bg-transparent" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em
              className="italic text-gray-700 dark:text-gray-300"
              {...props}
            />
          ),
          strong: ({ node, ...props }) => (
            <strong
              className="font-bold text-gray-900 dark:text-gray-100"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr
              className="my-4 border-gray-200 dark:border-gray-800"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  // Animation for messages
  const getMessageAnimation = (index: number, isUser: boolean) => {
    return cn(
      "animate-fadeIn",
      isUser ? "animate-slideInRight" : "animate-slideInLeft"
    );
  };

  // Render message actions for a specific message
  const renderMessageActions = (message: Message, index: number) => {
    if (message.role === "user") return null;

    return (
      <div className="flex items-center mt-3 space-x-2 text-gray-400 text-xs">
        <button
          onClick={() => onReaction(index, "like")}
          className={cn(
            "p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
            messageReactions[index] === "like" ? "text-green-500" : ""
          )}
          aria-label="Like this response"
          title="Helpful"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onReaction(index, "dislike")}
          className={cn(
            "p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
            messageReactions[index] === "dislike" ? "text-red-500" : ""
          )}
          aria-label="Dislike this response"
          title="Not helpful"
        >
          <ThumbsDown className="w-3.5 h-3.5" />
        </button>

        <div className="border-r border-gray-200 dark:border-gray-700 h-4 mx-1"></div>

        <button
          onClick={() => onCopy(index)}
          className={cn(
            "p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
            copiedMessageId === index ? "text-blue-500" : ""
          )}
          aria-label="Copy message"
          title={copiedMessageId === index ? "Copied!" : "Copy message"}
        >
          {copiedMessageId === index ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>

        <button
          onClick={() => onSave(index)}
          className={cn(
            "p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
            savedMessages.includes(index) ? "text-yellow-500" : ""
          )}
          aria-label={
            savedMessages.includes(index) ? "Unsave message" : "Save message"
          }
          title={savedMessages.includes(index) ? "Unsave" : "Save for later"}
        >
          <Bookmark className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  // Render interactive elements for exercise
  const renderExerciseInterface = () => {
    if (!showExercise) return null;

    return (
      <div className="mt-4 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 bg-indigo-50 dark:bg-indigo-900/20">
        <h4 className="font-medium text-sm mb-2 text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
          <Puzzle className="w-4 h-4" />
          <span>Your Answer</span>
        </h4>

        <textarea
          value={exerciseAnswer}
          onChange={(e) => onExerciseChange(e.target.value)}
          placeholder="Type your answer here..."
          className="w-full p-3 border border-indigo-200 dark:border-indigo-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-gray-100 resize-none mb-3"
          rows={4}
        />

        <div className="flex justify-end">
          <button
            onClick={onExerciseSubmit}
            disabled={!exerciseAnswer.trim()}
            className={cn(
              "px-4 py-2 rounded-md font-medium text-sm transition-all",
              exerciseAnswer.trim()
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            )}
          >
            Submit Answer
          </button>
        </div>
      </div>
    );
  };

  // Render misconception alerts if any
  const renderMisconceptions = () => {
    if (!misconceptions || misconceptions.length === 0) return null;

    return (
      <div className="mb-4 border border-yellow-200 rounded-md p-2 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
        <h4 className="font-medium text-sm flex items-center gap-1 text-yellow-800 dark:text-yellow-300 mb-2">
          <AlertCircle className="w-4 h-4" />
          <span>Potential Misconceptions</span>
        </h4>
        {misconceptions.map((item, index) => (
          <MisconceptionAlert
            key={index}
            misconception={item}
            onDismiss={() => {
              // Could implement a dismiss functionality for misconceptions
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="chat-container flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto px-2 md:px-4 py-3 space-y-6">
        {messages.map((message, index) => {
          const isUser = message.role === "user";
          const isStreaming = !!message.streaming;

          return (
            <div
              key={index}
              className={cn(
                "message-wrapper",
                getMessageAnimation(index, isUser),
                isStreaming ? "streaming-message" : ""
              )}
            >
              <div
                className={cn(
                  "flex items-start gap-3 rounded-2xl p-4 mb-1 max-w-[90%] md:max-w-[85%]",
                  isUser
                    ? "bg-blue-600 text-white self-end rounded-br-none shadow-sm"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 self-start rounded-tl-none shadow-sm"
                )}
              >
                <div className="flex-shrink-0 pt-1">
                  {isUser ? (
                    <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white">
                      <User className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-hidden">
                  <div
                    className={cn(
                      "prose max-w-none",
                      isUser
                        ? "prose-invert"
                        : "prose-gray dark:prose-invert prose-headings:text-gray-800 dark:prose-headings:text-white"
                    )}
                  >
                    {renderMessageContent(message.content, isStreaming)}
                  </div>
                </div>
              </div>

              {!isUser && !isStreaming && (
                <div className="flex items-center justify-end mt-1 px-2 space-x-1">
                  {renderMessageActions(message, index)}
                </div>
              )}
            </div>
          );
        })}

        {isLoading && messages.length === 0 && (
          <div className="flex justify-center items-center h-40">
            <div className="loading-pulse">
              <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
            </div>
          </div>
        )}

        {/* Scroll anchor element */}
        <div ref={messagesEndRef} />
      </div>

      {/* Other UI components like misconception alerts, etc. */}
      {renderMisconceptions()}
      {renderExerciseInterface()}

      {/* Add some CSS for animations */}
      <style jsx global>{`
        .streaming-message .prose p:last-child::after {
          content: "";
          display: inline-block;
          width: 6px;
          height: 15px;
          background-color: currentColor;
          margin-left: 4px;
          animation: blink 1s step-end infinite;
          opacity: 0.7;
          vertical-align: middle;
        }

        @keyframes blink {
          0%,
          100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }

        .typing-indicator {
          display: flex;
          align-items: center;
        }

        .typing-indicator span {
          height: 8px;
          width: 8px;
          background-color: #999;
          border-radius: 50%;
          display: inline-block;
          margin-right: 3px;
          animation: bounce 1.5s infinite ease-in-out;
        }

        .typing-indicator span:nth-child(1) {
          animation-delay: 0s;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
          margin-right: 0;
        }

        @keyframes bounce {
          0%,
          60%,
          100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-4px);
          }
        }

        .loading-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default MessageDisplay;
