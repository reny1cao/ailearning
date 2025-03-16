import React from "react";
import {
  PenTool,
  ChevronDown,
  Book,
  AlignLeft,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface ModuleHeaderProps {
  title: string;
  moduleIndex: number;
  totalModules: number;
  showAIChat: boolean;
  setShowAIChat: (show: boolean) => void;
  onFontSizeChange: () => void;
}

const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  title,
  moduleIndex,
  totalModules,
  showAIChat,
  setShowAIChat,
  onFontSizeChange,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4 md:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-20 shadow-sm">
      <div className="flex-1">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-1">
          <Book className="w-3.5 h-3.5 text-indigo-500" />
          <span>
            Module {moduleIndex + 1} of {totalModules}
          </span>
          <span className="text-gray-300 mx-0.5">•</span>
          <div className="flex items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></span>
            <span>In Progress</span>
          </div>
        </div>
        
        <h1 className="font-bold text-gray-800 text-xl leading-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center">
          <div className="relative group">
            <button
              onClick={onFontSizeChange}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
              aria-label="Text options"
            >
              <AlignLeft className="w-5 h-5" />
            </button>
            <div className="hidden group-hover:block absolute right-0 top-full mt-1 bg-white shadow-lg rounded-lg p-2 border border-gray-200 w-60 z-30">
              <div className="text-sm font-medium text-gray-700 mb-2 px-2">
                Text Options
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button className="p-2 text-xs flex flex-col items-center justify-center rounded hover:bg-gray-100 transition-colors">
                  <Minimize2 className="w-4 h-4 mb-1" />
                  <span>Small</span>
                </button>
                <button className="p-2 text-xs flex flex-col items-center justify-center rounded bg-indigo-50 text-indigo-600">
                  <AlignLeft className="w-4 h-4 mb-1" />
                  <span>Medium</span>
                </button>
                <button className="p-2 text-xs flex flex-col items-center justify-center rounded hover:bg-gray-100 transition-colors">
                  <Maximize2 className="w-4 h-4 mb-1" />
                  <span>Large</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onFontSizeChange}
          className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
          aria-label="Change font size"
        >
          <PenTool className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ModuleHeader;
