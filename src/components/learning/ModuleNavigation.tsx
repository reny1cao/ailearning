import React from 'react';
import { ChevronLeft, ChevronRight, Clock, BookOpen, CheckCircle, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetTrigger, SheetContent } from '../ui/sheet';

interface ModuleNavigationProps {
  currentIndex: number;
  totalModules: number;
  onPrevious: () => void;
  onNext: () => void;
  onBack: () => void;
  onComplete: () => void;
  title: string;
  estimatedTime: number;
  isCompleted: boolean;
  onToggleSidebar: () => void;
  children?: React.ReactNode; // Add this to accept Sheet content
}

const ModuleNavigation: React.FC<ModuleNavigationProps> = ({
  currentIndex,
  totalModules,
  onPrevious,
  onNext,
  onComplete,
  title,
  estimatedTime,
  isCompleted,
  onToggleSidebar,
  children // Sheet content will be passed here
}) => {
  return (
    <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
      {/* Main Navigation Bar */}
      <div className="h-12 flex items-center px-3 lg:px-4">
        {/* Left Section - Sidebar Toggle and Title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              {children} {/* Render Sheet content here */}
            </Sheet>
          </div>
          <Button
            onClick={onToggleSidebar}
            variant="ghost"
            size="icon"
            className="h-7 w-7 hidden lg:flex"
          >
            <Menu className="w-4 h-4" />
          </Button>

          <h1 className="text-sm font-medium text-gray-900 truncate">
            {title}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Module Info */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              {estimatedTime} min
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <BookOpen className="w-4 h-4" />
              {currentIndex + 1} / {totalModules}
            </div>
          </div>

          {/* Module Navigation */}
          <div className="flex items-center gap-1">
            <Button
              onClick={onPrevious}
              disabled={currentIndex === 0}
              variant="ghost"
              size="icon"
              className="h-7 w-7"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              onClick={onNext}
              disabled={currentIndex === totalModules - 1}
              variant="ghost"
              size="icon"
              className="h-7 w-7"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Complete Button */}
          <Button
            onClick={onComplete}
            size="sm"
            className={`h-7 w-7 rounded-full p-0 ${
              isCompleted 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isCompleted ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <span className="text-sm">✓</span>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Info Bar */}
      <div className="lg:hidden bg-gray-50 px-3 py-1.5">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {estimatedTime} min
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              Module {currentIndex + 1} of {totalModules}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleNavigation;