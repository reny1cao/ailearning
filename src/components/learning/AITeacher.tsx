import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, Loader2, Brain, BookOpen, HelpCircle, X } from 'lucide-react';
import { Button } from '../ui/button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'suggestion' | 'explanation' | 'summary' | 'question';
}

interface AITeacherProps {
  content: string;
  selectedText?: string;
  onClose: () => void;
}

const AITeacher: React.FC<AITeacherProps> = ({ content, selectedText, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: "Hi! I'm your AI teaching assistant. I'll help you understand this material better. Feel free to ask questions or highlight text for explanations.",
        type: 'suggestion'
      }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I understand your question. Let me help explain that concept in more detail...",
        type: 'explanation'
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const suggestionQuestions = [
    "Explain this simply",
    "Summarize key points",
    "Show examples",
    "Create practice question",
    "Generate study notes"
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-600" />
          <span className="font-medium text-gray-900">AI Teaching Assistant</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[85%] ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-indigo-100' 
                    : 'bg-violet-100'
                }`}
              >
                {message.role === 'user' ? (
                  <div className="w-3 h-3 rounded-full bg-indigo-600" />
                ) : (
                  <Bot className="w-3 h-3 text-violet-600" />
                )}
              </div>
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : message.type === 'suggestion'
                    ? 'bg-blue-50 text-blue-900'
                    : message.type === 'explanation'
                    ? 'bg-green-50 text-green-900'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center">
                <Bot className="w-3 h-3 text-violet-600" />
              </div>
              <div className="p-3 rounded-lg bg-gray-100">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Learning Tools */}
      <div className="px-4 py-2 border-t bg-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-medium text-gray-700">Quick Actions</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestionQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => setInput(question)}
              className="px-3 py-1.5 text-xs bg-white border rounded-full hover:bg-gray-50 text-gray-700 flex items-center gap-1.5 transition-colors"
            >
              {index === 0 && <HelpCircle className="w-3 h-3" />}
              {index === 1 && <BookOpen className="w-3 h-3" />}
              {index === 2 && <Sparkles className="w-3 h-3" />}
              <span className={isMobile ? 'line-clamp-1' : ''}>
                {question}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about this topic..."
            className="flex-1 px-4 py-2 text-sm bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-indigo-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4"
            size="sm"
          >
            <Send className="w-4 h-4" />
            <span className="ml-2 hidden sm:inline">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AITeacher;