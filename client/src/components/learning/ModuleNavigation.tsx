import React, { ReactNode } from "react";
import { Sheet, SheetTrigger } from "../ui/sheet";
import {
  ArrowLeft,
  ArrowRight,
  Menu,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Settings,
  Maximize,
  Minimize,
  Home,
  HelpCircle,
} from "lucide-react";

interface ModuleNavigationProps {
  currentIndex: number;
  totalModules: number;
  title: string;
  estimatedTime: number;
  isCompleted: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
  onToggleSidebar: () => void;
  children?: ReactNode;
  onToggleFocusMode?: () => void;
  focusMode?: boolean;
}

const ModuleNavigation: React.FC<ModuleNavigationProps> = ({
  currentIndex,
  totalModules,
  title,
  estimatedTime,
  isCompleted,
  onPrevious,
  onNext,
  onBack,
  onComplete,
  onToggleSidebar,
  children,
  onToggleFocusMode,
  focusMode = false,
}) => {
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < totalModules - 1;

  return (
    <div className="border-b border-gray-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between py-2 px-4 shadow-sm sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        {/* Mobile Menu Trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Open Course Navigation"
              onClick={onToggleSidebar}
            >
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          {children}
        </Sheet>

        {/* Desktop Back Button */}
        <button
          onClick={onBack}
          className="hidden sm:flex items-center text-gray-500 hover:text-gray-800 text-sm font-medium bg-white hover:bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors duration-200"
        >
          <Home className="w-4 h-4 mr-1.5" />
          <span>Dashboard</span>
        </button>

        {/* Mobile Back Button */}
        <button
          onClick={onBack}
          className="sm:hidden p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="h-5 w-px bg-gray-200 hidden sm:block"></div>

        {/* Module Progress */}
        <div className="hidden sm:block text-sm text-gray-600">
          <span className="font-medium">
            Module {currentIndex + 1}/{totalModules}
          </span>
        </div>
      </div>

      {/* Title & Status (Center) */}
      <div className="flex-1 flex flex-col sm:items-center justify-center py-1 sm:py-0">
        <h1 className="text-base font-medium text-gray-900 truncate max-w-sm">
          {title}
        </h1>
        <div className="flex items-center text-xs text-gray-500 gap-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {estimatedTime} min
          </span>
          {isCompleted && (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-3 h-3" />
              Completed
            </span>
          )}
        </div>
      </div>

      {/* Navigation Controls (Right) */}
      <div className="flex items-center space-x-3 mt-2 sm:mt-0">
        {/* Focus Mode Toggle */}
        {onToggleFocusMode && (
          <button
            onClick={onToggleFocusMode}
            className="hidden sm:flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
            title={focusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
          >
            {focusMode ? (
              <Maximize className="w-4 h-4" />
            ) : (
              <Minimize className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Help Button */}
        <button
          className="hidden sm:flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Get Help"
          title="Get Help"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Module Navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onPrevious}
            disabled={!hasPrevious}
            className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
              hasPrevious
                ? "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                : "text-gray-300 cursor-not-allowed"
            }`}
            aria-label="Previous Module"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={isCompleted ? onNext : onComplete}
            disabled={!hasNext && isCompleted}
            className={`flex items-center px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isCompleted
                ? hasNext
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {isCompleted
              ? hasNext
                ? "Next Module"
                : "Completed"
              : "Mark Complete"}
            {isCompleted && hasNext && (
              <ChevronRight className="w-4 h-4 ml-1" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleNavigation;
