import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Layout,
  Bot,
  Settings,
  ArrowLeft,
  BookOpen,
  Search,
  User,
  Bell,
  Menu,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface LearningHeaderProps {
  courseTitle: string;
  showAIChat: boolean;
  showSidebar?: boolean;
  setShowAIChat: (show: boolean) => void;
  toggleSidebar: () => void;
}

const LearningHeader: React.FC<LearningHeaderProps> = ({
  courseTitle,
  showAIChat,
  showSidebar = false,
  setShowAIChat,
  toggleSidebar,
}) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white h-14 flex items-center px-3 md:px-5 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
            aria-label="Go to dashboard"
          >
            <Home className="w-5 h-5" />
          </button>

          {/* Mobile-only sidebar toggle button */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors md:hidden"
            aria-label="Toggle sidebar"
          >
            <Layout className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center">
            <div className="w-px h-6 bg-gray-200 mx-2"></div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <h1 className="text-sm font-semibold text-gray-800 truncate max-w-[150px] sm:max-w-xs md:max-w-md">
                {courseTitle}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:block relative group">
            <button
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <div className="hidden group-hover:block absolute right-0 top-full mt-1 p-2 bg-white rounded-lg shadow-lg border border-gray-200 w-64">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search in course..."
                  className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          <button
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
              showAIChat
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-500 hover:text-indigo-600"
            }`}
            onClick={() => setShowAIChat(!showAIChat)}
            aria-label="Toggle AI assistant"
          >
            <Bot className="w-5 h-5" />
          </button>

          <div className="hidden sm:block relative">
            <button
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 w-64 z-50">
                <div className="py-1">
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4 mr-2" /> Profile Settings
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Bell className="w-4 h-4 mr-2" /> Notifications
                  </a>
                  <div className="h-px bg-gray-200 my-1"></div>
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Help Center
                  </a>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="hidden md:flex items-center gap-1.5 ml-1 px-3 py-2 text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
            aria-label="Exit to dashboard"
          >
            <span>Exit</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          {/* Mobile menu button */}
          <button
            className="sm:hidden p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
            onClick={() => setShowMenu(!showMenu)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile menu */}
          {showMenu && (
            <div className="absolute top-14 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-40 sm:hidden">
              <div className="p-3">
                <div className="flex items-center gap-1.5 p-2 mb-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <h1 className="text-sm font-medium text-gray-800 truncate">
                    {courseTitle}
                  </h1>
                </div>
                <div className="space-y-1">
                  <a
                    href="#"
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <Search className="w-4 h-4 mr-2 text-gray-500" /> Search
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <Settings className="w-4 h-4 mr-2 text-gray-500" /> Settings
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <Bell className="w-4 h-4 mr-2 text-gray-500" />{" "}
                    Notifications
                  </a>
                  <div className="h-px bg-gray-200 my-1"></div>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2 text-gray-500" /> Exit to
                    Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default LearningHeader;
